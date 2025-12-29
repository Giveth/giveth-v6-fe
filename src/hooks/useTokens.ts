import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import type {
  TokensQuery,
  TokensByNetworkQuery,
} from '@/lib/graphql/generated/graphql'
import { tokensQuery, tokensByNetworkQuery } from '@/lib/graphql/queries'

/**
 * Hook to fetch all active tokens
 */
export const useTokens = () => {
  return useQuery<TokensQuery>({
    queryKey: ['tokens'],
    queryFn: async () => {
      console.log('📡 Fetching all tokens...')
      try {
        const data = await graphQLClient.request(tokensQuery)
        console.log('✅ Tokens loaded successfully:', data)
        return data
      } catch (error) {
        console.error('❌ Failed to load tokens:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour - tokens don't change often
  })
}

/**
 * Hook to fetch tokens for a specific network
 */
export const useTokensByNetwork = (networkId: number) => {
  return useQuery<TokensByNetworkQuery>({
    queryKey: ['tokens', 'by-network', networkId],
    queryFn: async () => {
      console.log(`📡 Fetching tokens for network ${networkId}...`)
      try {
        const data = await graphQLClient.request(tokensByNetworkQuery, {
          networkId,
        })
        console.log(
          `✅ Tokens for network ${networkId} loaded successfully:`,
          data,
        )
        return data
      } catch (error) {
        console.error(
          `❌ Failed to load tokens for network ${networkId}:`,
          error,
        )
        throw error
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: networkId > 0, // Only fetch if networkId is valid
  })
}

/**
 * Helper to format token data from GraphQL response
 */
export const formatToken = (token: TokensQuery['tokens'][0]) => ({
  id: token.id,
  symbol: token.symbol,
  name: token.name,
  address: token.address || '0x0000000000000000000000000000000000000000',
  decimals: token.decimals,
  isNative:
    !token.address ||
    token.address === '0x0000000000000000000000000000000000000000',
  networkId: token.networkId,
  chainType: token.chainType,
  coingeckoId: token.coingeckoId,
})
