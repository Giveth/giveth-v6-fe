import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { CodegenConfig } from '@graphql-codegen/cli'

// GraphQL Codegen executes this config in Node (not in the Next.js runtime),
// so Next's `.env*` files aren't loaded unless we do it explicitly.
function loadDotEnvFiles() {
  const cwd = process.cwd()
  const nodeEnv = process.env.NODE_ENV || 'development'

  const candidates = [
    `.env.${nodeEnv}.local`,
    ...(nodeEnv === 'test' ? [] : ['.env.local']),
    `.env.${nodeEnv}`,
    '.env',
  ]

  for (const file of candidates) {
    const fullPath = path.join(cwd, file)
    if (!existsSync(fullPath)) continue
    const raw = readFileSync(fullPath, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!m) continue
      const key = m[1]
      let value = m[2] ?? ''

      const isDoubleQuoted = value.startsWith('"') && value.endsWith('"')
      const isSingleQuoted = value.startsWith("'") && value.endsWith("'")

      if (isDoubleQuoted || isSingleQuoted) {
        value = value.slice(1, -1)
      } else {
        // Strip inline comments for unquoted values: FOO=bar # comment
        value = value.replace(/\s+#.*$/, '')
      }

      if (isDoubleQuoted) {
        value = value
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
      }

      // Do not override real environment variables (shell/CI wins).
      if (process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  }
}

loadDotEnvFiles()

const config: CodegenConfig = {
  schema:
    process.env.NEXT_PUBLIC_SCHEMA_URL ||
    process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
    '../giveth-v6-core/src/schema.gql',
  documents: ['src/**/*.{ts,tsx}'],
  ignoreNoDocuments: true,
  generates: {
    './src/lib/graphql/generated/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: { unmaskFunctionName: 'getFragmentData' },
      },
      config: {
        documentMode: 'string',
      },
    },
  },
}

export default config
