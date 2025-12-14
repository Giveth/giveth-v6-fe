import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import type { ArchivedQfRoundsQuery } from '@/lib/graphql/generated/graphql'
import { archivedQfRoundsQuery } from '@/lib/graphql/queries'

export const useArchivedQfRounds = (skip: number = 0, take: number = 20) => {
  return useQuery<ArchivedQfRoundsQuery>({
    queryKey: ['archivedQfRounds', skip, take],
    queryFn: async () => {
      return graphQLClient.request(archivedQfRoundsQuery, { skip, take })
    },
  })
}
