import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import { QfRoundStatsDocument } from '@/lib/graphql/generated/graphql'

export const useQfRoundStats = (qfRoundId?: number) => {
  return useQuery({
    queryKey: ['qfRoundStats', qfRoundId],
    queryFn: async () => {
      if (!qfRoundId) return null
      return graphQLClient.request(QfRoundStatsDocument, { qfRoundId })
    },
    enabled: !!qfRoundId,
  })
}
