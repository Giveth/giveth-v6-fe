import { NextResponse } from 'next/server'

const PRODUCTION_IMPACT_GRAPH_URL = 'https://mainnet.serve.giveth.io/graphql'
const NON_PRODUCTION_IMPACT_GRAPH_URL =
  'https://impact-graph.serve.giveth.io/graphql'

export const runtime = 'nodejs'

function resolveImpactGraphUrl(): string {
  const explicitUrl =
    process.env.IMPACT_GRAPH_URL?.trim() ||
    process.env.NEXT_PUBLIC_IMPACT_GRAPH_URL?.trim()
  if (explicitUrl) return explicitUrl

  const environment = process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development'
  return environment === 'production'
    ? PRODUCTION_IMPACT_GRAPH_URL
    : NON_PRODUCTION_IMPACT_GRAPH_URL
}

export async function POST(req: Request) {
  const body = await req.text().catch(() => '')
  if (!body.trim()) {
    return NextResponse.json(
      { error: 'Invalid GraphQL request body' },
      { status: 400 },
    )
  }

  try {
    const upstreamResponse = await fetch(resolveImpactGraphUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/graphql-response+json, application/json',
        'Content-Type': 'application/json',
        'apollo-require-preflight': 'true',
      },
      body,
      cache: 'no-store',
    })

    const responseText = await upstreamResponse.text()
    const contentType =
      upstreamResponse.headers.get('content-type') ??
      'application/json; charset=utf-8'

    return new NextResponse(responseText, {
      status: upstreamResponse.status,
      headers: {
        'cache-control': 'no-store',
        'content-type': contentType,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to reach Impact Graph endpoint' },
      { status: 502 },
    )
  }
}
