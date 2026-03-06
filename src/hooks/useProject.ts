import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import {
  DonationSortField,
  SortDirection,
} from '@/lib/graphql/generated/graphql'
import {
  donationsByProjectQuery,
  projectByIDQuery,
  projectBySlugQuery,
  similarProjectsBySlugQuery,
} from '@/lib/graphql/queries'

/**
 * Hook to get a project by its slug
 * @param slug - The slug of the project
 * @param options - The options for the query
 * @param options.noCache - Whether to cache the query
 * @returns The project by slug. If the project is not found, returns null.
 */
export const useProjectBySlug = (
  slug: string,
  options?: { noCache?: boolean },
) => {
  const noCacheSeedRef = useRef(`${Date.now()}-${Math.random()}`)
  const noCache = Boolean(options?.noCache)

  return useQuery({
    queryKey: noCache
      ? ['projectBySlug', slug, noCacheSeedRef.current]
      : ['projectBySlug', slug],
    queryFn: async () => {
      return graphQLClient.request(projectBySlugQuery, { slug })
    },
    enabled: !!slug,
    staleTime: noCache ? 0 : undefined,
    gcTime: noCache ? 0 : undefined,
    refetchOnMount: noCache ? 'always' : undefined,
  })
}

/**
 * Hook to get the donations for a project
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
 * Hook to get projects similar to a project slug
 * @param slug - The slug of the current project
 * @param skip - The number of projects to skip
 * @param take - The number of projects to take
 * @returns Similar projects for the given slug
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
