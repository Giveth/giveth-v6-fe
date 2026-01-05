'use client'

import { useQuery } from '@tanstack/react-query'
import { useSiweAuth } from '@/context/AuthContext'
import { createGraphQLClient } from '@/lib/graphql/client'
import type {
  CheckEligibilityResultEntity,
  CheckPassportEligibilityInput,
} from '@/lib/graphql/generated/graphql'
import { checkPassportEligibilityQuery } from '@/lib/graphql/queries'

type CheckPassportEligibilityResponse = {
  checkPassportEligibility: CheckEligibilityResultEntity
}

export const usePassportEligibility = (
  input?: CheckPassportEligibilityInput,
  options?: { enabled?: boolean },
) => {
  const { token } = useSiweAuth()
  const jwt = token ?? undefined

  console.log('usePassportEligibility', { input, jwt })

  return useQuery<CheckPassportEligibilityResponse>({
    queryKey: [
      'checkPassportEligibility',
      input?.address,
      input?.qfRoundId,
      jwt,
    ],
    queryFn: async () => {
      console.log('queryFn', { input, jwt })
      if (!input) throw new Error('Missing input for checkPassportEligibility')
      if (!jwt) throw new Error('Missing JWT token')
      console.log('queryFn2', { input, jwt })

      const client = createGraphQLClient({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })

      return client.request<CheckPassportEligibilityResponse>(
        checkPassportEligibilityQuery,
        { input },
      )
    },
    enabled: !!input?.address && !!jwt && (options?.enabled ?? true),
  })
}
