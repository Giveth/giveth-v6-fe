import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  STAKING_POOLS_FOR_BOOSTING,
  SUBGRAPH_POLLING_INTERVAL,
} from '@/lib/constants/staking-power-constants'
import { createGraphQLClient, graphQLClient } from '@/lib/graphql/client'
import {
  estimatedMatchingQuery,
  fetchCurrentProjectBoostV6Query,
  fetchPowerBoostingInfoV6Query,
  fetchUserBoostForProjectQuery,
  setMultiplePowerBoostingMutation,
  setSinglePowerBoostingMutation,
} from '@/lib/graphql/queries'
import { fetchUserOpGivPowerFromSubgraph } from '@/lib/helpers/opGivPowerSubgraph'

/**
 * Hook to get the estimated matching for a project
 *
 * @param donationAmount - The amount of the donation
 * @param donorAddress - The address of the donor
 * @param projectId - The id of the project
 * @param qfRoundId - The id of the qf round
 *
 * @returns The estimated matching for the project
 * @example
 *
 * const { data, isLoading, error } = useProjectEstimatedMatching({
 *   donationAmount: 100,
 *   donorAddress: '0x1234567890123456789012345678901234567890',
 *   projectId: 1,
 *   qfRoundId: 1,
 * })
 */
export function useProjectEstimatedMatching({
  donationAmount,
  donorAddress,
  projectId,
  qfRoundId,
}: {
  donationAmount: number
  donorAddress: string
  projectId: number
  qfRoundId: number
}) {
  return useQuery({
    queryKey: [
      'projectEstimatedMatching',
      donationAmount,
      donorAddress,
      projectId,
      qfRoundId,
    ],
    queryFn: () =>
      graphQLClient.request(estimatedMatchingQuery, {
        donationAmount,
        donorAddress,
        projectId,
        qfRoundId,
      }),
  })
}

type UserBoostForProjectResponse = {
  getPowerBoosting: {
    totalCount: number
    powerBoostings: Array<{
      projectId: number
      percentage: number
      updatedAt: string
    }>
  }
}

type PowerBoostingInfoV6Response = {
  getPowerBoosting: {
    totalCount: number
    powerBoostings: Array<{
      id: string
      userId: number
      projectId: number
      percentage: number
      updatedAt: string
      user?: {
        id: number
      } | null
      project?: {
        id: number
        title?: string | null
        slug?: string | null
        reviewStatus?: string | null
        powerRank?: number | null
      } | null
    }>
  }
}

type CurrentProjectBoostV6Response = {
  getPowerBoosting: {
    totalCount: number
    powerBoostings: Array<{
      projectId: number
      percentage: number
    }>
  }
}

type PowerBoostingMutationItem = {
  id: string | number
  userId: number
  projectId: number
  percentage: number
  powerRank: number | null
  updatedAt: string
}

type SetSinglePowerBoostingResponse = {
  setSinglePowerBoosting: PowerBoostingMutationItem[]
}

type SetMultiplePowerBoostingResponse = {
  setMultiplePowerBoosting: PowerBoostingMutationItem[]
}

type TotalGivpowerAcrossBoostNetworksResponse = {
  totalBalanceWei: string
  totalBalance: string
  totalBalanceNumber: number | null
  perChain: Array<{
    chainId: number
    balanceWei: string
    balance: string
  }>
}

// Only include networks with active GIVpower staking configuration.
const BOOST_TOTAL_GIVPOWER_CHAIN_IDS = Object.entries(
  STAKING_POOLS_FOR_BOOSTING,
)
  .filter(
    ([, config]) =>
      Boolean(config?.subgraphUrl) && Boolean(config?.GIVPOWER?.LM_ADDRESS),
  )
  .map(([chainId]) => Number(chainId))
  .filter(Number.isFinite)

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
 * Hook to get the user boost for a project
 *
 * @param userId - The id of the user
 * @param projectId - The id of the project
 * @param token - The token of the user
 * @param enabled - Whether the hook is enabled
 *
 * @returns The user boost for the project
 * @example
 *
 * const { data, isLoading, error } = useUserBoostForProject({
 *   userId: 1,
 *   projectId: 1,
 *   token: '1234567890',
 * })
 */
