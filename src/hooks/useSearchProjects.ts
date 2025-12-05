import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import { ProjectsDocument } from '@/lib/graphql/generated/graphql'

export interface SearchProjectsOptions {
  searchTerm: string
  skip?: number
  take?: number
  sortBy?: 'relevance' | 'createdAt' | 'totalDonations'
  sortDirection?: 'asc' | 'desc'
  enabled?: boolean
}

export const useSearchProjects = (options: SearchProjectsOptions) => {
  const {
    searchTerm,
    skip = 0,
    take = 20,
    sortBy = 'relevance',
    sortDirection = 'desc',
    enabled = true,
  } = options

  return useQuery({
    queryKey: ['searchProjects', searchTerm, skip, take, sortBy, sortDirection],
    queryFn: async () => {
      return graphQLClient.request(ProjectsDocument, {
        skip,
        take,
        orderBy: sortBy,
        orderDirection: sortDirection,
        filters: {
          searchTerm,
        },
      })
    },
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
