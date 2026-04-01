type FetchOpGivPowerInput = {
  subgraphUrl: string
  lmAddress: string // OP GIVPOWER LM address
  userAddress: string // wallet address
}

type FetchOpGivPowerDirectInput = FetchOpGivPowerInput & {
  apiKey?: string
}

type FetchOpGivPowerOutput = {
  id: string
  balanceWei: string
  balance: string
  rewardsWei: string
  rewardPerTokenPaid: string
}

type SubgraphResponse = {
  data?: {
    unipoolBalance?: {
      id?: string
      balance?: string
      rewards?: string
      rewardPerTokenPaid?: string
    } | null
  }
  errors?: Array<{ message?: string }>
}

type ProxyResponse = FetchOpGivPowerOutput & {
  error?: string
}

type SubgraphFetchErrorMeta = {
  status?: number
  subgraphUrl?: string
  graphErrors?: string[]
  responseSnippet?: string
  timedOut?: boolean
}

export class SubgraphFetchError extends Error {
  readonly status?: number
  readonly subgraphUrl?: string
  readonly graphErrors?: string[]
  readonly responseSnippet?: string
  readonly timedOut?: boolean

  constructor(message: string, meta: SubgraphFetchErrorMeta = {}) {
    super(message)
    this.name = 'SubgraphFetchError'
    this.status = meta.status
    this.subgraphUrl = meta.subgraphUrl
    this.graphErrors = meta.graphErrors
    this.responseSnippet = meta.responseSnippet
    this.timedOut = meta.timedOut
  }
}

const GRAPH_GATEWAY_PROXYABLE_REGEX =
  /^https:\/\/(?:gateway\.thegraph\.com|gateway-arbitrum\.network\.thegraph\.com)\/api\/(?:[^/]+\/)?subgraphs\/id\//
const GRAPH_GATEWAY_REQUIRES_AUTH_HEADER_REGEX =
  /^https:\/\/(?:gateway\.thegraph\.com|gateway-arbitrum\.network\.thegraph\.com)\/api\/subgraphs\/id\//
const OP_GIVPOWER_PROXY_ENDPOINT = '/api/subgraph/op-givpower'
const SUBGRAPH_FETCH_TIMEOUT_MS = 10_000
const RESPONSE_SNIPPET_MAX_CHARS = 500
const GRAPH_GATEWAY_WITH_EMBEDDED_KEY_PATH_REGEX =
  /^\/api\/[^/]+\/subgraphs\/id\/([A-Za-z0-9]+)$/

function getGraphErrorMessages(errors?: Array<{ message?: string }>): string[] {
  if (!Array.isArray(errors)) return []
  return errors
    .map(error => error?.message)
    .filter((message): message is string => Boolean(message))
}

function getResponseSnippet(value: string): string | undefined {
  if (!value) return undefined
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (!normalized) return undefined
  return normalized.slice(0, RESPONSE_SNIPPET_MAX_CHARS)
}

function normalizeGraphGatewaySubgraphUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl)
    const isGraphGatewayHost =
      url.hostname === 'gateway.thegraph.com' ||
      url.hostname === 'gateway-arbitrum.network.thegraph.com'

    if (!isGraphGatewayHost) return rawUrl

    const embeddedKeyMatch = url.pathname.match(
      GRAPH_GATEWAY_WITH_EMBEDDED_KEY_PATH_REGEX,
    )
    if (!embeddedKeyMatch) return rawUrl

    const subgraphId = embeddedKeyMatch[1]
    url.pathname = `/api/subgraphs/id/${subgraphId}`
    return url.toString()
  } catch {
    return rawUrl
  }
}

/**
 * Format a value to a human-readable format
 * @param value - The value to format
 * @param decimals - The number of decimals to format to
 * @returns The formatted value
 */
function formatUnits(value: string, decimals = 18): string {
  const v = BigInt(value || '0')
  const base = 10n ** BigInt(decimals)
  const whole = v / base
  const fraction = v % base
  const fractionStr = fraction
    .toString()
    .padStart(decimals, '0')
    .replace(/0+$/, '')
  return fractionStr ? `${whole}.${fractionStr}` : whole.toString()
}

/**
 * Fetch the user's GIVpower directly from the subgraph endpoint.
 * This should only be used from server-side contexts when an auth key is required.
 * @param subgraphUrl - The subgraph URL
 * @param lmAddress - The LM address
 * @param userAddress - The user's address
 * @param apiKey - Optional Graph gateway API key
 * @returns The user's GIVpower
 */