export function useUserBoostForProject({
  userId,
  projectId,
  token,
  enabled = true,
}: {
  userId?: number
  projectId?: number
  token?: string | null
  enabled?: boolean
}) {
  const isAuthenticated = Boolean(token)

  return useQuery({
    queryKey: ['userBoostForProject', userId, projectId, isAuthenticated],
    queryFn: async () => {
      const client = createGraphQLClient(
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined,
      )
      return client.request<UserBoostForProjectResponse>(
        fetchUserBoostForProjectQuery,
        {
          userId: userId ?? 0,
          projectId: projectId ?? 0,
        },
      )
    },
    enabled:
      enabled &&
      Number.isFinite(userId) &&
      Number.isFinite(projectId) &&
      (userId ?? 0) > 0 &&
      (projectId ?? 0) > 0,
  })
}

/**
 * Hook to get the data for the boost modal
 *
 * @param userId - The id of the user
 * @param currentProjectId - The id of the current project
 * @param token - The token of the user
 * @param enabled - Whether the hook is enabled
 * @param take - The number of projects to take
 * @param skip - The number of projects to skip
 *
 * @returns The data for the boost modal
 * @example
 *
 * const { data, isLoading, error } = useBoostModalData({
 *   userId: 1,
 *   currentProjectId: 1,
 *   token: '1234567890',
 *   enabled: true,
 *   take: 50,
 *   skip: 0,
 * })
 */
export function useBoostModalData({
  userId,
  currentProjectId,
  token,
  enabled = true,
  take = 50,
  skip = 0,
}: {
  userId?: number
  currentProjectId?: number
  token?: string | null
  enabled?: boolean
  take?: number
  skip?: number
}) {
  const normalizedUserId = Number(userId)
  const normalizedCurrentProjectId = Number(currentProjectId)
  const isAuthenticated = Boolean(token)
  const hasValidUserId =
    Number.isFinite(normalizedUserId) && normalizedUserId > 0
  const hasValidProjectId =
    Number.isFinite(normalizedCurrentProjectId) &&
    normalizedCurrentProjectId > 0

  const isBoostModalQueryEnabled = enabled && hasValidUserId

  return useQuery({
    queryKey: [
      'boostModalData',
      userId,
      currentProjectId,
      take,
      skip,
      isAuthenticated,
    ],
    queryFn: async () => {
      if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
        return {
          boostedProjects:
            [] as PowerBoostingInfoV6Response['getPowerBoosting']['powerBoostings'],
          boostedProjectsCount: 0,
          currentProjectAllocation: 0,
        }
      }

      const client = createGraphQLClient(
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined,
      )

      const listRequest = client.request<PowerBoostingInfoV6Response>(
        fetchPowerBoostingInfoV6Query,
        {
          input: {
            userId: normalizedUserId,
            take,
            skip,
            orderBy: {
              field: 'UpdatedAt',
              direction: 'DESC',
            },
          },
        },
      )
      const currentProjectRequest: Promise<CurrentProjectBoostV6Response> =
        hasValidProjectId
          ? client.request<CurrentProjectBoostV6Response>(
              fetchCurrentProjectBoostV6Query,
              {
                input: {
                  userId: normalizedUserId,
                  projectId: normalizedCurrentProjectId,
                  take: 1,
                  skip: 0,
                },
              },
            )
          : Promise.resolve({
              getPowerBoosting: {
                totalCount: 0,
                powerBoostings: [],
              },
            })

      const [listRes, currentProjectRes] = await Promise.all([
        listRequest,
        currentProjectRequest,
      ])

      const boostedProjects = listRes?.getPowerBoosting?.powerBoostings ?? []
      const boostedProjectsCount = listRes?.getPowerBoosting?.totalCount ?? 0
      const currentProjectAllocation = Math.max(
        0,
        Math.min(
          100,
          Number(
            currentProjectRes?.getPowerBoosting?.powerBoostings?.[0]
              ?.percentage ?? 0,
          ) || 0,
        ),
      )

      return {
        boostedProjects,
        boostedProjectsCount,
        currentProjectAllocation,
      }
    },
    enabled: isBoostModalQueryEnabled,
  })
}

