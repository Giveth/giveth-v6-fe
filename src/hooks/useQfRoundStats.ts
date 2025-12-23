import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import { qfRoundStatsQuery } from '@/lib/graphql/queries'

export const useQfRoundStats = (qfRoundId?: number) => {
  return useQuery({
    queryKey: ['qfRoundStats', qfRoundId],
    queryFn: async () => {
      if (!qfRoundId) return null
      return graphQLClient.request(qfRoundStatsQuery, { qfRoundId })
    },
    enabled: !!qfRoundId,
  })
}
