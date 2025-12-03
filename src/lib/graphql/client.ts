import { GraphQLClient } from 'graphql-request'
import { env } from '@/lib/env'

export const createGraphQLClient = (options?: {
  headers?: Record<string, string>
}) => {
  return new GraphQLClient(env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, {
    headers: {
      'Content-Type': 'application/json',
      'apollo-require-preflight': 'true',
      ...options?.headers,
    },
  })
}

export const graphQLClient = createGraphQLClient()
