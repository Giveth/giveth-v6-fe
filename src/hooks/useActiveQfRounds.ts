import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import { activeQfRoundsQuery } from '@/lib/graphql/queries'

export const useActiveQfRounds = () => {
  return useQuery({
    queryKey: ['activeQfRounds'],
    queryFn: async () => {
      return graphQLClient.request(activeQfRoundsQuery)
    },
  })
}
