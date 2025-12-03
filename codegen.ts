import type { CodegenConfig } from '@graphql-codegen/cli'

const schemaEndpoint =
  process.env.GRAPHQL_CODEGEN_ENDPOINT ??
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ??
  'http://localhost:4000/graphql'

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
