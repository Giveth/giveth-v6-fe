/**
 * EIP-5792 Batch Transactions Implementation
 *
 * This module implements wallet_sendCalls for batching multiple transactions
 * into a single atomic transaction, enabling features like:
 * - Token approval + contract call in one transaction
 * - Multiple donations in one transaction
 * - Reduced gas costs and improved UX
 */

import type { Account, Hex } from 'thirdweb/wallets'
import { encode } from 'thirdweb'
import type { PreparedTransaction } from 'thirdweb'

/**
 * Call object for EIP-5792 wallet_sendCalls
 */
export interface Call {
  to: string
  data?: Hex
  value?: bigint
  chainId?: number
}

/**
 * Batch call options
 */
export interface BatchCallOptions {
  account: Account
  calls: Call[]
  chainId?: number
}

/**
 * Response from wallet_sendCalls
 */
export interface SendCallsResponse {
  bundleId: string
}

/**
 * Call status from wallet_getCallsStatus
 */
export interface CallsStatus {
  status: 'PENDING' | 'CONFIRMED' | 'FAILED'
  receipts?: Array<{
    logs: Array<{
      address: string
      data: string
      topics: string[]
    }>
    status: string
    blockHash: string
    blockNumber: string
    gasUsed: string
    transactionHash: string
  }>
}

/**
 * Check if wallet supports EIP-5792 batch calls
 */
export async function supportsWalletSendCalls(
  provider: any,
): Promise<boolean> {
  try {
    if (!provider?.request) return false

    // Check if wallet_sendCalls is supported
    const capabilities = await provider.request({
      method: 'wallet_getCapabilities',
    })

    return capabilities?.atomicBatch?.supported === true
  } catch (error) {
    console.warn('Wallet does not support EIP-5792:', error)
    return false
  }
}

/**
 * Send batch calls using EIP-5792 wallet_sendCalls
 *
 * This method bundles multiple calls into a single transaction,
 * which is particularly useful for:
 * - Token approval + donation in one tx
 * - Multiple donations in one tx
 *
 * @param options - Batch call options
 * @returns Bundle ID for tracking the transaction
 */
export async function sendBatchCalls(
  options: BatchCallOptions,
): Promise<SendCallsResponse> {
  const { account, calls, chainId } = options

  // Get the wallet provider
  const provider = (account as any).wallet?.getProvider?.()
  if (!provider) {
    throw new Error('Wallet provider not found')
  }

  // Check if wallet supports batch calls
  const supported = await supportsWalletSendCalls(provider)
  if (!supported) {
    throw new Error(
      'Wallet does not support EIP-5792 batch transactions. Please use a compatible wallet.',
    )
  }

  try {
    // Send batch calls using EIP-5792
    const bundleId = await provider.request({
      method: 'wallet_sendCalls',
      params: [
        {
          version: '1.0',
          chainId: chainId ? `0x${chainId.toString(16)}` : undefined,
          from: account.address,
          calls: calls.map(call => ({
            to: call.to,
            data: call.data || '0x',
            value: call.value ? `0x${call.value.toString(16)}` : undefined,
          })),
        },
      ],
    })

    return { bundleId }
  } catch (error) {
    console.error('Failed to send batch calls:', error)
    throw new Error(
      `Batch transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Get status of batch calls
 *
 * @param provider - Wallet provider
 * @param bundleId - Bundle ID from sendBatchCalls
 * @returns Status of the batch calls
 */
export async function getBatchCallsStatus(
  provider: any,
  bundleId: string,
): Promise<CallsStatus> {
  try {
    const status = await provider.request({
      method: 'wallet_getCallsStatus',
      params: [bundleId],
    })

    return status
  } catch (error) {
    console.error('Failed to get batch calls status:', error)
    throw new Error(
      `Failed to get status: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Wait for batch calls to be confirmed
 *
 * @param provider - Wallet provider
 * @param bundleId - Bundle ID from sendBatchCalls
 * @param timeout - Maximum time to wait in milliseconds (default: 60000)
 * @returns Final status of the batch calls
 */
export async function waitForBatchCalls(
  provider: any,
  bundleId: string,
  timeout = 60000,
): Promise<CallsStatus> {
  const startTime = Date.now()
  const pollInterval = 2000 // Check every 2 seconds

  while (Date.now() - startTime < timeout) {
    const status = await getBatchCallsStatus(provider, bundleId)

    if (status.status === 'CONFIRMED' || status.status === 'FAILED') {
      return status
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  throw new Error('Batch transaction timeout')
}

/**
 * Prepare batch transaction from prepared transactions
 *
 * Converts thirdweb PreparedTransaction objects to Call objects
 * that can be used with wallet_sendCalls
 */
export async function prepareBatchFromTransactions(
  transactions: PreparedTransaction[],
): Promise<Call[]> {
  const calls: Call[] = []

  for (const tx of transactions) {
    // Encode the transaction data
    const data = await encode(tx)

    calls.push({
      to: tx.to || '',
      data: data as Hex,
      value: tx.value,
    })
  }

  return calls
}

/**
 * Execute token approval and donation in a single batch transaction
 *
 * This is the main function for implementing EIP-5792 with EIP-7702
 * to bundle token approval and donation into one transaction
 *
 * @param account - User's wallet account
 * @param approvalTx - Prepared token approval transaction
 * @param donationTx - Prepared donation transaction
 * @param chainId - Chain ID
 * @returns Bundle ID for tracking
 */
export async function executeApprovalAndDonation(
  account: Account,
  approvalTx: PreparedTransaction,
  donationTx: PreparedTransaction,
  chainId: number,
): Promise<SendCallsResponse> {
  // Convert prepared transactions to calls
  const calls = await prepareBatchFromTransactions([approvalTx, donationTx])

  // Send batch calls
  return sendBatchCalls({
    account,
    calls,
    chainId,
  })
}

/**
 * Fallback: Execute transactions sequentially if batch is not supported
 *
 * This is a fallback for wallets that don't support EIP-5792
 */
export async function executeSequentially(
  account: Account,
  transactions: PreparedTransaction[],
): Promise<string[]> {
  const txHashes: string[] = []

  for (const tx of transactions) {
    // Execute each transaction
    // Note: This requires the actual send function from thirdweb
    // You'll need to implement this based on your transaction sending logic
    console.warn('Sequential execution not fully implemented - needs send logic')
    // const receipt = await sendTransaction({ account, transaction: tx })
    // txHashes.push(receipt.transactionHash)
  }

  return txHashes
}

/**
 * Check wallet capabilities for EIP-7702 and EIP-5792
 */
export async function checkWalletCapabilities(provider: any): Promise<{
  supportsEIP5792: boolean
  supportsEIP7702: boolean
  supportsAtomicBatch: boolean
}> {
  try {
    if (!provider?.request) {
      return {
        supportsEIP5792: false,
        supportsEIP7702: false,
        supportsAtomicBatch: false,
      }
    }

    const capabilities = await provider.request({
      method: 'wallet_getCapabilities',
    })

    return {
      supportsEIP5792: typeof capabilities === 'object' && capabilities !== null,
      supportsEIP7702: capabilities?.delegation?.supported === true,
      supportsAtomicBatch: capabilities?.atomicBatch?.supported === true,
    }
  } catch (error) {
    console.warn('Could not check wallet capabilities:', error)
    return {
      supportsEIP5792: false,
      supportsEIP7702: false,
      supportsAtomicBatch: false,
    }
  }
}

