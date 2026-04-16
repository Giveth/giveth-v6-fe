import { useQuery } from '@tanstack/react-query'
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

/**
 * Hook to get a project by its slug
 *
 * @param slug - The slug of the project
 * @returns The project
 */
export const useProjectBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['projectBySlug', slug],
    queryFn: async () => {
      return graphQLClient.request(projectBySlugQuery, { slug })
    },
    enabled: !!slug,
  })
}

/**
 * Hook to get the donations for a project
 *
 * @param projectId - The ID of the project
 * @param skip - The number of donations to skip
 * @param take - The number of donations to take
 * @param qfRoundId - The ID of the QF round
 * @param orderBy - The field to order by
 * @param orderDirection - The direction to order by
 * @returns The donations for the project
 */
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

/**
 * Hook to get the similar projects by slug
 *
 * @param slug - The slug of the project
 * @param skip - The number of projects to skip
 * @param take - The number of projects to take
 * @returns The similar projects
 */
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
            take: 1000,
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
      return graphQLClient.request<ProjectBoostersResponse>(
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
    },
    enabled: typeof projectId === 'number' && projectId > 0,
  })
}
