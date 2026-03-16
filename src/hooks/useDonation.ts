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
import { sendTransaction, waitForReceipt, encode, readContract } from 'thirdweb'
import { useActiveAccount, useActiveWallet } from 'thirdweb/react'
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

export interface DonationResult {
  success: boolean
  transactionHash?: string
  bundleId?: string
  error?: string
}

export interface UseDonationReturn {
  state: DonationState
  donate: (details: DonationDetails) => Promise<DonationResult>
  batchDonate: (details: BatchDonationDetails) => Promise<DonationResult>
  reset: () => void
}

/**
 * Hook for handling donations with EIP-5792 batch transactions
 */
export function useDonation(): UseDonationReturn {
  const account = useActiveAccount()
  const activeWallet = useActiveWallet()
  const isSafeWallet = activeWallet?.id === 'global.safe'
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

  const ensureTokenAllowance = useCallback(
    async ({
      tokenContract,
      spenderAddress,
      requiredAmount,
    }: {
      tokenContract: ReturnType<typeof getERC20Contract>
      spenderAddress: string
      requiredAmount: bigint
    }) => {
      if (!account) {
        throw new Error('Please connect your wallet')
      }

      const readAllowance = async () =>
        (await readContract({
          contract: tokenContract,
          method:
            'function allowance(address _owner, address _spender) view returns (uint256)',
          params: [account.address, spenderAddress],
        })) as bigint

      const currentAllowance = await readAllowance()
      if (currentAllowance >= requiredAmount) return

      // Some tokens require setting allowance to zero before increasing.
      if (currentAllowance > BigInt(0)) {
        const resetApprovalTx = prepareTokenApproval(
          tokenContract,
          spenderAddress,
          BigInt(0),
        )
        const resetReceipt = await sendTransaction({
          transaction: resetApprovalTx,
          account,
        })
        await waitForReceipt(resetReceipt)
      }

      const approvalTx = prepareTokenApproval(
        tokenContract,
        spenderAddress,
        requiredAmount,
      )
      const approvalReceipt = await sendTransaction({
        transaction: approvalTx,
        account,
      })
      await waitForReceipt(approvalReceipt)

      const finalAllowance = await readAllowance()
      if (finalAllowance < requiredAmount) {
        throw new Error('InsufficientAllowance')
      }
    },
    [account],
  )

  /**
   * Execute a single donation
   */
  const donate = useCallback(
    async (details: DonationDetails): Promise<DonationResult> => {
      if (!account) {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: 'Please connect your wallet',
        }))
        return { success: false, error: 'Please connect your wallet' }
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
          ? await checkWalletCapabilities(provider, details.chainId)
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
          if (isSafeWallet || (provider && capabilities.supportsAtomicBatch)) {
            setState(prev => ({ ...prev, status: 'awaiting_approval' }))

            const donationData = await encode(
              donationTx as Parameters<typeof encode>[0],
            )
            const calls: Call[] = [
              {
                to: donationHandlerAddress,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: donationData as any,
                value: details.amount,
              },
            ]

            const { bundleId } = await sendBatchCalls({
              account,
              calls,
              chainId: details.chainId,
              isSafeWallet,
            })

            setState(prev => ({
              ...prev,
              status: 'confirming',
              bundleId,
            }))

            const result = await waitForBatchCalls(provider, bundleId, 180000, {
              isSafeWallet,
            })

            if (result.status === 'CONFIRMED') {
              const txHash = result.receipts?.[0]?.transactionHash ?? bundleId
              setState(prev => ({
                ...prev,
                status: 'success',
                transactionHash: txHash,
              }))
              return {
                success: true,
                transactionHash: txHash,
                bundleId,
              }
            }
            throw new Error('Batch transaction failed')
          }

          // Non-Safe fallback: standard tx + receipt.
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
          return {
            success: true,
            transactionHash: finalReceipt.transactionHash,
          }
        }

        // For ERC20 tokens, need approval first
        const tokenContract = getERC20Contract(
          details.chainId,
          details.tokenAddress,
        )

        const approvalTx = prepareTokenApproval(
          tokenContract,
          donationHandlerAddress,
          details.amount,
        )

        // Try batch transaction first (Safe or EIP-5792-capable wallet).
        if (isSafeWallet || (provider && capabilities.supportsAtomicBatch)) {
          try {
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
              isSafeWallet,
            })

            setState(prev => ({
              ...prev,
              status: 'confirming',
              bundleId,
            }))

            const result = await waitForBatchCalls(provider, bundleId, 180000, {
              isSafeWallet,
            })

            if (result.status === 'CONFIRMED') {
              const txHash = result.receipts?.[0]?.transactionHash ?? bundleId
              setState(prev => ({
                ...prev,
                status: 'success',
                transactionHash: txHash,
              }))
              return {
                success: true,
                transactionHash: txHash,
                bundleId,
              }
            }
            throw new Error('Batch transaction failed')
          } catch (batchError) {
            if (isSafeWallet) throw batchError
            console.warn(
              'Batch path failed for non-Safe wallet. Falling back to sequential transactions.',
              batchError,
            )
          }
        }

        // Fallback to sequential transactions for non-Safe wallets.
        setState(prev => ({ ...prev, status: 'awaiting_approval' }))
        await ensureTokenAllowance({
          tokenContract,
          spenderAddress: donationHandlerAddress,
          requiredAmount: details.amount,
        })

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
        return {
          success: true,
          transactionHash: receipt.transactionHash,
        }
      } catch (error) {
        console.error('Donation failed:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to process donation'
        setState(prev => ({
          ...prev,
          status: 'error',
          error: errorMessage,
        }))
        return {
          success: false,
          error: errorMessage,
        }
      }
    },
    [account, ensureTokenAllowance, isSafeWallet],
  )

  /**
   * Execute batch donations to multiple projects
   */
  const batchDonate = useCallback(
    async (details: BatchDonationDetails): Promise<DonationResult> => {
      if (!account) {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: 'Please connect your wallet',
        }))
        return { success: false, error: 'Please connect your wallet' }
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
          ? await checkWalletCapabilities(provider, details.chainId)
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

          if (isSafeWallet || (provider && capabilities.supportsAtomicBatch)) {
            setState(prev => ({ ...prev, status: 'awaiting_approval' }))

            const donationData = await encode(
              batchDonationTx as Parameters<typeof encode>[0],
            )
            const calls: Call[] = [
              {
                to: donationHandlerAddress,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: donationData as any,
                value: details.totalAmount,
              },
            ]

            const { bundleId } = await sendBatchCalls({
              account,
              calls,
              chainId: details.chainId,
              isSafeWallet,
            })

            setState(prev => ({
              ...prev,
              status: 'confirming',
              bundleId,
            }))

            const result = await waitForBatchCalls(provider, bundleId, 180000, {
              isSafeWallet,
            })

            if (result.status === 'CONFIRMED') {
              const txHash = result.receipts?.[0]?.transactionHash ?? bundleId
              setState(prev => ({
                ...prev,
                status: 'success',
                transactionHash: txHash,
              }))
              return {
                success: true,
                transactionHash: txHash,
                bundleId,
              }
            }
            throw new Error('Batch transaction failed')
          }

          // Non-Safe fallback: standard tx + receipt.
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
          return {
            success: true,
            transactionHash: finalReceipt.transactionHash,
          }
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
        const tokenContract = getERC20Contract(
          details.chainId,
          details.tokenAddress,
        )

        const approvalTx = prepareTokenApproval(
          tokenContract,
          donationHandlerAddress,
          details.totalAmount,
        )

        // Try batch transaction first (Safe or EIP-5792-capable wallet).
        if (isSafeWallet || (provider && capabilities.supportsAtomicBatch)) {
          try {
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
              isSafeWallet,
            })

            setState(prev => ({
              ...prev,
              status: 'confirming',
              bundleId,
            }))

            const result = await waitForBatchCalls(provider, bundleId, 180000, {
              isSafeWallet,
            })

            if (result.status === 'CONFIRMED') {
              const txHash = result.receipts?.[0]?.transactionHash ?? bundleId
              setState(prev => ({
                ...prev,
                status: 'success',
                transactionHash: txHash,
              }))
              return {
                success: true,
                transactionHash: txHash,
                bundleId,
              }
            }
            throw new Error('Batch transaction failed')
          } catch (batchError) {
            if (isSafeWallet) throw batchError
            console.warn(
              'Batch path failed for non-Safe wallet. Falling back to sequential transactions.',
              batchError,
            )
          }
        }

        // Fallback to sequential transactions for non-Safe wallets.
        setState(prev => ({ ...prev, status: 'awaiting_approval' }))
        await ensureTokenAllowance({
          tokenContract,
          spenderAddress: donationHandlerAddress,
          requiredAmount: details.totalAmount,
        })

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
        return {
          success: true,
          transactionHash: receipt.transactionHash,
        }
      } catch (error) {
        console.error('Batch donation failed:', error)
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to process batch donation'
        setState(prev => ({
          ...prev,
          status: 'error',
          error: errorMessage,
        }))
        return {
          success: false,
          error: errorMessage,
        }
      }
    },
    [account, ensureTokenAllowance, isSafeWallet],
  )

  return {
    state,
    donate,
    batchDonate,
    reset,
  }
}
