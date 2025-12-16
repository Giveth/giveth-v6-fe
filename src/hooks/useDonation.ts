/**
 * useDonation Hook
 *
 * Provides functionality for making donations using the donation handler contract
 * with support for EIP-7702 and EIP-5792 batch transactions.
 *
 * Features:
 * - Single transaction for token approval + donation
 * - Batch donations to multiple projects
 * - Status tracking and error handling
 * - Fallback to sequential transactions
 */

import { useState, useCallback } from 'react'
import { sendTransaction, waitForReceipt, encode } from 'thirdweb'
import { useActiveAccount } from 'thirdweb/react'
import {
  getDonationHandlerContract,
  getERC20Contract,
  prepareDonateManyERC20,
  prepareDonateManyETH,
  prepareTokenApproval,
  DONATION_HANDLER_ADDRESSES,
  type DonationDetails,
  type BatchDonationDetails,
} from '@/lib/contracts/donation-handler'
import {
  sendBatchCalls,
  waitForBatchCalls,
  checkWalletCapabilities,
  type Call,
} from '@/lib/web3/batch-transactions'

export type DonationStatus =
  | 'idle'
  | 'preparing'
  | 'awaiting_approval'
  | 'processing'
  | 'confirming'
  | 'success'
  | 'error'

export interface DonationState {
  status: DonationStatus
  bundleId?: string
  transactionHash?: string
  error?: string
  supportsEIP5792: boolean
  supportsEIP7702: boolean
}

export interface UseDonationReturn {
  state: DonationState
  donate: (details: DonationDetails) => Promise<void>
  batchDonate: (details: BatchDonationDetails) => Promise<void>
  reset: () => void
}

/**
 * Hook for handling donations with EIP-5792 batch transactions
 */
