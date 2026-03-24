import { defineChain, getContract, readContract } from 'thirdweb'
import { createPublicClient, http, parseAbi } from 'viem'
import { thirdwebClient } from '@/lib/thirdweb/client'
import type { WalletTokenWithBalance } from '@/lib/types/chain'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const TOKEN_QUERY_STALE_TIME_MS = 60 * 60 * 1000
const CONTRACT_READ_RETRY_COUNT = 2
const CONTRACT_READ_RETRY_BASE_DELAY_MS = 250
const BATCH_FLUSH_DELAY_MS = 0

const ERC20_SYMBOL_ABI = parseAbi(['function symbol() view returns (string)'])
const ERC20_DECIMALS_ABI = parseAbi([
  'function decimals() view returns (uint8)',
])

type KnownToken = {
  address?: string | null
  symbol: string
  decimals: number
}

type TokenContractMetadata = {
  symbol: string
  decimals: number
}

type BatchRequest = {
  resolve: (value: TokenContractMetadata | undefined) => void
}

type BatchQueue = {
  requestsByAddress: Map<string, BatchRequest[]>
  flushTimer?: ReturnType<typeof setTimeout>
}

export type DonationTokenSource = {
  chainId: number
  selectedToken?: WalletTokenWithBalance
  tokenSymbol?: string
  tokenAddress?: string | null
  tokenDecimals?: number
}

export type NormalizedDonationTokenPayload = {
  currency: string
  tokenAddress?: string
  decimals: number
  isNativeToken: boolean
}

const tokenMetadataCache = new Map<string, TokenContractMetadata>()
const inFlightTokenMetadataRequests = new Map<
  string,
  Promise<TokenContractMetadata | undefined>
>()
const batchQueues = new Map<number, BatchQueue>()

function normalizeAddress(address?: string | null): string | undefined {
  if (!address) return undefined

  const trimmedAddress = address.trim()
  if (!trimmedAddress || trimmedAddress === ZERO_ADDRESS) {
    return undefined
  }

  return trimmedAddress.toLowerCase()
}

function buildTokenCacheKey(chainId: number, tokenAddress: string): string {
  return `${chainId}:${tokenAddress}`
}

function getRpcUrl(chainId: number): string {
  return defineChain(chainId).rpc
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function shouldRetryContractRead(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  const message = error.message.toLowerCase()
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('rate limit') ||
    message.includes('429') ||
    message.includes('fetch') ||
    message.includes('http request failed')
  )
}

export async function withContractReadRetry<T>(
  operation: () => Promise<T>,
  retries: number = CONTRACT_READ_RETRY_COUNT,
): Promise<T> {
  let attempt = 0

  while (true) {
    try {
      return await operation()
    } catch (error) {
      if (attempt >= retries || !shouldRetryContractRead(error)) {
        throw error
      }

      const delayMs =
        CONTRACT_READ_RETRY_BASE_DELAY_MS * 2 ** Math.min(attempt, 3)
      await sleep(delayMs)
      attempt += 1
    }
  }
}

function getBatchQueue(chainId: number): BatchQueue {
  let batchQueue = batchQueues.get(chainId)
  if (!batchQueue) {
    batchQueue = {
      requestsByAddress: new Map(),
    }
    batchQueues.set(chainId, batchQueue)
  }

  return batchQueue
}

async function readTokenMetadataIndividually(
  chainId: number,
  tokenAddress: string,
): Promise<TokenContractMetadata | undefined> {
  const chain = defineChain(chainId)
  const contract = getContract({
    client: thirdwebClient,
    chain,
    address: tokenAddress as `0x${string}`,
  })

  try {
    const [symbol, decimals] = await Promise.all([
      withContractReadRetry(() =>
        readContract({
          contract,
          method: 'function symbol() view returns (string)',
          params: [],
        }),
      ),
      withContractReadRetry(() =>
        readContract({
          contract,
          method: 'function decimals() view returns (uint8)',
          params: [],
        }),
      ),
    ])

    if (typeof symbol !== 'string') return undefined

    return {
      symbol: symbol.trim(),
      decimals: Number(decimals),
    }
  } catch {
    return undefined
  }
}

