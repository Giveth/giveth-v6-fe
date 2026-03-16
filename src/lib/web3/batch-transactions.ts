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
import { defineChain } from 'thirdweb/chains'
import { thirdwebClient } from '@/lib/thirdweb/client'
import type { PreparedTransaction } from 'thirdweb'
import type { Account } from 'thirdweb/wallets'

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
  status?: number | string | 'pending' | 'success' | 'failure'
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
    })) as WalletCapabilities

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
  const { account, calls, chainId, isSafeWallet } = options

  // Safe SDK returns safeTxHash, which is more reliable for completion polling.
  if (isSafeWallet && typeof window !== 'undefined') {
    try {
      const sdk = new SafeAppsSDK({
        allowedDomains: [/safe\.global$/],
        debug: false,
      })
      const response = (await sdk.txs.send({
        txs: calls.map(call => ({
          to: call.to,
          data: call.data || '0x',
          value: (call.value ?? BigInt(0)).toString(),
        })),
      })) as { safeTxHash?: string }

      if (response.safeTxHash) {
        return { bundleId: response.safeTxHash }
      }
    } catch (error) {
      // Fall back to wallet/account EIP-5792 path if Safe SDK send is unavailable.
      console.warn('Safe SDK tx send fallback to wallet_sendCalls', error)
    }
  }

  // Prefer account-level methods for Safe-compatible accounts.
  if (account.sendCalls) {
    const chain = defineChain(chainId ?? 1)
    const result = await account.sendCalls({
      // thirdweb expects call shape; runtime is validated by wallet/provider.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calls: calls as any,
      chain,
      version: '1.0',
      atomicRequired: true,
    })
    return { bundleId: result.id }
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

    return { bundleId: bundleId as string }
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
  accountOrProvider: Account | EIP1193Provider,
  bundleId: string,
  chainId?: number,
  timeout = 180000,
  options: WaitForBatchCallsOptions = {},
): Promise<CallsStatus> {
  const startTime = Date.now()
  const pollInterval = 2000 // Check every 2 seconds
  let lastPollingError: unknown
  const account = accountOrProvider as Account

  if (account.getCallsStatus && chainId) {
    const chain = defineChain(chainId)
    const provider = getProviderFromAccount(account)

    while (Date.now() - startTime < timeout) {
      try {
        const response = (await account.getCallsStatus({
          id: bundleId,
          chain,
          client: thirdwebClient,
        })) as RawCallsStatus

        const status = normalizeAccountCallsStatus(response)
        const resolved = resolveFinalStatus(status)
        if (resolved) return resolved
      } catch (error) {
        // Safe account polling can intermittently fail; keep polling.
        lastPollingError = error
      }

      if (options.isSafeWallet) {
        const safeStatus = await getStatusFromSafeSdk(bundleId)
        const resolvedSafeStatus = resolveFinalStatus(safeStatus)
        if (resolvedSafeStatus) return resolvedSafeStatus

        const safeServiceStatus = await getStatusFromSafeApiKit(
          bundleId,
          chainId,
        )
        const resolvedSafeServiceStatus = resolveFinalStatus(safeServiceStatus)
        if (resolvedSafeServiceStatus) return resolvedSafeServiceStatus
      }

      const providerStatus = await getStatusFromProviderCallsFallback(
        provider,
        bundleId,
      )
      const resolvedProviderStatus = resolveFinalStatus(providerStatus)
      if (resolvedProviderStatus) return resolvedProviderStatus

      const receiptStatus = await getStatusFromReceiptFallback(
        provider,
        bundleId,
      )
      const resolvedReceiptStatus = resolveFinalStatus(receiptStatus)
      if (resolvedReceiptStatus) return resolvedReceiptStatus

      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    if (lastPollingError instanceof Error) {
      throw new Error(`Batch transaction timeout (${lastPollingError.message})`)
    }
    throw new Error('Batch transaction timeout')
  }

  const provider = accountOrProvider as EIP1193Provider

  while (Date.now() - startTime < timeout) {
    try {
      const status = await getBatchCallsStatus(provider, bundleId)
      const resolvedStatus = resolveFinalStatus(status)
      if (resolvedStatus) return resolvedStatus
    } catch (error) {
      lastPollingError = error
    }

    if (options.isSafeWallet) {
      const safeStatus = await getStatusFromSafeSdk(bundleId)
      const resolvedSafeStatus = resolveFinalStatus(safeStatus)
      if (resolvedSafeStatus) return resolvedSafeStatus

      const safeServiceStatus = await getStatusFromSafeApiKit(bundleId, chainId)
      const resolvedSafeServiceStatus = resolveFinalStatus(safeServiceStatus)
      if (resolvedSafeServiceStatus) return resolvedSafeServiceStatus
    }

    const receiptStatus = await getStatusFromReceiptFallback(provider, bundleId)
    const resolvedReceiptStatus = resolveFinalStatus(receiptStatus)
    if (resolvedReceiptStatus) return resolvedReceiptStatus

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  if (lastPollingError instanceof Error) {
    throw new Error(`Batch transaction timeout (${lastPollingError.message})`)
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
 * Fallback: Execute transactions sequentially if batch is not supported
 *
 * This is a fallback for wallets that don't support EIP-5792
 */
export async function executeSequentially(
  _account: Account,
  transactions: PreparedTransaction[],
): Promise<string[]> {
  const txHashes: string[] = []

  for (const _tx of transactions) {
    // Execute each transaction
    // Note: This requires the actual send function from thirdweb
    // You'll need to implement this based on your transaction sending logic
    console.warn(
      'Sequential execution not fully implemented - needs send logic',
    )
    // const receipt = await sendTransaction({ account, transaction: _tx })
    // txHashes.push(receipt.transactionHash)
  }

  return txHashes
}

/**
 * Check wallet capabilities for EIP-7702 and EIP-5792
 */
export async function checkWalletCapabilities(
  providerOrAccount: EIP1193Provider | Account,
  chainId?: number,
): Promise<{
  supportsEIP5792: boolean
  supportsEIP7702: boolean
  supportsAtomicBatch: boolean
}> {
  try {
    const account = providerOrAccount as Account
    if (account.getCapabilities) {
      const capabilities = await account.getCapabilities({ chainId })
      const chainCapabilities = extractCapabilitiesForChain(
        capabilities as WalletCapabilitiesRecord | WalletCapabilities,
        chainId,
      )
      return {
        supportsEIP5792:
          typeof capabilities === 'object' &&
          capabilities !== null &&
          !('message' in capabilities),
        supportsEIP7702: chainCapabilities?.delegation?.supported === true,
        supportsAtomicBatch: chainCapabilities?.atomicBatch?.supported === true,
      }
    }

    const provider = providerOrAccount as EIP1193Provider
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

function getProviderFromAccount(account: Account): EIP1193Provider | undefined {
  return (
    account as Account & {
      wallet?: { getProvider?: () => EIP1193Provider }
    }
  ).wallet?.getProvider?.()
}

function extractCapabilitiesForChain(
  capabilities: WalletCapabilitiesRecord | WalletCapabilities,
  chainId?: number,
): WalletCapabilities | undefined {
  if (!capabilities || typeof capabilities !== 'object') return undefined

  const directCapabilities = capabilities as WalletCapabilities
  if (directCapabilities.atomicBatch || directCapabilities.delegation) {
    return directCapabilities
  }

  const recordCapabilities = capabilities as WalletCapabilitiesRecord
  const keysToTry = [
    chainId != null ? String(chainId) : undefined,
    chainId != null ? `0x${chainId.toString(16)}` : undefined,
  ].filter(Boolean) as string[]

  for (const key of keysToTry) {
    const value = recordCapabilities[key]
    if (value && typeof value === 'object') return value
  }

  for (const [key, value] of Object.entries(recordCapabilities)) {
    if (key === 'message') continue
    if (value && typeof value === 'object') return value as WalletCapabilities
  }

  return undefined
}

function normalizeCallsStatus(rawStatus: RawCallsStatus): CallsStatus {
  const statusValue = rawStatus?.status
  const receipts = normalizeReceipts(rawStatus?.receipts)

  if (typeof statusValue === 'number') {
    // EIP-5792 canonical status codes:
    // 100: pending, 200: success, >=400: failed.
    if (statusValue === 200) return { status: 'CONFIRMED', receipts }
    if (statusValue >= 400) return { status: 'FAILED', receipts }
    return { status: 'PENDING', receipts }
  }

  if (typeof statusValue === 'string') {
    const normalizedStatus = statusValue.toLowerCase()
    if (normalizedStatus === 'confirmed' || normalizedStatus === 'success') {
      return { status: 'CONFIRMED', receipts }
    }
    if (
      normalizedStatus === 'failed' ||
      normalizedStatus === 'failure' ||
      normalizedStatus === 'reverted'
    ) {
      return { status: 'FAILED', receipts }
    }
  }

  return { status: 'PENDING', receipts }
}

function normalizeAccountCallsStatus(rawStatus: RawCallsStatus): CallsStatus {
  const statusValue = rawStatus?.status
  const receipts = normalizeReceipts(rawStatus?.receipts)
  const hasSuccessReceipt = hasSuccessfulReceipt(receipts)
  const hasFailureReceipt = hasFailedReceipt(receipts)

  if (statusValue === 'success' || hasSuccessReceipt) {
    return { status: 'CONFIRMED', receipts }
  }

  // Safe can intermittently report "failure" before finalizing execution.
  if (statusValue === 'failure' && hasFailureReceipt) {
    return { status: 'FAILED', receipts }
  }

  return { status: 'PENDING', receipts }
}

function normalizeReceipts(receipts: unknown): CallsStatus['receipts'] {
  if (!Array.isArray(receipts)) return undefined

  return receipts.map(receipt => {
    const rawReceipt = receipt as RawReceipt
    const rawLogs = Array.isArray(rawReceipt.logs) ? rawReceipt.logs : []

    return {
      logs: rawLogs.map(log => {
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

function hasFailedReceipt(
  receipts: CallsStatus['receipts'] | undefined,
): boolean {
  if (!receipts || receipts.length === 0) return false

  return receipts.some(receipt => {
    const status = String(receipt.status ?? '').toLowerCase()
    return status === 'reverted' || status === '0x0' || status === '0'
  })
}

function resolveFinalStatus(
  status: CallsStatus | null | undefined,
): CallsStatus | null {
  if (!status) return null

  if (status.status === 'CONFIRMED' || hasSuccessfulReceipt(status.receipts)) {
    return { ...status, status: 'CONFIRMED' }
  }

  if (status.status === 'FAILED' || hasFailedReceipt(status.receipts)) {
    return { ...status, status: 'FAILED' }
  }

  return null
}

async function getStatusFromProviderCallsFallback(
  provider: EIP1193Provider | undefined,
  bundleId: string,
): Promise<CallsStatus | null> {
  if (!provider?.request) return null

  try {
    return await getBatchCallsStatus(provider, bundleId)
  } catch {
    return null
  }
}

async function getStatusFromSafeSdk(
  bundleId: string,
): Promise<CallsStatus | null> {
  if (typeof window === 'undefined') return null

  const candidates = extractHashCandidates(bundleId)
  if (candidates.length === 0) return null

  const sdk = new SafeAppsSDK()

  for (const safeTxHash of candidates) {
    try {
      const txDetails = await sdk.txs.getBySafeTxHash(safeTxHash)
      const safeStatus = mapSafeTxStatus(txDetails)
      if (!safeStatus) continue

      const txHash = extractExecutedTxHash(txDetails) ?? safeTxHash
      if (safeStatus === 'PENDING') return { status: 'PENDING' }

      return {
        status: safeStatus,
        receipts: [
          {
            logs: [],
            status: safeStatus === 'CONFIRMED' ? '0x1' : '0x0',
            blockHash: '',
            blockNumber: '',
            gasUsed: '',
            transactionHash: txHash,
          },
        ],
      }
    } catch {
      // Ignore candidate mismatch and continue with other candidates.
    }
  }

  return null
}

async function getStatusFromSafeApiKit(
  bundleId: string,
  chainId?: number,
): Promise<CallsStatus | null> {
  if (typeof window === 'undefined') return null
  if (!chainId) return null

  const candidates = extractHashCandidates(bundleId)
  if (candidates.length === 0) return null

  try {
    const safeApiKitModule = await import('@safe-global/api-kit')
    const SafeApiKit = safeApiKitModule.default
    const safeService = new SafeApiKit({
      chainId: BigInt(chainId),
    })

    for (const safeTxHash of candidates) {
      try {
        const txDetails = await safeService.getTransaction(safeTxHash)
        const safeStatus = mapSafeTxStatus(txDetails)
        if (!safeStatus) continue

        const txHash = extractExecutedTxHash(txDetails) ?? safeTxHash
        if (safeStatus === 'PENDING') return { status: 'PENDING' }

        return {
          status: safeStatus,
          receipts: [
            {
              logs: [],
              status: safeStatus === 'CONFIRMED' ? '0x1' : '0x0',
              blockHash: '',
              blockNumber: '',
              gasUsed: '',
              transactionHash: txHash,
            },
          ],
        }
      } catch {
        // Candidate does not map to a tx known by Safe service yet.
      }
    }
  } catch {
    // Safe API kit unavailable or failed for this runtime.
  }

  return null
}

function mapSafeTxStatus(txDetails: unknown): CallsStatus['status'] | null {
  const tx = txDetails as {
    txStatus?: unknown
    isExecuted?: unknown
    isSuccessful?: unknown
  }

  if (
    typeof tx.isExecuted === 'boolean' &&
    typeof tx.isSuccessful === 'boolean'
  ) {
    return tx.isExecuted
      ? tx.isSuccessful
        ? 'CONFIRMED'
        : 'FAILED'
      : 'PENDING'
  }

  const txStatusValue =
    typeof tx.txStatus === 'string'
      ? tx.txStatus
      : (tx.txStatus as { status?: unknown } | undefined)?.status
  const normalized = String(txStatusValue ?? '').toLowerCase()

  if (
    normalized.includes('success') ||
    normalized.includes('executed') ||
    normalized.includes('confirmed')
  ) {
    return 'CONFIRMED'
  }
  if (
    normalized.includes('failed') ||
    normalized.includes('reverted') ||
    normalized.includes('cancel')
  ) {
    return 'FAILED'
  }
  if (normalized.length > 0) {
    return 'PENDING'
  }

  return null
}

function extractExecutedTxHash(txDetails: unknown): string | null {
  const tx = txDetails as {
    txHash?: unknown
    transactionHash?: unknown
    executionInfo?: { txHash?: unknown }
    detailedExecutionInfo?: { txHash?: unknown }
  }

  const candidates = [
    tx.txHash,
    tx.transactionHash,
    tx.executionInfo?.txHash,
    tx.detailedExecutionInfo?.txHash,
  ]

  for (const candidate of candidates) {
    if (isLikelyTxHash(candidate)) return candidate
  }

  return null
}

function isLikelyTxHash(value: unknown): value is `0x${string}` {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{64}$/.test(value)
}

function extractHashCandidates(value: string): string[] {
  if (typeof value !== 'string' || value.length === 0) return []

  const candidates = new Set<string>()
  if (isLikelyTxHash(value)) candidates.add(value)

  const prefixedMatches = value.match(/0x[a-fA-F0-9]{64}/g) ?? []
  for (const match of prefixedMatches) {
    candidates.add(match)
  }

  if (value.startsWith('0x')) {
    const hexBody = value.slice(2)
    if (/^[a-fA-F0-9]+$/.test(hexBody) && hexBody.length >= 64) {
      candidates.add(`0x${hexBody.slice(0, 64)}`)
      candidates.add(`0x${hexBody.slice(-64)}`)
    }
  }

  return Array.from(candidates)
}

async function getStatusFromReceiptFallback(
  provider: EIP1193Provider | undefined,
  bundleId: string,
): Promise<CallsStatus | null> {
  if (!provider?.request) return null

  const txHashes = extractHashCandidates(bundleId)
  for (const txHash of txHashes) {
    try {
      const receipt = (await provider.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      })) as RawReceipt | null

      if (!receipt) continue

      const status = String(receipt.status ?? '').toLowerCase()
      const isSuccess =
        status === '0x1' || status === '1' || status === 'success'
      const isFailure =
        status === '0x0' || status === '0' || status === 'reverted'

      if (!isSuccess && !isFailure) continue

      const receipts = normalizeReceipts([
        {
          logs: receipt.logs ?? [],
          status: receipt.status ?? '',
          blockHash: receipt.blockHash ?? '',
          blockNumber: receipt.blockNumber ?? '',
          gasUsed: receipt.gasUsed ?? '',
          transactionHash: receipt.transactionHash ?? txHash,
        },
      ])

      return {
        status: isSuccess ? 'CONFIRMED' : 'FAILED',
        receipts,
      }
    } catch {
      // Ignore unsupported receipt lookups and continue with polling.
    }
  }

  return null
}
