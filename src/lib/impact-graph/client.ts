import { GraphQLClient } from 'graphql-request'
import { env } from '@/lib/env'

const IMPACT_GRAPH_PROXY_PATH = '/api/impact-graph'

const impactGraphEndpoint =
  typeof window === 'undefined'
    ? env.IMPACT_GRAPH_URL
    : new URL(IMPACT_GRAPH_PROXY_PATH, window.location.origin).toString()

export const impactGraphClient = new GraphQLClient(impactGraphEndpoint, {
  headers: {
    'Content-Type': 'application/json',
    'apollo-require-preflight': 'true',
  },
})
