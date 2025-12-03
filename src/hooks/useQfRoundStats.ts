import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import { graphql } from '@/lib/graphql/generated'

const qfRoundStatsQuery = graphql(`
  query QfRoundStats($qfRoundId: Int!) {
    qfRoundStats(qfRoundId: $qfRoundId) {
      totalDonationsUsd
      donationsCount
      uniqueDonors
      qfRound {
        id
        allocatedFundUSD
        allocatedTokenSymbol
        beginDate
        endDate
      }
    }
  }
`)

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