export function useTotalGivpowerAcrossBoostNetworks({
  walletAddress,
  enabled = true,
}: {
  walletAddress?: string
  enabled?: boolean
}) {
  const normalizedAddress = walletAddress?.toLowerCase()

  return useQuery({
    queryKey: ['totalGivpowerAcrossBoostNetworks', normalizedAddress],
    enabled: enabled && !!normalizedAddress,
    staleTime: SUBGRAPH_POLLING_INTERVAL,
    queryFn: async (): Promise<TotalGivpowerAcrossBoostNetworksResponse> => {
      if (!normalizedAddress) {
        return {
          totalBalanceWei: '0',
          totalBalance: '0',
          totalBalanceNumber: 0,
          perChain: [],
        }
      }

      const perChain = await Promise.all(
        BOOST_TOTAL_GIVPOWER_CHAIN_IDS.map(async chainId => {
          const config = STAKING_POOLS_FOR_BOOSTING[chainId]
          const subgraphUrl = config?.subgraphUrl
          const lmAddress = config?.GIVPOWER?.LM_ADDRESS

          if (!subgraphUrl || !lmAddress) {
            throw new Error(
              `Missing GIVpower subgraph configuration for chain ${chainId}`,
            )
          }

          try {
            const result = await fetchUserOpGivPowerFromSubgraph({
              subgraphUrl,
              lmAddress,
              userAddress: normalizedAddress,
            })

            return {
              chainId,
              balanceWei: result.balanceWei,
              balance: result.balance,
            }
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Unknown subgraph error'
            throw new Error(
              `Failed to fetch GIVpower for chain ${chainId}: ${message}`,
            )
          }
        }),
      )

      const totalBalanceWei = perChain.reduce(
        (acc, chain) => acc + BigInt(chain.balanceWei || '0'),
        0n,
      )
      const totalBalance = formatUnitsFromWei(totalBalanceWei.toString(), 18)
      const totalBalanceNumber = Number(totalBalance)

      return {
        totalBalanceWei: totalBalanceWei.toString(),
        totalBalance,
        totalBalanceNumber: Number.isFinite(totalBalanceNumber)
          ? totalBalanceNumber
          : null,
        perChain,
      }
    },
  })
}

/**
 * Hook to set power boosting allocations
 * @param token - The token of the user
 * @returns The boost mutation state
 */
export function useSetPowerBoosting({ token }: { token?: string | null }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      input:
        | {
            projectId: number
            percentage: number
          }
        | {
            projectIds: number[]
            percentages: number[]
          },
    ) => {
      if (!token) throw new Error('Missing authentication token')

      const client = createGraphQLClient({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if ('projectId' in input) {
        if (!Number.isInteger(input.projectId) || input.projectId <= 0) {
          throw new Error('Invalid project id')
        }
        if (
          !Number.isFinite(input.percentage) ||
          input.percentage < 0 ||
          input.percentage > 100
        ) {
          throw new Error('Invalid percentage value')
        }

        return client.request<SetSinglePowerBoostingResponse>(
          setSinglePowerBoostingMutation,
          {
            projectId: input.projectId,
            percentage: input.percentage,
          },
        )
      }

      const { projectIds, percentages } = input
      if (!projectIds.length || !percentages.length) {
        throw new Error('Missing projectIds or percentages')
      }
      if (projectIds.length !== percentages.length) {
        throw new Error('projectIds and percentages length mismatch')
      }
      if (
        projectIds.some(
          projectId => !Number.isInteger(projectId) || projectId <= 0,
        )
      ) {
        throw new Error('Invalid project id')
      }
      if (
        percentages.some(
          percentage =>
            !Number.isFinite(percentage) || percentage < 0 || percentage > 100,
        )
      ) {
        throw new Error('Invalid percentage value')
      }

      return client.request<SetMultiplePowerBoostingResponse>(
        setMultiplePowerBoostingMutation,
        {
          projectIds,
          percentages,
        },
      )
    },
    onSuccess: async (_data, variables) => {
      const affectedProjectIds =
        'projectId' in variables ? [variables.projectId] : variables.projectIds

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['boostModalData'] }),
        queryClient.invalidateQueries({ queryKey: ['userBoostForProject'] }),
        ...affectedProjectIds.map(projectId =>
          Promise.all([
            queryClient.invalidateQueries({
              queryKey: ['projectGivpowerCount', projectId],
            }),
            queryClient.invalidateQueries({
              queryKey: ['projectBoosters', projectId],
            }),
          ]),
        ),
      ])
    },
    onError: error => {
      console.error('[Boost][Mutation] setPowerBoosting failed', error)
    },
  })
}
