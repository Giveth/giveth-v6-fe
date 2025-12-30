import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const feRoot = path.resolve(__dirname, '..')
const schemaOutPath = path.join(feRoot, 'src', 'lib', 'graphql', 'schema.gql')

const defaultSchemaUrl =
  'https://raw.githubusercontent.com/Giveth/giveth-v6-core/staging/src/schema.gql'

const schemaUrl = process.env.GIVETH_V6_CORE_SCHEMA_URL || defaultSchemaUrl

const localFallbackSchemaPath = path.resolve(
  feRoot,
  '..',
  'giveth-v6-core',
  'src',
  'schema.gql',
)

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function getSchemaFromGithub() {
  const res = await fetchWithTimeout(schemaUrl, 15_000)
  if (!res.ok) {
    throw new Error(`GitHub fetch failed (${res.status} ${res.statusText})`)
  }
  const text = await res.text()
  if (!text.trim().startsWith('#') && !text.includes('type Query')) {
    throw new Error('GitHub fetch did not return a valid schema.gql')
  }
  return text
}

async function getSchemaFromLocalFallback() {
  return await readFile(localFallbackSchemaPath, 'utf8')
}

async function main() {
  let schemaText
  try {
    schemaText = await getSchemaFromGithub()
     
    console.log(`Updated schema from GitHub: ${schemaUrl}`)
  } catch (e) {
     
    console.warn(
      `Could not update schema from GitHub (${schemaUrl}); falling back to local copy at ${localFallbackSchemaPath}`,
    )
    schemaText = await getSchemaFromLocalFallback()
     
    console.log('Updated schema from local giveth-v6-core')
  }

  await writeFile(schemaOutPath, schemaText, 'utf8')
   
  console.log(`Wrote: ${schemaOutPath}`)
}

main().catch(err => {
   
  console.error(err)
  process.exitCode = 1
})
