import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import {
  QfRoundStatusFilter,
  type QfRoundsQuery,
} from '@/lib/graphql/generated/graphql'
import { qfRoundsQuery } from '@/lib/graphql/queries'

/**
 * Upcoming QF rounds (beginDate in the future).
 */
export const useUpcomingQfRounds = () => {
  return useQuery<QfRoundsQuery>({
    queryKey: ['upcomingQfRounds'],
    queryFn: async () => {
      return graphQLClient.request(qfRoundsQuery, {
        skip: 0,
        take: 50,
        filters: { status: QfRoundStatusFilter.Upcoming },
      })
    },
    staleTime: 1000 * 60 * 5,
  })
}
