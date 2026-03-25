import { NextResponse } from 'next/server'
import { fetchUserOpGivPowerFromSubgraphDirect } from '@/lib/helpers/opGivPowerSubgraph'

export const runtime = 'nodejs'

const ALLOWED_SUBGRAPH_HOSTS = new Set([
  'gateway.thegraph.com',
  'gateway-arbitrum.network.thegraph.com',
])

const ALLOWED_SUBGRAPH_PATH_REGEX =
  /^\/api\/(?:[^/]+\/)?subgraphs\/id\/[A-Za-z0-9]+$/

const EVM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

type RequestBody = {
  subgraphUrl?: unknown
  lmAddress?: unknown
  userAddress?: unknown
}

const getApiKey = () =>
  process.env.SUBGRAPH_API_KEY || process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY

const isAllowedSubgraphUrl = (value: string) => {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      ALLOWED_SUBGRAPH_HOSTS.has(url.hostname) &&
      ALLOWED_SUBGRAPH_PATH_REGEX.test(url.pathname)
    )
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as RequestBody | null
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const subgraphUrl =
    typeof body.subgraphUrl === 'string' ? body.subgraphUrl : undefined
  const lmAddress =
    typeof body.lmAddress === 'string' ? body.lmAddress : undefined
  const userAddress =
    typeof body.userAddress === 'string' ? body.userAddress : undefined

  if (!subgraphUrl || !lmAddress || !userAddress) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    )
  }

  if (!isAllowedSubgraphUrl(subgraphUrl)) {
    return NextResponse.json(
      { error: 'Unsupported subgraph URL' },
      { status: 400 },
    )
  }

  if (
    !EVM_ADDRESS_REGEX.test(lmAddress) ||
    !EVM_ADDRESS_REGEX.test(userAddress)
  ) {
    return NextResponse.json(
      { error: 'Invalid address format' },
      { status: 400 },
    )
  }

  try {
    const response = await fetchUserOpGivPowerFromSubgraphDirect({
      subgraphUrl,
      lmAddress,
      userAddress,
      apiKey: getApiKey(),
    })
    return NextResponse.json(response)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch GIVpower'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
