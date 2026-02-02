import { z } from 'zod'

// Server-only env (safe to import in route handlers / server components only).
// Do NOT import this from client components.
const serverEnvSchema = z.object({
  // Optional so dev can run without AI configured.
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).optional(),
  OPENAI_BASE_URL: z
    .string()
    .min(1)
    .refine(isHttpUrl, 'OPENAI_BASE_URL must be a valid http(s) URL')
    .optional(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

const raw = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
}

const defaults: Partial<ServerEnv> = {
  OPENAI_MODEL: 'gpt-5-mini',
  OPENAI_BASE_URL: 'https://api.openai.com',
}

// Do not allow undefined to overwrite defaults.
const definedRaw = Object.fromEntries(
  Object.entries(raw).filter(([, v]) => v !== undefined),
)

export const serverEnv: ServerEnv = serverEnvSchema.parse({
  ...defaults,
  ...definedRaw,
})

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
