import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import {
  DonationSortField,
  SortDirection,
} from '@/lib/graphql/generated/graphql'
import {
  donationsByProjectQuery,
  projectBySlugQuery,
  similarProjectsBySlugQuery,
} from '@/lib/graphql/queries'

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
