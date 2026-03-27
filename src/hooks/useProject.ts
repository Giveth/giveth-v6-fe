import { useQuery } from '@tanstack/react-query'
import {
  STAKING_POOLS,
  SUBGRAPH_POLLING_INTERVAL,
} from '@/lib/constants/staking-power-constants'
import { graphQLClient } from '@/lib/graphql/client'
import {
  DonationSortField,
  SortDirection,
} from '@/lib/graphql/generated/graphql'
import {
  donationsByProjectQuery,
  projectBoostersQuery,
  projectByIDQuery,
  projectGivpowerCountQuery,
  projectBySlugQuery,
  similarProjectsBySlugQuery,
} from '@/lib/graphql/queries'
import { fetchUserOpGivPowerFromSubgraph } from '@/lib/helpers/opGivPowerSubgraph'

export const useProjectBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['projectBySlug', slug],
    queryFn: async () => {
      return graphQLClient.request(projectBySlugQuery, { slug })
    },
    enabled: !!slug,
  })
}

export const useProjectDonations = (
  projectId: number,
  skip: number = 0,
  take: number = 10,
  qfRoundId?: number,
  orderBy?: DonationSortField,
  orderDirection?: SortDirection,
) => {
  return useQuery({
    queryKey: [
      'donationsByProject',
      projectId,
      skip,
      take,
      qfRoundId,
      orderBy || DonationSortField.CreatedAt,
      orderDirection || SortDirection.Desc,
    ],
    queryFn: async () => {
      return graphQLClient.request(donationsByProjectQuery, {
        orderBy: orderBy || DonationSortField.CreatedAt,
        orderDirection: orderDirection || SortDirection.Desc,
        projectId,
        skip,
        take,
        qfRoundId,
      })
    },
    enabled: !!projectId,
    // This table is interactive (filter/sort/pagination). We prefer refetching
    // whenever the params change, even if the query key was used recently.
    staleTime: 0,
  })
}

export const useSimilarProjectsBySlug = (
  slug: string,
  skip: number = 0,
  take: number = 3,
) => {
  return useQuery({
    queryKey: ['similarProjectsBySlug', slug, skip, take],
    queryFn: async () => {
      return graphQLClient.request(similarProjectsBySlugQuery, {
        slug,
        skip,
        take,
      })
    },
    enabled: !!slug,
  })
}

/**
 * Hook to get a project by its ID
 *
 * @param projectId - The ID of the project
 * @returns The project
 */
export const useProjectById = (projectId: number) => {
  return useQuery({
    queryKey: ['projectById', projectId],
    queryFn: async () => {
      return graphQLClient.request(projectByIDQuery, { id: projectId })
    },
    enabled: !!projectId,
  })
}

type ProjectGivpowerCountResponse = {
  getPowerBoosting: {
    totalCount: number
  }
}

type ProjectBoostersResponse = {
  getPowerBoosting: {
    totalCount: number
    powerBoostings: Array<{
      id: number
      projectId: number
      userId: number
      percentage: number
      powerRank?: number | null
      updatedAt: string
      user?: {
        id: string
        name?: string | null
        firstName?: string | null
        lastName?: string | null
        wallets: Array<{
          address: string
          isPrimary: boolean
        }>
      } | null
      givpowerAmount?: number
      userTotalGivpower?: number
    }>
  }
}

const BOOST_TOTAL_GIVPOWER_CHAIN_IDS = [10, 100] as const
const PROJECT_BOOSTERS_SUBGRAPH_CONCURRENCY = 6

const formatUnitsFromWei = (value: string, decimals = 18): string => {
  const v = BigInt(value || '0')
  const base = 10n ** BigInt(decimals)
  const whole = v / base
  const fraction = v % base
  const fractionStr = fraction
    .toString()
    .padStart(decimals, '0')
    .replace(/0+$/, '')

  return fractionStr ? `${whole}.${fractionStr}` : whole.toString()
}

const runWithConcurrency = async <T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
) => {
  const normalizedConcurrency = Math.max(
    1,
    Math.min(concurrency, items.length || 1),
  )
  let nextIndex = 0

  await Promise.all(
    Array.from({ length: normalizedConcurrency }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex
        nextIndex += 1
        await worker(items[currentIndex])
      }
    }),
  )
}

