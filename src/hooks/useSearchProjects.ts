import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import { graphql } from '@/lib/graphql/generated'

const searchProjectsQuery = graphql(`
  query SearchProjects(
    $searchTerm: String!
    $skip: Int
    $take: Int
    $sortBy: String
    $sortDirection: String
  ) {
    searchProjects(
      searchTerm: $searchTerm
      skip: $skip
      take: $take
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      projects {
        id
        title
        slug
        description
        descriptionSummary
        image
        vouched
        totalDonations
        totalReactions
        countUniqueDonors
        qualityScore
        searchRank
        createdAt
        updatedAt
      }
      total
    }
  }
`)

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
      return graphQLClient.request(searchProjectsQuery, {
        searchTerm,
        skip,
        take,
        sortBy,
        sortDirection,
      })
    },
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