async function readTokenMetadataBatch(
  chainId: number,
  tokenAddresses: string[],
): Promise<Map<string, TokenContractMetadata>> {
  const metadataByAddress = new Map<string, TokenContractMetadata>()
  if (tokenAddresses.length === 0) return metadataByAddress

  const publicClient = createPublicClient({
    transport: http(getRpcUrl(chainId)),
  })

  try {
    const contracts = tokenAddresses.flatMap(tokenAddress => [
      {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_SYMBOL_ABI,
        functionName: 'symbol' as const,
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_DECIMALS_ABI,
        functionName: 'decimals' as const,
      },
    ])

    const results = await withContractReadRetry(() =>
      publicClient.multicall({
        contracts,
        allowFailure: true,
      }),
    )

    const fallbackAddresses: string[] = []

    tokenAddresses.forEach((tokenAddress, index) => {
      const symbolResult = results[index * 2]
      const decimalsResult = results[index * 2 + 1]

      if (
        symbolResult.status === 'success' &&
        decimalsResult.status === 'success' &&
        typeof symbolResult.result === 'string'
      ) {
        metadataByAddress.set(tokenAddress, {
          symbol: symbolResult.result.trim(),
          decimals: Number(decimalsResult.result),
        })
        return
      }

      fallbackAddresses.push(tokenAddress)
    })

    const fallbackResults = await Promise.all(
      fallbackAddresses.map(async tokenAddress => {
        const metadata = await readTokenMetadataIndividually(
          chainId,
          tokenAddress,
        )
        return { tokenAddress, metadata }
      }),
    )

    fallbackResults.forEach(({ tokenAddress, metadata }) => {
      if (metadata) {
        metadataByAddress.set(tokenAddress, metadata)
      }
    })
  } catch {
    const fallbackResults = await Promise.all(
      tokenAddresses.map(async tokenAddress => {
        const metadata = await readTokenMetadataIndividually(
          chainId,
          tokenAddress,
        )
        return { tokenAddress, metadata }
      }),
    )

    fallbackResults.forEach(({ tokenAddress, metadata }) => {
      if (metadata) {
        metadataByAddress.set(tokenAddress, metadata)
      }
    })
  }

  return metadataByAddress
}

async function flushBatchQueue(chainId: number) {
  const batchQueue = batchQueues.get(chainId)
  if (!batchQueue || batchQueue.requestsByAddress.size === 0) return

  batchQueue.flushTimer = undefined

  const requestsByAddress = batchQueue.requestsByAddress
  batchQueue.requestsByAddress = new Map()

  const tokenAddresses = Array.from(requestsByAddress.keys())
  const metadataByAddress = await readTokenMetadataBatch(
    chainId,
    tokenAddresses,
  )

  tokenAddresses.forEach(tokenAddress => {
    const cacheKey = buildTokenCacheKey(chainId, tokenAddress)
    const metadata = metadataByAddress.get(tokenAddress)

    if (metadata) {
      tokenMetadataCache.set(cacheKey, metadata)
    }

    inFlightTokenMetadataRequests.delete(cacheKey)

    const requests = requestsByAddress.get(tokenAddress) ?? []
    requests.forEach(request => request.resolve(metadata))
  })
}

