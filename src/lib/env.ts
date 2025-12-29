import { z } from 'zod'

const clientEnvSchema = z.object({
  NEXT_PUBLIC_GRAPHQL_ENDPOINT: z
    .string()
    .url('NEXT_PUBLIC_GRAPHQL_ENDPOINT must be a valid URL'),
  NEXT_PUBLIC_IMPACT_GRAPHQL_ENDPOINT: z
    .string()
    .url('NEXT_PUBLIC_IMPACT_GRAPHQL_ENDPOINT must be a valid URL')
    .optional(),
  NEXT_PUBLIC_THIRDWEB_CLIENT_ID: z
    .string()
    .min(1, 'NEXT_PUBLIC_THIRDWEB_CLIENT_ID is required'),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().optional(),
})
type ClientEnv = z.infer<typeof clientEnvSchema>

const raw = {
  NEXT_PUBLIC_GRAPHQL_ENDPOINT: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
  NEXT_PUBLIC_IMPACT_GRAPHQL_ENDPOINT:
    process.env.NEXT_PUBLIC_IMPACT_GRAPHQL_ENDPOINT,
  NEXT_PUBLIC_THIRDWEB_CLIENT_ID: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
}

const parsed = clientEnvSchema.safeParse(raw)

let resolvedEnv: ClientEnv

if (parsed.success) {
  resolvedEnv = parsed.data
} else {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Invalid environment variables', parsed.error.flatten())
    throw new Error('Environment validation failed')
  }

  console.warn(
    '⚠️ Missing environment variables. Falling back to development defaults.',
  )

  resolvedEnv = clientEnvSchema.parse({
    NEXT_PUBLIC_GRAPHQL_ENDPOINT:
      raw.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:4000/graphql',
    NEXT_PUBLIC_IMPACT_GRAPHQL_ENDPOINT:
      raw.NEXT_PUBLIC_IMPACT_GRAPHQL_ENDPOINT ??
      raw.NEXT_PUBLIC_GRAPHQL_ENDPOINT ??
      'http://localhost:4000/graphql',
    NEXT_PUBLIC_THIRDWEB_CLIENT_ID:
      raw.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ?? 'demo-client-id',
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      raw.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  })
}

export const env = resolvedEnv
