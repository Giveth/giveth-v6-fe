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

const GRAPH_GATEWAY_PROXYABLE_REGEX =
  /^https:\/\/(?:gateway\.thegraph\.com|gateway-arbitrum\.network\.thegraph\.com)\/api\/(?:[^/]+\/)?subgraphs\/id\//
const GRAPH_GATEWAY_REQUIRES_AUTH_HEADER_REGEX =
  /^https:\/\/gateway\.thegraph\.com\/api\/subgraphs\/id\//
const OP_GIVPOWER_PROXY_ENDPOINT = '/api/subgraph/op-givpower'
const SUBGRAPH_FETCH_TIMEOUT_MS = 10_000

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
  const isGraphGatewayRequiringHeader =
    GRAPH_GATEWAY_REQUIRES_AUTH_HEADER_REGEX.test(subgraphUrl)

  if (isGraphGatewayRequiringHeader && !apiKey) {
    throw new Error('Missing SUBGRAPH_API_KEY for The Graph gateway request')
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
    res = await fetch(subgraphUrl, {
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
      throw new Error(
        `Subgraph request timed out after ${SUBGRAPH_FETCH_TIMEOUT_MS}ms`,
      )
    }

    throw new Error(
      error instanceof Error
        ? `Subgraph request failed: ${error.message}`
        : 'Subgraph request failed',
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
    const graphError = json?.errors?.[0]?.message
    throw new Error(
      graphError
        ? `Subgraph request failed: ${res.status} - ${graphError}`
        : `Subgraph request failed: ${res.status}`,
    )
  }
  if (json?.errors?.length) {
    throw new Error(json.errors[0]?.message || 'Subgraph GraphQL error')
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
    apiKey: process.env.SUBGRAPH_API_KEY,
  })
}
