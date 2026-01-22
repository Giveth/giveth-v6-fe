'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useSiweAuth } from '@/context/AuthContext'
import { createGraphQLClient } from '@/lib/graphql/client'
import type {
  CheckEligibilityResultEntity,
  CheckPassportEligibilityInput,
} from '@/lib/graphql/generated/graphql'
import {
  checkPassportEligibilityQuery,
  refreshPassportEligibilityQuery,
} from '@/lib/graphql/queries'

type CheckPassportEligibilityResponse = {
  checkPassportEligibility: CheckEligibilityResultEntity
}

type RefreshPassportEligibilityResponse = {
  refreshPassportScore: CheckEligibilityResultEntity
}

export const usePassportEligibility = (
  input?: CheckPassportEligibilityInput,
  options?: { enabled?: boolean },
) => {
  const { token } = useSiweAuth()
  const jwt = token ?? undefined

  return useQuery<CheckPassportEligibilityResponse>({
    queryKey: [
      'checkPassportEligibility',
      input?.address,
      input?.qfRoundId,
      jwt,
    ],
    queryFn: async () => {
      if (!input) throw new Error('Missing input for checkPassportEligibility')
      if (!jwt) throw new Error('Missing JWT token')

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

export const useRefreshPassportEligibility = () => {
  const { token } = useSiweAuth()
  const jwt = token ?? undefined

  return useMutation<RefreshPassportEligibilityResponse, Error, string>({
    mutationFn: async address => {
      if (!address) {
        throw new Error('Missing input for refreshPassportEligibility')
      }
      if (!jwt) throw new Error('Missing JWT token')

      const client = createGraphQLClient({
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })

      return client.request<RefreshPassportEligibilityResponse>(
        refreshPassportEligibilityQuery,
        { address },
      )
    },
  })
}
