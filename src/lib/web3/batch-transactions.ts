/**
 * EIP-5792 Batch Transactions Implementation
 *
 * This module implements wallet_sendCalls for batching multiple transactions
 * into a single atomic transaction, enabling features like:
 * - Token approval + contract call in one transaction
 * - Multiple donations in one transaction
 * - Reduced gas costs and improved UX
 */

import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { encode } from 'thirdweb'
import type { PreparedTransaction } from 'thirdweb'
import type { Account } from 'thirdweb/wallets'

const SAFE_ALLOWED_DOMAINS = [/^https:\/\/app\.safe\.global$/]

// Hex type definition for address and data fields
export type Hex = `0x${string}`

// EIP-1193 Provider interface
interface EIP1193Provider {
  request(args: {
    method: string
    params?: unknown[] | Record<string, unknown>
  }): Promise<unknown>
}

// Wallet capabilities response
interface WalletCapabilities {
  atomicBatch?: {
    supported: boolean
  }
  delegation?: {
    supported: boolean
  }
}

type WalletCapabilitiesRecord = Record<string, WalletCapabilities> & {
  message?: string
}

interface RawCallsStatus {
  status?: unknown
  receipts?: unknown
}

interface RawReceipt {
  logs?: unknown
  status?: unknown
  blockHash?: unknown
  blockNumber?: unknown
  gasUsed?: unknown
  transactionHash?: unknown
}

