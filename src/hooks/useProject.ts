import { env } from 'process'
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
        avatar?: string | null
        primaryEns?: string | null
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

// For production we use these chains, for development we use these chains
const BOOST_TOTAL_GIVPOWER_CHAIN_IDS =
  env.VERCEL_ENV === 'production'
    ? ([10, 100] as const)
    : ([100, 11155420] as const)

/**
 * Format a value from wei to a string with decimals
 *
 * @param value - The value to format
 * @param decimals - The number of decimals to format to
 * @returns The formatted value
 */
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

/**
 * Hook to get the GIVpower count for a project
 *
 * @param projectId - The ID of the project
 * @returns The GIVpower count for the project
 */
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

/**
 * Hook to get the boosters for a project
 *
 * @param projectId - The ID of the project
 * @param skip - The number of boosters to skip
 * @param take - The number of boosters to take
 * @returns The boosters for the project
 */
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
      const activePowerBoostings = powerBoostings.filter(
        boost => Number(boost.percentage || 0) > 0,
      )
      const uniqueWalletAddresses = Array.from(
        new Set(
          activePowerBoostings.flatMap(boost =>
            (boost.user?.wallets ?? [])
              .map(wallet => wallet.address?.toLowerCase())
              .filter((address): address is string => Boolean(address)),
          ),
        ),
      )
      const walletGivpowerMap = new Map<string, number>()

      await Promise.all(
        uniqueWalletAddresses.map(async address => {
          const totalBalanceWei = await BOOST_TOTAL_GIVPOWER_CHAIN_IDS.reduce<
            Promise<bigint>
          >(async (sumPromise, chainId) => {
            const sum = await sumPromise
            const config = STAKING_POOLS[chainId]
            const subgraphUrl = config?.subgraphUrl
            const lmAddress = config?.GIVPOWER?.LM_ADDRESS

            if (!subgraphUrl || !lmAddress) return sum

            try {
              const chainBalance = await fetchUserOpGivPowerFromSubgraph({
                subgraphUrl,
                lmAddress,
                userAddress: address,
              })
              return sum + BigInt(chainBalance.balanceWei || '0')
            } catch (error) {
              console.warn(
                `[ProjectBoosters] Failed to fetch GIVpower for wallet ${address} on chain ${chainId}`,
                error,
              )
              return sum
            }
          }, Promise.resolve(0n))

          const totalBalance = Number(
            formatUnitsFromWei(totalBalanceWei.toString()),
          )
          walletGivpowerMap.set(
            address,
            Number.isFinite(totalBalance) ? totalBalance : 0,
          )
        }),
      )

      const boostersWithAmount = powerBoostings.map(boost => {
        const percentage = Number(boost.percentage || 0)
        if (percentage <= 0) {
          return {
            ...boost,
            givpowerAmount: 0,
            userTotalGivpower: 0,
          }
        }

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
