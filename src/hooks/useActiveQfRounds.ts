import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import type { ActiveQfRoundsQuery } from '@/lib/graphql/generated/graphql'
import { activeQfRoundsQuery } from '@/lib/graphql/queries'

export const useActiveQfRounds = () => {
  return useQuery<ActiveQfRoundsQuery>({
    queryKey: ['activeQfRounds'],
    queryFn: async () => {
      return graphQLClient.request(activeQfRoundsQuery)
    },
  })
}
