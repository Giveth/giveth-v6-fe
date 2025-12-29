import { useQuery } from '@tanstack/react-query'
import { getContract } from 'thirdweb'
import { defineChain } from 'thirdweb/chains'
import { balanceOf } from 'thirdweb/extensions/erc20'
import { formatUnits } from 'viem'
import type { Project } from '@/context/CartContext'
import { graphQLClient } from '@/lib/graphql/client'
import type { TokensByNetworkQuery } from '@/lib/graphql/generated/graphql'
import { tokensByNetworkQuery } from '@/lib/graphql/queries'
import type { GroupedProjects } from '@/lib/types/cart'
import { thirdwebClient } from '../thirdweb/client'
import { type WalletTokenWithBalance } from '../types/chain'

/**
 * Group cart items by round
 * @param cartItems - The cart items to group
 * @returns {
 *   qfRoundGroups: GroupedProjects[]
 *   nonQfProjects: Project[]
 * }
 * @returns The grouped projects
 */
export function groupCartItemsByRound(cartItems: Project[]): {
  qfRoundGroups: GroupedProjects[]
  nonQfProjects: Project[]
} {
  const groups: Map<string, GroupedProjects> = new Map()
  const nonQf: Project[] = []

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
          // Skip invalid ERC20 definitions
          if (!token.address) return null

          try {
            const contract = getContract({
              client: thirdwebClient,
              chain,
              address: token.address,
            })

            const balance = await balanceOf({
              contract,
              address: accountAddress!,
            })

            if (balance === 0n) return null

            const priceInUSD = await getTokenPriceInUSDByCoingeckoId(
              token.coingeckoId,
            )

            return {
              address: token.address as `0x${string}`,
              symbol: token.symbol,
              decimals: token.decimals,
              name: token.name,
              chainId: selectedChainId,
              balance: String(balance),
              formattedBalance: formatUnits(balance, token.decimals),
              priceInUSD,
            } satisfies WalletTokenWithBalance
          } catch {
            // Ignore broken tokens
            return null
          }
        }),
      )

      return results.flatMap(r =>
        r.status === 'fulfilled' && r.value ? [r.value] : [],
      )
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

async function getTokenPriceInUSDByCoingeckoId(
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
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
          coingeckoId,
        )}&vs_currencies=usd`,
      )

      if (!res.ok) return 0

      const data = (await res.json()) as Record<string, { usd?: number }>
      return data?.[coingeckoId]?.usd ?? 0
    },
  })
}
