import { useQuery } from '@tanstack/react-query'
import { getContract, readContract } from 'thirdweb'
import { defineChain } from 'thirdweb/chains'
import { balanceOf } from 'thirdweb/extensions/erc20'
import { getWalletBalance } from 'thirdweb/wallets'
import { formatUnits } from 'viem'
import { type ProjectCartItem } from '@/context/CartContext'
import {
  chainlinkAggregatorAbi,
  uniswapV2FactoryAbi,
  uniswapV2PairAbi,
} from '@/lib/abis/abis'
import { graphQLClient } from '@/lib/graphql/client'
import type { TokensByNetworkQuery } from '@/lib/graphql/generated/graphql'
import { tokensByNetworkQuery } from '@/lib/graphql/queries'
import { roundAmount } from '@/lib/helpers/numbersHelper'
import { thirdwebClient } from '@/lib/thirdweb/client'
import type { GroupedProjects } from '@/lib/types/cart'
import { type WalletTokenWithBalance } from '@/lib/types/chain'

const MAINNET_CHAIN_ID = 1
const UNISWAP_V2_FACTORY_ADDRESS = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
const MAINNET_WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const MAINNET_USDC_ADDRESS = '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const MAINNET_USDC_DECIMALS = 6
const MAINNET_WETH_USD_FEED_ADDRESS =
  '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

/**
 * Group cart items by round
 * @param cartItems - The cart items to group
 * @returns {
 *   qfRoundGroups: GroupedProjects[]
 *   nonQfProjects: Project[]
 * }
 * @returns The grouped projects
 */
export function groupCartItemsByRound(cartItems: ProjectCartItem[]): {
  qfRoundGroups: GroupedProjects[]
  nonQfProjects: ProjectCartItem[]
} {
  const groups: Map<string, GroupedProjects> = new Map()
  const nonQf: ProjectCartItem[] = []

  cartItems.forEach(item => {
    if (item.roundId && item.roundName) {
      const key = String(item.roundId)

      if (!groups.has(key)) {
        groups.set(key, {
          roundId: item.roundId,
          roundName: item.roundName,
          selectedChainId: item.chainId ?? 0,
          selectedToken: item.selectedToken,
          tokenSymbol: item.tokenSymbol ?? '',
          tokenAddress: item.tokenAddress ?? '',
          tokenDecimals: item.tokenDecimals ?? 18,
          projects: [],
          totalAmount: '0',
          totalUsdValue: '0',
        })
      }

      const round = groups.get(key)!
      round.projects.push(item)

      const total = round.projects.reduce((sum, project) => {
        const amount = parseFloat(project.donationAmount || '0')
        return sum + amount
      }, 0)
      round.totalAmount = total.toString()
      const totalUsdValue = round.projects.reduce((sum, project) => {
        const priceInUSD = project.selectedToken?.priceInUSD ?? 0
        const amount = parseFloat(project.donationAmount || '0') * priceInUSD
        return sum + amount
      }, 0)
      round.totalUsdValue = totalUsdValue.toString()
    } else {
      nonQf.push(item)
    }
  })

  return {
    qfRoundGroups: Array.from(groups.values()),
    nonQfProjects: nonQf,
  }
}

export function useWalletTokens(
  selectedChainId: number,
  accountAddress?: string,
) {
  const chain = defineChain(selectedChainId)

  return useQuery<WalletTokenWithBalance[]>({
    queryKey: ['walletTokens', selectedChainId, accountAddress],
    enabled: Boolean(accountAddress && selectedChainId),
    queryFn: async () => {
      const tokens = await getTokensByChainId(selectedChainId)

      const results = await Promise.allSettled(
        tokens.map(async token => {
          const isNativeToken =
            !token.address ||
            token.address === ZERO_ADDRESS ||
            token.address === ''

          try {
            // Native token (ETH / xDAI / etc) balance is not an ERC20 contract call.
            if (isNativeToken) {
              const native = await getWalletBalance({
                client: thirdwebClient,
                chain,
                address: accountAddress!,
              })

              const decimals = token.decimals ?? native.decimals ?? 18
              const symbol = token.symbol || native.symbol || ''
              const name = token.name || symbol

              const value = native.value ?? BigInt(0)
              const displayValue =
                native.displayValue ?? formatUnits(value, decimals)

              const priceInUSD = 0

              return {
                address: ZERO_ADDRESS,
                symbol,
                decimals,
                name,
                chainId: selectedChainId,
                balance: String(value),
                formattedBalance: displayValue,
                priceInUSD,
                isGivbackEligible: token.isGivbacksEligible,
                coingeckoId: token.coingeckoId ?? null,
              } satisfies WalletTokenWithBalance
            }

            // ERC20 token balance
            const contract = getContract({
              client: thirdwebClient,
              chain,
              address: token.address as `0x${string}`,
            })

            const balance = await balanceOf({
              contract,
              address: accountAddress!,
            })

            const priceInUSD = 0

            return {
              address: token.address as `0x${string}`,
              symbol: token.symbol,
              decimals: token.decimals,
              name: token.name,
              chainId: selectedChainId,
              balance: String(balance),
              formattedBalance: formatUnits(balance, token.decimals),
              priceInUSD,
              isGivbackEligible: token.isGivbacksEligible,
              coingeckoId: token.coingeckoId ?? null,
            } satisfies WalletTokenWithBalance
          } catch {
            // Ignore broken tokens
            return null
          }
        }),
      )

      // Sort results by balance in descending order
      const sortedResults = results
        .flatMap(r => (r.status === 'fulfilled' && r.value ? [r.value] : []))
        .sort((a, b) => Number(b.formattedBalance) - Number(a.formattedBalance))

      return sortedResults
    },
  })
}

