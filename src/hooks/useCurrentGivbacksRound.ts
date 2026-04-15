import { useQuery } from '@tanstack/react-query'
import { createGraphQLClient } from '@/lib/graphql/client'
import { currentGivbacksRoundQuery } from '@/lib/graphql/queries'

type CurrentGivbacksRoundResponse = {
  currentGivbacksRound: {
    prizePool?: number | string | null
    prizePoolCap?: number | string | null
    ticketCount?: number | string | null
    imageUrl?: string | null
    roundNumber?: number | null
    startsAt?: string | null
    endsAt?: string | null
  } | null
}

/**
 * Get the current GIVbacks round data
 * @returns The current GIVbacks round data
 */
export const useCurrentGivbacksRound = (token?: string) => {
  return useQuery<CurrentGivbacksRoundResponse>({
    queryKey: ['currentGivbacksRound', token],
    queryFn: async () => {
      const client = createGraphQLClient(
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined,
      )

      return client.request<CurrentGivbacksRoundResponse>(
        currentGivbacksRoundQuery,
      )
    },
    enabled: !!token,
  })
}
