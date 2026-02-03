import { z } from 'zod'

const clientEnvSchema = z.object({
  // Build mode set by Next.js/Node
  NODE_ENV: z.string().optional(),
  GRAPHQL_ENDPOINT: z.string(),
  IMPACT_GRAPH_URL: z.string(),
  // Set by Vercel for client-side usage if explicitly exposed (often via build-time env injection)
  // Values: 'production' | 'preview' | 'development' | 'local'
  VERCEL_ENV: z
    .enum(['production', 'preview', 'development', 'local'])
    .optional(),
  THIRDWEB_CLIENT_ID: z
    .string()
    .min(1, 'NEXT_PUBLIC_THIRDWEB_CLIENT_ID is required'),
  WALLETCONNECT_PROJECT_ID: z.string(),
  SIWE_AUTH_SERVICE_URL: z.string(),
  OLD_FRONTEND_URL: z.string(),
  FRONTEND_URL: z.string(),
})
type ClientEnv = z.infer<typeof clientEnvSchema>

const raw = {
  NODE_ENV: process.env.NODE_ENV,
  GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  // Prefer NEXT_PUBLIC_* (available in the browser), but allow server-only fallback.
  IMPACT_GRAPH_URL: process.env.NEXT_PUBLIC_IMPACT_GRAPH_URL,
  VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  SIWE_AUTH_SERVICE_URL: process.env.NEXT_PUBLIC_SIWE_AUTH_SERVICE_URL,
  OLD_FRONTEND_URL: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL,
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
}

export const isProd = raw.VERCEL_ENV === 'production'

const defaults: Partial<ClientEnv> = {
  GRAPHQL_ENDPOINT: isProd
    ? 'https://core.v6.giveth.io/graphql'
    : 'https://core.v6-staging.giveth.io/graphql',
  THIRDWEB_CLIENT_ID: 'demo-client-id',
  WALLETCONNECT_PROJECT_ID: 'demo-project-id',
  IMPACT_GRAPH_URL: isProd
    ? 'https://mainnet.serve.giveth.io/graphql'
    : 'https://impact-graph.serve.giveth.io/graphql',
  SIWE_AUTH_SERVICE_URL: 'https://auth.giveth.io',
  OLD_FRONTEND_URL: isProd ? 'https://giveth.io' : 'https://staging.giveth.io',
  FRONTEND_URL: isProd
    ? 'https://qf.giveth.io'
    : 'https://v6-staging.giveth.io',
}

// Filter out undefined values so they don't overwrite defaults
const definedRaw = Object.fromEntries(
  Object.entries(raw).filter(([, v]) => v !== undefined),
)

const resolvedEnv: ClientEnv = clientEnvSchema.parse({
  ...defaults,
  ...definedRaw,
})

export const env = resolvedEnv
