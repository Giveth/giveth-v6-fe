import { useQuery } from '@tanstack/react-query'
import { ProjectSortField, SortDirection } from '@/lib/enums'
import { graphQLClient } from '@/lib/graphql/client'
import { ProjectsDocument } from '@/lib/graphql/generated/graphql'

export interface SearchProjectsOptions {
  searchTerm: string
  skip?: number
  take?: number
  sortBy?: ProjectSortField
  sortDirection?: SortDirection
  enabled?: boolean
}

export const useSearchProjects = (options: SearchProjectsOptions) => {
  const {
    searchTerm,
    skip = 0,
    take = 20,
    sortBy = ProjectSortField.Relevance,
    sortDirection = SortDirection.DESC,
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
