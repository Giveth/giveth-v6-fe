type IGiversPFPToken = {
  id: string
  tokenId: string
  imageIpfs: string
  user: string
}

type NormalizeIpfsHash = (value: string | null | undefined) => string | null

const GIVERS_PFP_SUBGRAPH_ID = '9QK3vLoWF69TXSenUzQkkLhessaViu4naE58gRyKCxU7'
const GIVERS_PFP_GATEWAY_HOST = 'https://giveth.mypinata.cloud/ipfs/'
const ADDRESS_CACHE_WAIT_TIMEOUT_MS = 5_000
const ADDRESS_CACHE_WAIT_POLL_MS = 10

const tokensByAddressCache = new Map<string, IGiversPFPToken[]>()
const tokensByAddressInFlight = new Map<string, Promise<IGiversPFPToken[]>>()
const avatarUrlByAddressAndHashCache = new Map<string, string | null>()
const avatarUrlByAddressAndHashInFlight = new Map<
  string,
  Promise<string | null>
>()

const queuedAddresses = new Set<string>()
let flushTimer: ReturnType<typeof setTimeout> | null = null

const getMainnetSubgraphUrl = () => {
  const graphApiKey = process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY
  return graphApiKey
    ? `https://gateway-arbitrum.network.thegraph.com/api/${graphApiKey}/subgraphs/id/${GIVERS_PFP_SUBGRAPH_ID}`
    : `https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/${GIVERS_PFP_SUBGRAPH_ID}`
}

const getBatchQueryBody = (users: string[]) => ({
  query: `
    query GetGiversPFPTokensBatch($users: [String!]!) {
      giversPFPTokens(where: { user_in: $users }) {
        id
        tokenId
        imageIpfs
        user
      }
    }
  `,
  variables: { users },
})

const getSingleQueryBody = (user: string) => ({
  query: `
    query GetGiversPFPTokens($user: String!) {
      giversPFPTokens(where: { user: $user }) {
        id
        tokenId
        imageIpfs
        user
      }
    }
  `,
  variables: { user },
})

const requestTokens = async (
  body: Record<string, unknown>,
): Promise<IGiversPFPToken[]> => {
  const response = await fetch(getMainnetSubgraphUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Subgraph request failed: ${response.status}`)
  }

  const json = (await response.json().catch(() => ({}))) as {
    data?: { giversPFPTokens?: IGiversPFPToken[] }
  }
  return json?.data?.giversPFPTokens ?? []
}

const fetchTokensBatch = async (users: string[]): Promise<IGiversPFPToken[]> =>
  requestTokens(getBatchQueryBody(users))

const fetchTokensSingle = async (user: string): Promise<IGiversPFPToken[]> =>
  requestTokens(getSingleQueryBody(user))

const groupTokensByUser = (
  users: string[],
  tokens: IGiversPFPToken[],
): Record<string, IGiversPFPToken[]> => {
  const grouped = Object.fromEntries(users.map(user => [user, []])) as Record<
    string,
    IGiversPFPToken[]
  >
  for (const token of tokens) {
    const normalizedUser = token.user?.toLowerCase()
    if (!normalizedUser || !grouped[normalizedUser]) continue
    grouped[normalizedUser].push(token)
  }
  return grouped
}

const flushQueuedAddresses = async () => {
  flushTimer = null
  const users = Array.from(queuedAddresses)
  queuedAddresses.clear()
  if (!users.length) return

  let grouped: Record<string, IGiversPFPToken[]>

  try {
    const batchTokens = await fetchTokensBatch(users)
    grouped = groupTokensByUser(users, batchTokens)
  } catch {
    grouped = Object.fromEntries(users.map(user => [user, []])) as Record<
      string,
      IGiversPFPToken[]
    >

    await Promise.all(
      users.map(async user => {
        try {
          grouped[user] = await fetchTokensSingle(user)
        } catch {
          grouped[user] = []
        }
      }),
    )
  }

  for (const user of users) {
    const tokens = grouped[user] ?? []
    tokensByAddressCache.set(user, tokens)
  }
}

const ensureAddressTokens = async (
  address: string,
): Promise<IGiversPFPToken[]> => {
  if (tokensByAddressCache.has(address)) {
    return tokensByAddressCache.get(address) ?? []
  }

  const existingPromise = tokensByAddressInFlight.get(address)
  if (existingPromise) return existingPromise

  const pendingPromise = (async () => {
    queuedAddresses.add(address)
    if (!flushTimer) {
      flushTimer = setTimeout(() => {
        void flushQueuedAddresses().catch(() => {
          // Consumers will fail via bounded wait timeout if cache never materializes.
        })
      }, 0)
    }

    const waitStart = Date.now()
    while (!tokensByAddressCache.has(address)) {
      if (Date.now() - waitStart > ADDRESS_CACHE_WAIT_TIMEOUT_MS) {
        throw new Error(
          `Timed out waiting for avatar tokens cache for address ${address}`,
        )
      }
      await new Promise(resolve =>
        setTimeout(resolve, ADDRESS_CACHE_WAIT_POLL_MS),
      )
    }

    return tokensByAddressCache.get(address) ?? []
  })()

  tokensByAddressInFlight.set(address, pendingPromise)

  try {
    return await pendingPromise
  } finally {
    tokensByAddressInFlight.delete(address)
  }
}

const buildGatewayUrlFromIpfsHash = (ipfsHash: string) =>
  `${GIVERS_PFP_GATEWAY_HOST}${ipfsHash}`

export const resolveGiversAvatarGatewayUrl = async ({
  normalizedAddress,
  avatarHash,
  normalizeIpfsHash,
}: {
  normalizedAddress: string
  avatarHash: string
  normalizeIpfsHash: NormalizeIpfsHash
}): Promise<string | null> => {
  const cacheKey = `${normalizedAddress}:${avatarHash}`
  if (avatarUrlByAddressAndHashCache.has(cacheKey)) {
    return avatarUrlByAddressAndHashCache.get(cacheKey) ?? null
  }

  const existingPromise = avatarUrlByAddressAndHashInFlight.get(cacheKey)
  if (existingPromise) return existingPromise

  const pendingPromise = (async () => {
    const tokens = await ensureAddressTokens(normalizedAddress)
    if (!tokens.length) return null

    const matchedToken = tokens.find(token => {
      const tokenHash = normalizeIpfsHash(token.imageIpfs)
      return tokenHash === avatarHash
    })
    if (!matchedToken) return null

    const matchedHash = normalizeIpfsHash(matchedToken.imageIpfs)
    if (!matchedHash) return null

    return buildGatewayUrlFromIpfsHash(matchedHash)
  })()

  avatarUrlByAddressAndHashInFlight.set(cacheKey, pendingPromise)

  try {
    const result = await pendingPromise
    avatarUrlByAddressAndHashCache.set(cacheKey, result)
    return result
  } finally {
    avatarUrlByAddressAndHashInFlight.delete(cacheKey)
  }
}
