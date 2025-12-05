import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import {
  DonationsByProjectDocument,
  ProjectBySlugDocument,
  ProjectsDocument,
} from '@/lib/graphql/generated/graphql'

export const useProjectBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['projectBySlug', slug],
    queryFn: async () => {
      return graphQLClient.request(ProjectBySlugDocument, { slug })
    },
    enabled: !!slug,
  })
}

export const useProjectDonations = (
  projectId: number,
  skip: number = 0,
  take: number = 10,
) => {
  return useQuery({
    queryKey: ['donationsByProject', projectId, skip, take],
    queryFn: async () => {
      return graphQLClient.request(DonationsByProjectDocument, {
        projectId,
        skip,
        take,
      })
    },
    enabled: !!projectId,
  })
}

export const useProjects = (skip: number = 0, take: number = 10) => {
  return useQuery({
    queryKey: ['projects', skip, take],
    queryFn: async () => {
      return graphQLClient.request(ProjectsDocument, {
        skip,
        take,
      })
    },
  })
}
