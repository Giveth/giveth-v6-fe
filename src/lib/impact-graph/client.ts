import { GraphQLClient } from 'graphql-request'
import { env } from '@/lib/env'

export const impactGraphClient = new GraphQLClient(env.IMPACT_GRAPH_URL, {
  headers: {
    'Content-Type': 'application/json',
    'apollo-require-preflight': 'true',
  },
})
