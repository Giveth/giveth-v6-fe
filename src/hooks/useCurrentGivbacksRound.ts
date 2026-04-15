import { useQuery } from '@tanstack/react-query'
import { createGraphQLClient } from '@/lib/graphql/client'
import type {
  GetCurrentGivbacksRoundPublicQuery,
  GetCurrentGivbacksRoundQuery,
} from '@/lib/graphql/generated/graphql'
import {
  currentGivbacksRoundPublicQuery,
  currentGivbacksRoundQuery,
} from '@/lib/graphql/queries'

type CurrentGivbacksRoundResponse =
  | GetCurrentGivbacksRoundQuery
  | GetCurrentGivbacksRoundPublicQuery

type AuthCacheKey = string | number | null | undefined

const getTokenCacheKey = (token: string) => {
  let hash = 0
  for (let i = 0; i < token.length; i++) {
    hash = (hash << 5) - hash + token.charCodeAt(i)
    hash |= 0
  }
  return `token-${Math.abs(hash)}`
}

/**
 * Get the current GIVbacks round data
 * @returns The current GIVbacks round data
 */
export const useCurrentGivbacksRound = (
  token?: string,
  authCacheKey?: AuthCacheKey,
) => {
  const resolvedAuthCacheKey = token
    ? (authCacheKey ?? getTokenCacheKey(token))
    : 'public'

  return useQuery<CurrentGivbacksRoundResponse>({
    queryKey: [
      'currentGivbacksRound',
      token ? 'authenticated' : 'public',
      resolvedAuthCacheKey,
    ],
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
      const query = token
        ? currentGivbacksRoundQuery
        : currentGivbacksRoundPublicQuery

      return client.request(query)
    },
  })
}