export async function getTokensByChainId(
  chainId: number,
): Promise<TokensByNetworkQuery['tokensByNetwork']> {
  const res = await graphQLClient.request(tokensByNetworkQuery, {
    networkId: chainId,
  })
  return res.tokensByNetwork
}

/**
 * Format a number to a human readable string
 *
 * @param value - The value to format
 * @param minDecimals - The minimum number of decimals to display
 * @param maxDecimals - The maximum number of decimals to display
 * @param locale - The locale to use for formatting
 * @returns The formatted number
 */
export function formatNumber(
  value: string | number,
  {
    minDecimals = 2,
    maxDecimals = 2,
    locale,
  }: {
    minDecimals?: number
    maxDecimals?: number
    locale?: string
  } = {},
) {
  const num = Number(value)

  if (!Number.isFinite(num)) return '0'

  return num.toLocaleString(locale, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  })
}

/**
 * Formats tiny positive values using a less-than label
 * to avoid displaying rounded "0.00" for non-zero balances.
 *
 * @param value - The value to format
 * @param minDecimals - The minimum number of decimals to display
 * @param maxDecimals - The maximum number of decimals to display
 * @param locale - The locale to use for formatting
 * @returns The formatted number
 *
 * @example
 * formatNumberWithTinyValueLabel('0.004', { minDecimals: 2, maxDecimals: 2 }) // "<0.00"
 */
export function formatNumberWithTinyValueLabel(
  value: string | number,
  {
    minDecimals = 2,
    maxDecimals = 2,
    locale,
  }: {
    minDecimals?: number
    maxDecimals?: number
    locale?: string
  } = {},
) {
  const num = Number(value)

  if (!Number.isFinite(num)) return '0'

  const tinyThreshold = 1 / 10 ** maxDecimals
  if (num > 0 && num < tinyThreshold) {
    const zeroLabel = formatNumber(0, {
      minDecimals,
      maxDecimals,
      locale,
    })
    return `<${zeroLabel}`
  }

  return formatNumber(num, {
    minDecimals,
    maxDecimals,
    locale,
  })
}

