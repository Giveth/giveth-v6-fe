import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import { archivedQfRoundsQuery } from '@/lib/graphql/queries'

export const useArchivedQfRounds = (skip: number = 0, take: number = 20) => {
  return useQuery({
    queryKey: ['archivedQfRounds', skip, take],
    queryFn: async () => {
      return graphQLClient.request(archivedQfRoundsQuery, { skip, take })
    },
  })
}
