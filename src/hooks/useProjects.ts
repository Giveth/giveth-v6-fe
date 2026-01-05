import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import {
  type ProjectFiltersInput,
  ProjectSortField,
  SortDirection,
} from '@/lib/graphql/generated/graphql'
import { projectsQuery } from '@/lib/graphql/queries'

interface UseProjectsOptions {
  skip?: number
  take?: number
  orderBy?: ProjectSortField
  orderDirection?: SortDirection
  filters?: ProjectFiltersInput
  enabled?: boolean
}

export const useProjects = (options: UseProjectsOptions = {}) => {
  const {
    skip = 0,
    take = 20,
    orderBy = ProjectSortField.CreatedAt,
    orderDirection = SortDirection.Desc,
    filters,
    enabled = true,
  } = options

  return useQuery({
    queryKey: ['projects', skip, take, orderBy, orderDirection, filters],
    queryFn: async () => {
      return graphQLClient.request(projectsQuery, {
        skip,
        take,
        orderBy,
        orderDirection,
        filters,
      })
    },
    enabled: enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
