import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import type {
  GlobalConfigurationQuery,
  GlobalConfigurationsQuery,
} from '@/lib/graphql/generated/graphql'
import {
  globalConfigurationQuery,
  globalConfigurationsQuery,
} from '@/lib/graphql/queries'

/**
 * Hook to fetch all global configurations
 * @param isActive - Optional filter to fetch only active configs. If undefined, returns all configs.
 */
export const useGlobalConfigurations = (isActive?: boolean) => {
  return useQuery<GlobalConfigurationsQuery>({
    queryKey: ['globalConfigurations', isActive],
    queryFn: async () => {
      try {
        const data = await graphQLClient.request(globalConfigurationsQuery, {
          isActive,
        })
        return data
      } catch (error) {
        console.error('❌ Failed to load global configurations:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - global config doesn't change often
  })
}

/**
 * Hook to fetch a specific global configuration by key
 */
export const useGlobalConfiguration = (key: string) => {
  return useQuery<GlobalConfigurationQuery>({
    queryKey: ['globalConfiguration', key],
    queryFn: async () => {
      try {
        const data = await graphQLClient.request(globalConfigurationQuery, {
          key,
        })
        return data
      } catch (error) {
        console.error(
          `❌ Failed to load global configuration for ${key}:`,
          error,
        )
        throw error
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!key, // Only fetch if key is provided
  })
}