interface WaitForBatchCallsOptions {
  isSafeWallet?: boolean
}

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
  isSafeWallet?: boolean
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
  provider: EIP1193Provider,
): Promise<boolean> {
  try {
    if (!provider?.request) return false

    // Check if wallet_sendCalls is supported
    const capabilities = (await provider.request({
      method: 'wallet_getCapabilities',
    })) as WalletCapabilitiesRecord | WalletCapabilities
    const chainCapabilities = extractCapabilitiesForChain(capabilities)

    return chainCapabilities?.atomicBatch?.supported === true
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
  const { account, calls, chainId, isSafeWallet } = options

  // Safe does not implement EIP-5792 wallet_sendCalls.
  if (isSafeWallet && typeof window !== 'undefined') {
    try {
      const sdk = new SafeAppsSDK({
        allowedDomains: SAFE_ALLOWED_DOMAINS,
        debug: false,
      })
      const response = (await sdk.txs.send({
        txs: calls.map(call => ({
          to: call.to,
          data: call.data || '0x',
          value: (call.value ?? BigInt(0)).toString(),
        })),
      })) as Record<string, unknown>

      const safeBundleId = extractSafeBundleId(response)
      if (safeBundleId) {
        return { bundleId: safeBundleId }
      }

      throw new Error('Safe Apps SDK did not return a safeTxHash')
    } catch (error) {
      throw new Error(
        `Safe batch transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  // Get the wallet provider
  const provider = getProviderFromAccount(account)
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
    const rawBundleId = await provider.request({
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

    const bundleId = extractBundleId(rawBundleId)
    if (!bundleId) {
      throw new Error('Batch transaction did not return a valid id')
    }
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
  provider: EIP1193Provider,
  bundleId: string,
): Promise<CallsStatus> {
  try {
    const rawStatus = (await provider.request({
      method: 'wallet_getCallsStatus',
      params: [bundleId],
    })) as RawCallsStatus

    return normalizeCallsStatus(rawStatus)
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
  provider: EIP1193Provider | undefined,
  bundleId: string,
  timeout = 180000,
  options: WaitForBatchCallsOptions = {},
): Promise<CallsStatus> {
  if (options.isSafeWallet) {
    const safeTxHash = extractSafeTxHashFromBundleId(bundleId)
    if (!safeTxHash) {
      throw new Error(`Invalid Safe transaction hash: ${bundleId}`)
    }
    return waitForSafeExecution(safeTxHash, timeout)
  }

  if (!provider) {
    throw new Error('Wallet provider not found')
  }

  const startTime = Date.now()
  const pollInterval = 2000 // Check every 2 seconds
  let lastPollingError: unknown

  while (Date.now() - startTime < timeout) {
    let status: CallsStatus | null = null
    try {
      status = await getBatchCallsStatus(provider, bundleId)
    } catch (error) {
      lastPollingError = error
    }

    const resolvedRpcStatus = resolveFinalStatus(status)
    if (resolvedRpcStatus) {
      return resolvedRpcStatus
    }

    const receiptStatus = await getStatusFromReceiptFallback(provider, bundleId)
    const resolvedReceiptStatus = resolveFinalStatus(receiptStatus)
    if (resolvedReceiptStatus) {
      return resolvedReceiptStatus
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  const pollingErrorMessage =
    lastPollingError instanceof Error ? ` (${lastPollingError.message})` : ''
  throw new Error(`Batch transaction timeout${pollingErrorMessage}`)
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

    // Resolve transaction properties (they may be promises or getters)
    const to = typeof tx.to === 'function' ? await tx.to() : tx.to
    const value = typeof tx.value === 'function' ? await tx.value() : tx.value

    calls.push({
      to: to || '',
      data: data as Hex,
      value: value,
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
 * Check wallet capabilities for EIP-7702 and EIP-5792
 */
export async function checkWalletCapabilities(
  provider: EIP1193Provider,
  chainId?: number,
): Promise<{
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

    const capabilities = (await provider.request({
      method: 'wallet_getCapabilities',
    })) as WalletCapabilitiesRecord | WalletCapabilities
    const chainCapabilities = extractCapabilitiesForChain(capabilities, chainId)

    return {
      supportsEIP5792:
        typeof capabilities === 'object' && capabilities !== null,
      supportsEIP7702: chainCapabilities?.delegation?.supported === true,
      supportsAtomicBatch: chainCapabilities?.atomicBatch?.supported === true,
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

/**
 * Get the provider from the account
 *
 * @param account - The account to get the provider from
 * @returns The provider from the account
 */
function getProviderFromAccount(account: Account): EIP1193Provider | undefined {
  return (
    account as Account & {
      wallet?: { getProvider?: () => EIP1193Provider }
    }
  ).wallet?.getProvider?.()
}

/**
 * Extract the bundle ID from the value
 *
 * @param value - The value to extract the bundle ID from
 * @returns The bundle ID
 */
function extractBundleId(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value
  if (!value || typeof value !== 'object') return undefined

  const response = value as Record<string, unknown>
  const candidates = [
    response.id,
    response.bundleId,
    response.safeTxHash,
    response.txId,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.length > 0) {
      return candidate
    }
  }

  return undefined
}

/**
 * Extract the Safe bundle ID from the response
 *
 * @param response - The response to extract the Safe bundle ID from
 * @returns The Safe bundle ID
 */
function extractSafeBundleId(
  response: Record<string, unknown>,
): string | undefined {
  if (isLikelyTxHash(response.safeTxHash)) {
    return response.safeTxHash
  }

  const fallbackCandidates = [
    response.txId,
    response.bundleId,
    response.id,
    response.safeAppRequestId,
  ]

  for (const candidate of fallbackCandidates) {
    if (typeof candidate !== 'string' || candidate.length === 0) continue

    const hashes = extractHashCandidates(candidate)
    if (hashes.length > 0) {
      return hashes[0]
    }
  }

  return undefined
}

/**
 * Extract the capabilities for the chain
 *
 * @param capabilities - The capabilities to extract
 * @param chainId - The chain ID
 * @returns The capabilities for the chain
 */
function extractCapabilitiesForChain(
  capabilities: WalletCapabilitiesRecord | WalletCapabilities,
  chainId?: number,
): WalletCapabilities | undefined {
  if (!capabilities || typeof capabilities !== 'object') return undefined

  const direct = capabilities as WalletCapabilities
  if (direct.atomicBatch || direct.delegation) return direct

  const record = capabilities as WalletCapabilitiesRecord
  const keysToTry = [
    chainId != null ? String(chainId) : undefined,
    chainId != null ? `0x${chainId.toString(16)}` : undefined,
  ].filter(Boolean) as string[]

  for (const key of keysToTry) {
    const value = record[key]
    if (value && typeof value === 'object') return value
  }

  for (const [key, value] of Object.entries(record)) {
    if (key === 'message') continue
    if (value && typeof value === 'object') return value as WalletCapabilities
  }

  return undefined
}

/**
 * Normalize the receipts
 *
 * @param receipts - The receipts to normalize
 * @returns The normalized receipts
 */
function normalizeReceipts(receipts: unknown): CallsStatus['receipts'] {
  if (!Array.isArray(receipts)) return undefined

  return receipts.map(receipt => {
    const rawReceipt = receipt as RawReceipt
    const logs = Array.isArray(rawReceipt.logs) ? rawReceipt.logs : []

    return {
      logs: logs.map(log => {
        const entry = log as {
          address?: unknown
          data?: unknown
          topics?: unknown
        }
        return {
          address: String(entry.address ?? ''),
          data: String(entry.data ?? '0x'),
          topics: Array.isArray(entry.topics)
            ? entry.topics.map(topic => String(topic))
            : [],
        }
      }),
      status: String(rawReceipt.status ?? ''),
      blockHash: String(rawReceipt.blockHash ?? ''),
      blockNumber: String(rawReceipt.blockNumber ?? ''),
      gasUsed: String(rawReceipt.gasUsed ?? ''),
      transactionHash: String(rawReceipt.transactionHash ?? ''),
    }
  })
}

/**
 * Normalize the calls status
 *
 * @param rawStatus - The raw status to normalize
 * @returns The normalized calls status
 */
function normalizeCallsStatus(rawStatus: RawCallsStatus): CallsStatus {
  const statusValue = rawStatus?.status
  const receipts = normalizeReceipts(rawStatus?.receipts)

  if (typeof statusValue === 'number') {
    if (statusValue === 200) return { status: 'CONFIRMED', receipts }
    if (statusValue >= 400) return { status: 'FAILED', receipts }
    return { status: 'PENDING', receipts }
  }

  const normalized = String(statusValue ?? '').toLowerCase()
  if (normalized === 'confirmed' || normalized === 'success') {
    return { status: 'CONFIRMED', receipts }
  }
  if (
    normalized === 'failed' ||
    normalized === 'failure' ||
    normalized === 'reverted'
  ) {
    return { status: 'FAILED', receipts }
  }

  return { status: 'PENDING', receipts }
}

/**
 * Check if the receipts have a successful status
 *
 * @param receipts - The receipts to check
 * @returns True if the receipts have a successful status
 */
function hasSuccessfulReceipt(
  receipts: CallsStatus['receipts'] | undefined,
): boolean {
  if (!receipts || receipts.length === 0) return false

  return receipts.some(receipt => {
    const status = String(receipt.status ?? '').toLowerCase()
    return (
      status === 'success' ||
      status === '0x1' ||
      status === '1' ||
      status === 'confirmed'
    )
  })
}

/**
 * Check if the receipts have a failed status
 *
 * @param receipts - The receipts to check
 * @returns True if the receipts have a failed status
 */
function hasFailedReceipt(
  receipts: CallsStatus['receipts'] | undefined,
): boolean {
  if (!receipts || receipts.length === 0) return false

  return receipts.some(receipt => {
    const status = String(receipt.status ?? '').toLowerCase()
    return status === 'reverted' || status === '0x0' || status === '0'
  })
}

/**
 * Resolve the final status of the batch call
 *
 * @param status - The status of the batch call
 * @returns The final status of the batch call
 */
function resolveFinalStatus(
  status: CallsStatus | null | undefined,
): CallsStatus | null {
  if (!status) return null

  if (status.status === 'FAILED' || hasFailedReceipt(status.receipts)) {
    return { ...status, status: 'FAILED' }
  }

  if (status.status === 'CONFIRMED' || hasSuccessfulReceipt(status.receipts)) {
    return { ...status, status: 'CONFIRMED' }
  }

  return null
}

/**
 * Check if the value is likely a transaction hash
 *
 * @param value - The value to check
 * @returns True if the value is likely a transaction hash
 */
function isLikelyTxHash(value: unknown): value is `0x${string}` {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{64}$/.test(value)
}

/**
 * Extract the Safe transaction hash from the composite ID
 *
 * @param value - The composite ID to extract the Safe transaction hash from
 * @returns The Safe transaction hash
 */
function extractSafeTxHashFromCompositeId(value: string): string | null {
  if (!value.includes('multisig_')) return null
  const lastUnderscore = value.lastIndexOf('_')
  if (lastUnderscore < 0) return null

  const candidate = value.slice(lastUnderscore + 1)
  return isLikelyTxHash(candidate) ? candidate : null
}

/**
 * Extract the hash candidates from the value
 *
 * @param value - The value to extract the hash candidates from
 * @returns The hash candidates
 */
function extractHashCandidates(value: string): string[] {
  if (!value) return []

  const candidates = new Set<string>()

  if (isLikelyTxHash(value)) candidates.add(value)

  const safeTxHash = extractSafeTxHashFromCompositeId(value)
  if (safeTxHash) candidates.add(safeTxHash)

  const prefixedMatches = value.match(/0x[a-fA-F0-9]{64}/g) ?? []
  for (const match of prefixedMatches) {
    candidates.add(match)
  }

  return Array.from(candidates)
}

/**
 * Extract the Safe transaction hash from the bundle ID
 *
 * @param bundleId - The bundle ID of the batch call
 * @returns The Safe transaction hash
 */
function extractSafeTxHashFromBundleId(bundleId: string): string | null {
  const candidates = extractHashCandidates(bundleId)
  return candidates.length > 0 ? candidates[0] : null
}

/**
 * Normalize the receipt to the calls status
 *
 * @param receipt - The receipt to normalize
 * @param fallbackTxHash - The fallback transaction hash
 * @returns The normalized calls status
 */
function normalizeReceiptToCallsStatus(
  receipt: RawReceipt,
  fallbackTxHash: string,
): CallsStatus {
  const normalized = String(receipt.status ?? '').toLowerCase()
  const status: CallsStatus['status'] =
    normalized === '0x1' || normalized === '1' || normalized === 'success'
      ? 'CONFIRMED'
      : normalized === '0x0' || normalized === '0' || normalized === 'reverted'
        ? 'FAILED'
        : 'PENDING'

  const mappedReceipts = normalizeReceipts([
    {
      logs: receipt.logs ?? [],
      status: receipt.status ?? '',
      blockHash: receipt.blockHash ?? '',
      blockNumber: receipt.blockNumber ?? '',
      gasUsed: receipt.gasUsed ?? '',
      transactionHash: receipt.transactionHash ?? fallbackTxHash,
    },
  ])

  return {
    status,
    receipts: mappedReceipts,
  }
}

/**
 * Get the status of a batch call from the receipt fallback
 *
 * @param provider - The wallet provider
 * @param bundleId - The bundle ID of the batch call
 * @returns The status of the batch call
 */
async function getStatusFromReceiptFallback(
  provider: EIP1193Provider,
  bundleId: string,
): Promise<CallsStatus | null> {
  const candidates = extractHashCandidates(bundleId)
  for (const txHash of candidates) {
    try {
      const rawReceipt = (await provider.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      })) as RawReceipt | null

      if (!rawReceipt) continue
      return normalizeReceiptToCallsStatus(rawReceipt, txHash)
    } catch {
      // Ignore receipt lookup errors while polling.
    }
  }

  return null
}

function extractExecutedTxHash(txDetails: unknown): string | null {
  const details = txDetails as {
    txHash?: unknown
    transactionHash?: unknown
    executionTxHash?: unknown
    executedTxHash?: unknown
    executionInfo?: { txHash?: unknown; transactionHash?: unknown }
    detailedExecutionInfo?: { txHash?: unknown; transactionHash?: unknown }
  }

  const candidates = [
    details.txHash,
    details.transactionHash,
    details.executionTxHash,
    details.executedTxHash,
    details.executionInfo?.txHash,
    details.executionInfo?.transactionHash,
    details.detailedExecutionInfo?.txHash,
    details.detailedExecutionInfo?.transactionHash,
  ]

  for (const candidate of candidates) {
    if (isLikelyTxHash(candidate)) return candidate
  }

  return null
}

/**
 * Wait for a Safe transaction to be executed
 *
 * @param safeTxHash - The Safe transaction hash to wait for
 * @param timeout - The timeout in milliseconds
 * @returns The status of the Safe transaction
 */
async function waitForSafeExecution(
  safeTxHash: string,
  timeout: number,
): Promise<CallsStatus> {
  const sdk = new SafeAppsSDK({
    allowedDomains: SAFE_ALLOWED_DOMAINS,
    debug: false,
  })
  const startTime = Date.now()
  const pollInterval = 2000
  let lastPollingError: unknown

  while (Date.now() - startTime < timeout) {
    try {
      const txDetails = (await sdk.txs.getBySafeTxHash(safeTxHash)) as {
        txStatus?: unknown
        isExecuted?: unknown
      }

      const txStatus = String(txDetails.txStatus ?? '').toUpperCase()
      const executionTxHash = extractExecutedTxHash(txDetails)
      const isFailedStatus =
        txStatus === 'FAILED' ||
        txStatus === 'CANCELLED' ||
        txStatus === 'REJECTED'

      if (isFailedStatus) {
        return {
          status: 'FAILED',
          receipts: [
            {
              logs: [],
              status: '0x0',
              blockHash: '',
              blockNumber: '',
              gasUsed: '',
              transactionHash: executionTxHash ?? safeTxHash,
            },
          ],
        }
      }

      const isExecuted =
        txStatus === 'SUCCESS' ||
        txStatus === 'EXECUTED' ||
        txDetails.isExecuted === true ||
        Boolean(executionTxHash)

      if (isExecuted) {
        return {
          status: 'CONFIRMED',
          receipts: [
            {
              logs: [],
              status: '0x1',
              blockHash: '',
              blockNumber: '',
              gasUsed: '',
              transactionHash: executionTxHash ?? safeTxHash,
            },
          ],
        }
      }
    } catch (error) {
      lastPollingError = error
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  const pollingErrorMessage =
    lastPollingError instanceof Error ? ` (${lastPollingError.message})` : ''
  throw new Error(`Safe transaction timeout${pollingErrorMessage}`)
}
