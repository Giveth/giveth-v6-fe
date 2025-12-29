import { env } from './src/lib/env'
import type { CodegenConfig } from '@graphql-codegen/cli'

const schemaEndpoint = env.GRAPHQL_ENDPOINT

const config: CodegenConfig = {
  schema: schemaEndpoint,
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