async function getUnknownTokenMetadata(
  chainId: number,
  tokenAddress: string,
): Promise<TokenContractMetadata | undefined> {
  const cacheKey = buildTokenCacheKey(chainId, tokenAddress)
  const cached = tokenMetadataCache.get(cacheKey)
  if (cached) return cached

  const existingRequest = inFlightTokenMetadataRequests.get(cacheKey)
  if (existingRequest) return existingRequest

  const requestPromise = new Promise<TokenContractMetadata | undefined>(
    resolve => {
      const batchQueue = getBatchQueue(chainId)
      const requests = batchQueue.requestsByAddress.get(tokenAddress) ?? []
      requests.push({ resolve })
      batchQueue.requestsByAddress.set(tokenAddress, requests)

      if (!batchQueue.flushTimer) {
        batchQueue.flushTimer = setTimeout(() => {
          void flushBatchQueue(chainId)
        }, BATCH_FLUSH_DELAY_MS)
      }
    },
  )

  inFlightTokenMetadataRequests.set(cacheKey, requestPromise)
  return requestPromise
}

export function resetDonationTokenPayloadCachesForTests() {
  tokenMetadataCache.clear()
  inFlightTokenMetadataRequests.clear()

  batchQueues.forEach(batchQueue => {
    if (batchQueue.flushTimer) {
      clearTimeout(batchQueue.flushTimer)
    }
  })
  batchQueues.clear()
}

export function normalizeDonationTokenPayload(
  source: DonationTokenSource,
  knownTokens: KnownToken[] = [],
): NormalizedDonationTokenPayload {
  const selectedAddress = normalizeAddress(source.selectedToken?.address)
  const sourceAddress = normalizeAddress(source.tokenAddress)
  const tokenAddress = selectedAddress ?? sourceAddress
  const selectedSymbol = source.selectedToken?.symbol?.trim()
  const sourceSymbol = source.tokenSymbol?.trim()
  const currency = selectedSymbol || sourceSymbol || ''
  const decimals = source.selectedToken?.decimals ?? source.tokenDecimals ?? 18

  if (!tokenAddress) {
    return {
      currency,
      tokenAddress: undefined,
      decimals,
      isNativeToken: true,
    }
  }

  const knownToken = knownTokens.find(token => {
    return normalizeAddress(token.address) === tokenAddress
  })

  if (knownToken) {
    return {
      currency: knownToken.symbol,
      tokenAddress,
      decimals: knownToken.decimals,
      isNativeToken: false,
    }
  }

  return {
    currency,
    tokenAddress,
    decimals,
    isNativeToken: false,
  }
}

export async function getKnownTokensByNetwork(networkId: number) {
  const { graphQLClient } = await import('@/lib/graphql/client')
  const { tokensByNetworkQuery } = await import('@/lib/graphql/queries')
  const { getQueryClient } = await import('@/lib/react-query/query-client')

  const queryClient = getQueryClient()

  return queryClient.fetchQuery({
    queryKey: ['tokens', 'by-network', networkId],
    staleTime: TOKEN_QUERY_STALE_TIME_MS,
    queryFn: async () => {
      const response = await graphQLClient.request(tokensByNetworkQuery, {
        networkId,
      })
      return response.tokensByNetwork
    },
  })
}

export async function resolveDonationTokenPayload(
  source: DonationTokenSource,
): Promise<NormalizedDonationTokenPayload> {
  const selectedAddress = normalizeAddress(source.selectedToken?.address)
  const sourceAddress = normalizeAddress(source.tokenAddress)

  if (!selectedAddress && !sourceAddress) {
    return normalizeDonationTokenPayload(source)
  }

  const knownTokens = await getKnownTokensByNetwork(source.chainId)
  const normalizedPayload = normalizeDonationTokenPayload(source, knownTokens)

  if (!normalizedPayload.tokenAddress) {
    return normalizedPayload
  }

  const isKnownToken = knownTokens.some(token => {
    return normalizeAddress(token.address) === normalizedPayload.tokenAddress
  })

  if (isKnownToken) {
    return normalizedPayload
  }

  const contractMetadata = await getUnknownTokenMetadata(
    source.chainId,
    normalizedPayload.tokenAddress,
  )

  if (!contractMetadata) {
    return normalizedPayload
  }

  return {
    currency: contractMetadata.symbol,
    tokenAddress: normalizedPayload.tokenAddress,
    decimals: contractMetadata.decimals,
    isNativeToken: false,
  }
}
