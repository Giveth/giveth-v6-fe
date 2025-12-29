import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
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
) => {
  return useQuery({
    queryKey: ['donationsByProject', projectId, skip, take, qfRoundId],
    queryFn: async () => {
      return graphQLClient.request(donationsByProjectQuery, {
        projectId,
        skip,
        take,
        qfRoundId,
      })
    },
    enabled: !!projectId,
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