export function useDonation(): UseDonationReturn {
  const account = useActiveAccount()
  const [state, setState] = useState<DonationState>({
    status: 'idle',
    supportsEIP5792: false,
    supportsEIP7702: false,
  })

  // Reset state
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      supportsEIP5792: false,
      supportsEIP7702: false,
    })
  }, [])

  /**
   * Execute a single donation
   */
  const donate = useCallback(
    async (details: DonationDetails) => {
      if (!account) {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: 'Please connect your wallet',
        }))
        return
      }

      try {
        setState(prev => ({ ...prev, status: 'preparing' }))

        // Get contract
        const donationContract = getDonationHandlerContract(details.chainId)
        const donationHandlerAddress =
          DONATION_HANDLER_ADDRESSES[details.chainId]

        // Check wallet capabilities
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const provider = (account as any).wallet?.getProvider?.()
        const capabilities = provider
          ? await checkWalletCapabilities(provider)
          : {
              supportsEIP5792: false,
              supportsEIP7702: false,
              supportsAtomicBatch: false,
            }

        setState(prev => ({
          ...prev,
          supportsEIP5792: capabilities.supportsEIP5792,
          supportsEIP7702: capabilities.supportsEIP7702,
        }))

        // Check if native token
        const isNativeToken =
          !details.tokenAddress ||
          details.tokenAddress === '0x0000000000000000000000000000000000000000'

        // For single donation, use donateManyERC20/ETH with one recipient
        const donationTx = isNativeToken
          ? prepareDonateManyETH(
              donationContract,
              details.amount,
              [details.projectAddress],
              [details.amount],
              [],
            )
          : prepareDonateManyERC20(
              donationContract,
              details.tokenAddress,
              details.amount,
              [details.projectAddress],
              [details.amount],
              [],
            )

        // Native tokens don't need approval
        if (isNativeToken) {
          // Just send the transaction
          setState(prev => ({ ...prev, status: 'awaiting_approval' }))

          const receipt = await sendTransaction({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transaction: donationTx as any,
            account,
          })

          setState(prev => ({ ...prev, status: 'confirming' }))
          const finalReceipt = await waitForReceipt(receipt)

          setState(prev => ({
            ...prev,
            status: 'success',
            transactionHash: finalReceipt.transactionHash,
          }))
          return
        }

        // For ERC20 tokens, need approval first
        const tokenContract = getERC20Contract(details.tokenAddress)

        const approvalTx = prepareTokenApproval(
          tokenContract,
          donationHandlerAddress,
          details.amount,
        )

        // Try EIP-5792 batch transaction first
        if (provider && capabilities.supportsAtomicBatch) {
          setState(prev => ({ ...prev, status: 'awaiting_approval' }))

          const approvalData = await encode(approvalTx)

          const calls: Call[] = [
            {
              to: details.tokenAddress,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: approvalData as any,
            },
            {
              to: donationHandlerAddress,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: donationTx.data as any,
            },
          ]

          const { bundleId } = await sendBatchCalls({
            account,
            calls,
            chainId: details.chainId,
          })

          setState(prev => ({
            ...prev,
            status: 'confirming',
            bundleId,
          }))

          // Wait for confirmation
          const result = await waitForBatchCalls(provider, bundleId)

          if (result.status === 'CONFIRMED') {
            const txHash = result.receipts?.[0]?.transactionHash
            setState(prev => ({
              ...prev,
              status: 'success',
              transactionHash: txHash,
            }))
          } else {
            throw new Error('Batch transaction failed')
          }
        } else {
          // Fallback to sequential transactions
          console.warn(
            'Wallet does not support EIP-5792. Falling back to sequential transactions.',
          )

          // 1. Approve tokens
          setState(prev => ({ ...prev, status: 'awaiting_approval' }))
          const approvalReceipt = await sendTransaction({
            transaction: approvalTx,
            account,
          })
          await waitForReceipt(approvalReceipt)

          // 2. Execute donation
          setState(prev => ({ ...prev, status: 'processing' }))
          const donationReceipt = await sendTransaction({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transaction: donationTx as any,
            account,
          })

          setState(prev => ({ ...prev, status: 'confirming' }))
          const receipt = await waitForReceipt(donationReceipt)

          setState(prev => ({
            ...prev,
            status: 'success',
            transactionHash: receipt.transactionHash,
          }))
        }
      } catch (error) {
        console.error('Donation failed:', error)
        setState(prev => ({
          ...prev,
          status: 'error',
          error:
            error instanceof Error
              ? error.message
              : 'Failed to process donation',
        }))
      }
    },
    [account],
  )

  /**
   * Execute batch donations to multiple projects
   */
  const batchDonate = useCallback(
    async (details: BatchDonationDetails) => {
      if (!account) {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: 'Please connect your wallet',
        }))
        return
      }

      try {
        setState(prev => ({ ...prev, status: 'preparing' }))

        // Get contract
        const donationContract = getDonationHandlerContract(details.chainId)
        const donationHandlerAddress =
          DONATION_HANDLER_ADDRESSES[details.chainId]

        // Check wallet capabilities
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const provider = (account as any).wallet?.getProvider?.()
        const capabilities = provider
          ? await checkWalletCapabilities(provider)
          : {
              supportsEIP5792: false,
              supportsEIP7702: false,
              supportsAtomicBatch: false,
            }

        setState(prev => ({
          ...prev,
          supportsEIP5792: capabilities.supportsEIP5792,
          supportsEIP7702: capabilities.supportsEIP7702,
        }))

        const recipients = details.donations.map(d => d.projectAddress)
        const amounts = details.donations.map(d => d.amount)

        // Check if donating native token (ETH/MATIC) or ERC20
        const isNativeToken =
          !details.tokenAddress ||
          details.tokenAddress === '0x0000000000000000000000000000000000000000'

        // Native tokens don't need approval
        if (isNativeToken) {
          const batchDonationTx = prepareDonateManyETH(
            donationContract,
            details.totalAmount,
            recipients,
            amounts,
            [],
          )

          // Just send the transaction
          setState(prev => ({ ...prev, status: 'awaiting_approval' }))

          const receipt = await sendTransaction({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transaction: batchDonationTx as any,
            account,
          })

          setState(prev => ({ ...prev, status: 'confirming' }))
          const finalReceipt = await waitForReceipt(receipt)

          setState(prev => ({
            ...prev,
            status: 'success',
            transactionHash: finalReceipt.transactionHash,
          }))
          return
        }

        // For ERC20, prepare batch donation
        const batchDonationTx = prepareDonateManyERC20(
          donationContract,
          details.tokenAddress,
          details.totalAmount,
          recipients,
          amounts,
          [],
        )

        // For ERC20 tokens, prepare approval
        const tokenContract = getERC20Contract(details.tokenAddress)

        const approvalTx = prepareTokenApproval(
          tokenContract,
          donationHandlerAddress,
          details.totalAmount,
        )

        // Try EIP-5792 batch transaction first
        if (provider && capabilities.supportsAtomicBatch) {
          setState(prev => ({ ...prev, status: 'awaiting_approval' }))

          const approvalData = await encode(approvalTx)
          const donationData = await encode(batchDonationTx)

          const calls: Call[] = [
            {
              to: details.tokenAddress,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: approvalData as any,
            },
            {
              to: donationHandlerAddress,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data: donationData as any,
            },
          ]

          const { bundleId } = await sendBatchCalls({
            account,
            calls,
            chainId: details.chainId,
          })

          setState(prev => ({
            ...prev,
            status: 'confirming',
            bundleId,
          }))

          // Wait for confirmation
          const result = await waitForBatchCalls(provider, bundleId)

          if (result.status === 'CONFIRMED') {
            const txHash = result.receipts?.[0]?.transactionHash
            setState(prev => ({
              ...prev,
              status: 'success',
              transactionHash: txHash,
            }))
          } else {
            throw new Error('Batch transaction failed')
          }
        } else {
          // Fallback to sequential transactions
          console.warn(
            'Wallet does not support EIP-5792. Falling back to sequential transactions.',
          )

          // 1. Approve tokens
          setState(prev => ({ ...prev, status: 'awaiting_approval' }))
          const approvalReceipt = await sendTransaction({
            transaction: approvalTx,
            account,
          })
          await waitForReceipt(approvalReceipt)

          // 2. Execute batch donation
          setState(prev => ({ ...prev, status: 'processing' }))
          const donationReceipt = await sendTransaction({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transaction: batchDonationTx as any,
            account,
          })

          setState(prev => ({ ...prev, status: 'confirming' }))
          const receipt = await waitForReceipt(donationReceipt)

          setState(prev => ({
            ...prev,
            status: 'success',
            transactionHash: receipt.transactionHash,
          }))
        }
      } catch (error) {
        console.error('Batch donation failed:', error)
        setState(prev => ({
          ...prev,
          status: 'error',
          error:
            error instanceof Error
              ? error.message
              : 'Failed to process batch donation',
        }))
      }
    },
    [account],
  )

  return {
    state,
    donate,
    batchDonate,
    reset,
  }
}