export const useProjectGivpowerCount = (projectId?: number) => {
  return useQuery({
    queryKey: ['projectGivpowerCount', projectId],
    queryFn: async () => {
      return graphQLClient.request<ProjectGivpowerCountResponse>(
        projectGivpowerCountQuery,
        {
          input: {
            projectId,
            skip: 0,
            take: 1,
          },
        },
      )
    },
    enabled: typeof projectId === 'number' && projectId > 0,
  })
}

export const useProjectBoosters = ({
  projectId,
  skip = 0,
  take = 1000,
}: {
  projectId?: number
  skip?: number
  take?: number
}) => {
  return useQuery({
    queryKey: ['projectBoosters', projectId, skip, take],
    queryFn: async () => {
      const response = await graphQLClient.request<ProjectBoostersResponse>(
        projectBoostersQuery,
        {
          input: {
            projectId,
            skip,
            take,
            orderBy: {
              field: 'Percentage',
              direction: 'DESC',
            },
          },
        },
      )

      const powerBoostings = response?.getPowerBoosting?.powerBoostings ?? []
      const uniqueWalletAddresses = Array.from(
        new Set(
          powerBoostings.flatMap(boost =>
            (boost.user?.wallets ?? [])
              .map(wallet => wallet.address?.toLowerCase())
              .filter((address): address is string => Boolean(address)),
          ),
        ),
      )
      const walletGivpowerMap = new Map<string, number>()
      const walletChainBalanceWeiCache = new Map<string, Promise<bigint>>()

      const getWalletChainBalanceWei = (address: string, chainId: number) => {
        const cacheKey = `${address}:${chainId}`
        const cachedPromise = walletChainBalanceWeiCache.get(cacheKey)
        if (cachedPromise) return cachedPromise

        const balancePromise = (async () => {
          const config = STAKING_POOLS[chainId]
          const subgraphUrl = config?.subgraphUrl
          const lmAddress = config?.GIVPOWER?.LM_ADDRESS

          if (!subgraphUrl || !lmAddress) return 0n

          try {
            const chainBalance = await fetchUserOpGivPowerFromSubgraph({
              subgraphUrl,
              lmAddress,
              userAddress: address,
            })
            return BigInt(chainBalance.balanceWei || '0')
          } catch (error) {
            console.warn(
              `[ProjectBoosters] Failed to fetch GIVpower for wallet ${address} on chain ${chainId}`,
              error,
            )
            return 0n
          }
        })()

        walletChainBalanceWeiCache.set(cacheKey, balancePromise)
        return balancePromise
      }

      await runWithConcurrency(
        uniqueWalletAddresses,
        PROJECT_BOOSTERS_SUBGRAPH_CONCURRENCY,
        async address => {
          const chainBalancesWei = await Promise.all(
            BOOST_TOTAL_GIVPOWER_CHAIN_IDS.map(chainId =>
              getWalletChainBalanceWei(address, chainId),
            ),
          )
          const totalBalanceWei = chainBalancesWei.reduce(
            (sum, balanceWei) => sum + balanceWei,
            0n,
          )

          const totalBalance = Number(
            formatUnitsFromWei(totalBalanceWei.toString()),
          )
          walletGivpowerMap.set(
            address,
            Number.isFinite(totalBalance) ? totalBalance : 0,
          )
        },
      )

      const boostersWithAmount = powerBoostings.map(boost => {
        const userWalletAddresses = Array.from(
          new Set(
            (boost.user?.wallets ?? [])
              .map(wallet => wallet.address?.toLowerCase())
              .filter((address): address is string => Boolean(address)),
          ),
        )
        const userTotalGivpower = userWalletAddresses.reduce(
          (sum, address) => sum + (walletGivpowerMap.get(address) ?? 0),
          0,
        )
        const percentage = Number(boost.percentage || 0)
        const givpowerAmount = (userTotalGivpower * percentage) / 100

        return {
          ...boost,
          givpowerAmount,
          userTotalGivpower,
        }
      })

      return {
        ...response,
        getPowerBoosting: {
          ...response.getPowerBoosting,
          powerBoostings: boostersWithAmount,
        },
      }
    },
    enabled: typeof projectId === 'number' && projectId > 0,
    staleTime: SUBGRAPH_POLLING_INTERVAL,
  })
}
