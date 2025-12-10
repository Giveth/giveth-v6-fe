import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import { qfRoundBySlugQuery } from '@/lib/graphql/queries'

export const useQfRoundBySlug = (slug?: string) => {
  return useQuery({
    queryKey: ['qfRoundBySlug', slug],
    queryFn: async () => {
      if (!slug) return null
      return graphQLClient.request(qfRoundBySlugQuery, { slug })
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  })
}
