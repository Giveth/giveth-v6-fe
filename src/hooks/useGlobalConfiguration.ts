'use client'

import { useQuery } from '@tanstack/react-query'
import { createGraphQLClient } from '@/lib/graphql/client'
import { globalConfigurationQuery } from '@/lib/graphql/queries'

export function useGlobalConfiguration(key: string | undefined) {
  return useQuery({
    queryKey: ['globalConfiguration', key],
    enabled: !!key,
    queryFn: async () => {
      if (!key) throw new Error('Global configuration key is required')
      const client = createGraphQLClient()
      const response = await client.request(globalConfigurationQuery, { key })
      return response.globalConfiguration
    },
  })
}
