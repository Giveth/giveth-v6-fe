import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import type { Maybe } from '@/lib/graphql/generated/graphql'

/**
 * QF rounds used by the apply gate.
 * Returns all rounds and lets the UI decide which are active/upcoming by date.
 */
const qfRoundsForApplyQuery = /* GraphQL */ `
  query QfRoundsForApply($skip: Int = 0, $take: Int = 100) {
    qfRounds(skip: $skip, take: $take) {
      total
      rounds {
        id
        name
        slug
        beginDate
        endDate
        eligibleNetworks
        applicationTypeformUrl
      }
    }
  }
`

type QfRoundsForApplyResponse = {
  qfRounds?: {
    total: number
    rounds: Array<{
      id: string
      name: string
      slug: string
      beginDate: string
      endDate: string
      eligibleNetworks: number[]
      applicationTypeformUrl?: Maybe<string>
    }>
  }
}

export const useQfRounds = () => {
  return useQuery<QfRoundsForApplyResponse>({
    queryKey: ['qfRoundsForApply'],
    queryFn: async () => {
      return graphQLClient.request<QfRoundsForApplyResponse>(
        qfRoundsForApplyQuery,
        {
          skip: 0,
          take: 100,
        },
      )
    },
    staleTime: 1000 * 60 * 5,
  })
}