export async function getTokenPriceInUSDByCoingeckoId(
  coingeckoId: string | null | undefined,
) {
  if (!coingeckoId) return 0

  // Use React Query cache for TTL + request deduping.
  // Note: this is an imperative fetch, not a hook.
  const { getQueryClient } = await import('@/lib/react-query/query-client')
  const queryClient = getQueryClient()

  return await queryClient.fetchQuery({
    queryKey: ['coingecko', 'priceUsd', coingeckoId],
    staleTime: 60_000,
    gcTime: 60_000 * 5,
    queryFn: async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
            coingeckoId,
          )}&vs_currencies=usd`,
        )

        if (!res.ok) return 0

        const data = (await res.json()) as Record<string, { usd?: number }>
        return data?.[coingeckoId]?.usd ?? 0
      } catch {
        return 0
      }
    },
  })
}

async function getEthPriceUsdCached() {
  const { getQueryClient } = await import('@/lib/react-query/query-client')
  const queryClient = getQueryClient()

  return await queryClient.fetchQuery({
    queryKey: ['chainlink', 'ethUsd'],
    staleTime: 60_000,
    gcTime: 60_000 * 5,
    queryFn: async () => {
      try {
        const contract = getContract({
          client: thirdwebClient,
          chain: defineChain(MAINNET_CHAIN_ID),
          address: MAINNET_WETH_USD_FEED_ADDRESS,
          abi: chainlinkAggregatorAbi,
        })
        const price = await readContract({
          contract,
          method: 'latestAnswer',
          params: [],
        })
        return Number(price) / 1e8
      } catch {
        return 0
      }
    },
  })
}

async function getUniswapV2PairAddress(
  tokenA: `0x${string}`,
  tokenB: `0x${string}`,
) {
  const contract = getContract({
    client: thirdwebClient,
    chain: defineChain(MAINNET_CHAIN_ID),
    address: UNISWAP_V2_FACTORY_ADDRESS,
    abi: uniswapV2FactoryAbi,
  })
  const pair = (await readContract({
    contract,
    method: 'getPair',
    params: [tokenA, tokenB],
  })) as string

  return pair
}

async function getTokenPriceFromUniswapV2Pair(
  tokenAddress: `0x${string}`,
  tokenDecimals: number,
  quoteTokenAddress: `0x${string}`,
  quoteTokenDecimals: number,
) {
  const pairAddress = await getUniswapV2PairAddress(
    tokenAddress,
    quoteTokenAddress,
  )

  if (
    !pairAddress ||
    pairAddress === '0x0000000000000000000000000000000000000000'
  )
    return 0

  const pairContract = getContract({
    client: thirdwebClient,
    chain: defineChain(MAINNET_CHAIN_ID),
    address: pairAddress as `0x${string}`,
    abi: uniswapV2PairAbi,
  })

  const [reserves, token0, token1] = await Promise.all([
    readContract({
      contract: pairContract,
      method: 'getReserves',
      params: [],
    }) as Promise<[bigint, bigint, number]>,
    readContract({
      contract: pairContract,
      method: 'token0',
      params: [],
    }) as Promise<string>,
    readContract({
      contract: pairContract,
      method: 'token1',
      params: [],
    }) as Promise<string>,
  ])

  const tokenAddressLower = tokenAddress.toLowerCase()
  const quoteTokenLower = quoteTokenAddress.toLowerCase()
  const token0Address = token0.toLowerCase()
  const token1Address = token1.toLowerCase()

  let tokenReserve: number
  let quoteReserve: number

  if (
    tokenAddressLower === token0Address &&
    quoteTokenLower === token1Address
  ) {
    tokenReserve = Number(reserves[0])
    quoteReserve = Number(reserves[1])
  } else if (
    tokenAddressLower === token1Address &&
    quoteTokenLower === token0Address
  ) {
    tokenReserve = Number(reserves[1])
    quoteReserve = Number(reserves[0])
  } else {
    return 0
  }

  if (tokenReserve === 0 || quoteReserve === 0) return 0

  const tokenAmount = tokenReserve / 10 ** tokenDecimals
  const quoteAmount = quoteReserve / 10 ** quoteTokenDecimals

  return quoteAmount / tokenAmount
}

export async function getPriceFromUniswapV2(
  tokenAddress: `0x${string}`,
  tokenDecimals: number,
  chainId: number = MAINNET_CHAIN_ID,
) {
  if (chainId !== MAINNET_CHAIN_ID) return 0

  const normalizedToken = tokenAddress.toLowerCase()
  if (normalizedToken === MAINNET_WETH_ADDRESS.toLowerCase()) {
    return await getEthPriceUsdCached()
  }
  if (normalizedToken === MAINNET_USDC_ADDRESS.toLowerCase()) {
    return 1
  }

  try {
    const tokenInEth = await getTokenPriceFromUniswapV2Pair(
      tokenAddress,
      tokenDecimals,
      MAINNET_WETH_ADDRESS,
      18,
    )
    if (tokenInEth) {
      const ethUsd = await getEthPriceUsdCached()
      if (ethUsd) return tokenInEth * ethUsd
    }

    const tokenInUsdc = await getTokenPriceFromUniswapV2Pair(
      tokenAddress,
      tokenDecimals,
      MAINNET_USDC_ADDRESS,
      MAINNET_USDC_DECIMALS,
    )
    return tokenInUsdc || 0
  } catch (error) {
    console.warn('Failed to read Uniswap V2 price:', error)
    return 0
  }
}

/**
 * Calculate the total donation value for a round in
 * token amount
 *
 * @param roundId - The round ID
 * @param cartItems - The cart items
 * @returns The total donation value for the round
 */
export const calculateTotalDonationValueForRound = (
  roundId: number,
  cartItems: ProjectCartItem[],
) => {
  return cartItems
    .filter(item => item.roundId === roundId)
    .reduce((sum, item) => {
      const amount = parseFloat(item.donationAmount || '0')
      return sum + amount
    }, 0)
}

/**
 * Calculate the total donation value for a round in USD
 *
 * @param roundId - The round ID
 * @param cartItems - The cart items
 * @returns The total donation value for the round in USD
 */
export const calculateTotalDonationValueForRoundInUSD = (
  roundId: number,
  cartItems: ProjectCartItem[],
) => {
  return cartItems
    .filter(item => item.roundId === roundId)
    .reduce((sum, item) => {
      const priceInUSD = item.selectedToken?.priceInUSD ?? 0
      const amount = parseFloat(item.donationAmount || '0') * priceInUSD
      return sum + amount
    }, 0)
}

/**
 * Calculate the total matching value for a round
 *
 * @param roundId - The round ID
 * @param cartItems - The cart items
 * @returns The total matching value for the round
 */
export const calculateRoundTotalMatchingValue = (
  roundId: number,
  cartItems: ProjectCartItem[],
) => {
  return cartItems
    .filter(item => item.roundId === roundId)
    .reduce((sum, item) => {
      const amount = roundAmount(item.estimatedMatchingValue ?? 0)
      return sum + amount
    }, 0)
}
