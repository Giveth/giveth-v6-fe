import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import type { InputMaybe } from '@/lib/graphql/generated/graphql'
import {
  ProjectsDocument,
  ProjectSortField,
  SortDirection,
} from '@/lib/graphql/generated/graphql'

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
    sortBy = ProjectSortField.CreatedAt,
    sortDirection = SortDirection.Desc,
    enabled = true,
  } = options

  return useQuery({
    queryKey: ['searchProjects', searchTerm, skip, take, sortBy, sortDirection],
    queryFn: async () => {
      return graphQLClient.request(ProjectsDocument, {
        skip: skip as InputMaybe<number>,
        take: take as InputMaybe<number>,
        orderBy: sortBy as InputMaybe<ProjectSortField>,
        orderDirection: sortDirection as InputMaybe<SortDirection>,
        filters: {
          searchTerm,
        },
      })
    },
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