export async function fetchUserOpGivPowerFromSubgraphDirect({
  subgraphUrl,
  lmAddress,
  userAddress,
  apiKey,
}: FetchOpGivPowerDirectInput): Promise<FetchOpGivPowerOutput> {
  const normalizedSubgraphUrl = normalizeGraphGatewaySubgraphUrl(subgraphUrl)
  const isGraphGatewayRequiringHeader =
    GRAPH_GATEWAY_REQUIRES_AUTH_HEADER_REGEX.test(normalizedSubgraphUrl)

  if (isGraphGatewayRequiringHeader && !apiKey) {
    throw new SubgraphFetchError(
      'Missing NEXT_PUBLIC_SUBGRAPH_API_KEY for The Graph gateway request',
      { subgraphUrl: normalizedSubgraphUrl },
    )
  }

  const id = `${lmAddress.toLowerCase()}-${userAddress.toLowerCase()}`
  const query = `
    query GetUserPower($id: ID!) {
      unipoolBalance(id: $id) {
        id
        balance
        rewards
        rewardPerTokenPaid
      }
    }
  `
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(),
    SUBGRAPH_FETCH_TIMEOUT_MS,
  )

  let res: Response
  try {
    res = await fetch(normalizedSubgraphUrl, {
      // For gateway URLs that include a key in the path, normalize to keyless
      // endpoint and use Authorization header as the single key source.
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables: { id },
      }),
      signal: controller.signal,
    })
  } catch (error) {
    const isAbortError =
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name?: string }).name === 'AbortError'

    if (isAbortError) {
      throw new SubgraphFetchError(
        `Subgraph request timed out after ${SUBGRAPH_FETCH_TIMEOUT_MS}ms`,
        {
          subgraphUrl: normalizedSubgraphUrl,
          timedOut: true,
        },
      )
    }

    throw new SubgraphFetchError(
      error instanceof Error
        ? `Subgraph request failed: ${error.message}`
        : 'Subgraph request failed',
      { subgraphUrl: normalizedSubgraphUrl },
    )
  } finally {
    clearTimeout(timeoutId)
  }

  const responseText = await res.text()
  let json: SubgraphResponse = {}
  if (responseText) {
    try {
      json = JSON.parse(responseText) as SubgraphResponse
    } catch {
      json = {}
    }
  }

  if (!res.ok) {
    const graphErrors = getGraphErrorMessages(json?.errors)
    const graphError = graphErrors[0]
    throw new SubgraphFetchError(
      graphError
        ? `Subgraph request failed: ${res.status} - ${graphError}`
        : `Subgraph request failed: ${res.status}`,
      {
        status: res.status,
        subgraphUrl: normalizedSubgraphUrl,
        graphErrors,
        responseSnippet: getResponseSnippet(responseText),
      },
    )
  }
  if (json?.errors?.length) {
    const graphErrors = getGraphErrorMessages(json?.errors)
    throw new SubgraphFetchError(graphErrors[0] || 'Subgraph GraphQL error', {
      status: res.status,
      subgraphUrl: normalizedSubgraphUrl,
      graphErrors,
      responseSnippet: getResponseSnippet(responseText),
    })
  }

  const row = json?.data?.unipoolBalance
  const balanceWei = row?.balance ?? '0'
  return {
    id,
    balanceWei,
    balance: formatUnits(balanceWei, 18), // human-readable GIVpower
    rewardsWei: row?.rewards ?? '0',
    rewardPerTokenPaid: row?.rewardPerTokenPaid ?? '0',
  }
}

/**
 * Fetch the user's GIVpower from the subgraph.
 * In browser context, Graph gateway requests are proxied via server route
 * to avoid exposing gateway API keys in client-side code.
 * @param subgraphUrl - The subgraph URL
 * @param lmAddress - The LM address
 * @param userAddress - The user's address
 * @returns The user's GIVpower
 */
export async function fetchUserOpGivPowerFromSubgraph({
  subgraphUrl,
  lmAddress,
  userAddress,
}: FetchOpGivPowerInput): Promise<FetchOpGivPowerOutput> {
  const shouldProxyGatewayRequest =
    typeof window !== 'undefined' &&
    GRAPH_GATEWAY_PROXYABLE_REGEX.test(subgraphUrl)

  if (shouldProxyGatewayRequest) {
    const res = await fetch(OP_GIVPOWER_PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subgraphUrl,
        lmAddress,
        userAddress,
      }),
    })

    const json = (await res.json().catch(() => ({}))) as ProxyResponse

    if (!res.ok) {
      throw new Error(
        json.error || `GIVpower proxy request failed: ${res.status}`,
      )
    }

    return {
      id: json.id,
      balanceWei: json.balanceWei,
      balance: json.balance,
      rewardsWei: json.rewardsWei,
      rewardPerTokenPaid: json.rewardPerTokenPaid,
    }
  }

  return fetchUserOpGivPowerFromSubgraphDirect({
    subgraphUrl,
    lmAddress,
    userAddress,
    apiKey: process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY,
  })
}
