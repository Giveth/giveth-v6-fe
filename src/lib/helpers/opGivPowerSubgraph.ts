type FetchOpGivPowerInput = {
  subgraphUrl: string
  lmAddress: string // OP GIVPOWER LM address
  userAddress: string // wallet address
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
 * Fetch the user's GIVpower from the subgraph
 * @param subgraphUrl - The subgraph URL
 * @param lmAddress - The LM address
 * @param userAddress - The user's address
 * @returns The user's GIVpower
 */
export async function fetchUserOpGivPowerFromSubgraph({
  subgraphUrl,
  lmAddress,
  userAddress,
}: FetchOpGivPowerInput) {
  const isGraphGateway =
    /^https:\/\/gateway\.thegraph\.com\/api\/subgraphs\/id\//.test(subgraphUrl)
  const apiKey = process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY

  if (isGraphGateway && !apiKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUBGRAPH_API_KEY for The Graph gateway request',
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

  const res = await fetch(subgraphUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables: { id },
    }),
  })

  const json = (await res.json()) as SubgraphResponse

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
