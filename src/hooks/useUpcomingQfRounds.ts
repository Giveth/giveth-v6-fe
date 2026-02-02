import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import { type QfRoundsQuery } from '@/lib/graphql/generated/graphql'
import { qfRoundsQuery } from '@/lib/graphql/queries'

/**
 * Upcoming QF rounds (beginDate in the future).
 */
export const useUpcomingQfRounds = () => {
  return useQuery<QfRoundsQuery>({
    queryKey: ['upcomingQfRounds'],
    queryFn: async () => {
      const data = await graphQLClient.request(qfRoundsQuery, {
        skip: 0,
        take: 50,
      })
      const now = Date.now()
      return {
        ...data,
        qfRounds: {
          ...data.qfRounds,
          rounds: data.qfRounds.rounds.filter(round => {
            const begin = round.beginDate
              ? new Date(round.beginDate).getTime()
              : 0
            return begin > now
          }),
        },
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}
