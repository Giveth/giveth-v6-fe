import { writeFileSync } from 'fs'
import type { CodegenConfig } from '@graphql-codegen/cli'

const schemaEndpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:4000/graphql'

// TODO: change githubSchemaUrl to respect development and production environments
const githubSchemaUrl =
  'https://raw.githubusercontent.com/Giveth/giveth-v6-core/main/src/schema.gql'

const localSchemaPath = './src/lib/graphql/schema.gql'

// Try BE endpoint first, fall back to downloading from GitHub
async function getSchemaSource(): Promise<string> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000) // 5s timeout

    const response = await fetch(schemaEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (response.ok) {
      console.warn(`✓ Using live schema from: ${schemaEndpoint}`)
      return schemaEndpoint
    }
  } catch {
    // Endpoint not available
  }

  // Fallback: download schema from GitHub and save locally
  console.warn(`⚠ BE unavailable, downloading schema from GitHub...`)
  try {
    const response = await fetch(githubSchemaUrl)
    if (response.ok) {
      const schemaContent = await response.text()
      writeFileSync(localSchemaPath, schemaContent)
      console.warn(`✓ Schema downloaded and saved to: ${localSchemaPath}`)
      return localSchemaPath
    }
  } catch (err) {
    console.error(`✗ Failed to download schema from GitHub:`, err)
  }

  // Last resort: use the local file if it exists
  return localSchemaPath
}

async function buildConfig(): Promise<CodegenConfig> {
  return {
    schema: await getSchemaSource(),
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
}

export default buildConfig()
