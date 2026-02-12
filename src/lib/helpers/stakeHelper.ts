import { type Address } from 'viem'
import { STAKING_POOLS } from '@/lib/constants/staking-power-constants'
import { TokenDistroHelper } from '@/lib/helpers/tokenDistroHelper'

/* ============================================================================
  Types
============================================================================ */

type SubgraphResponse<T> = {
  data?: T
  errors?: { message?: string }[]
}

type StakingData = {
  unipool?: {
    totalSupply: string
    rewardRate: string
    periodFinish: string
    rewardPerTokenStored?: string
  }
  unipoolBalance?: {
    balance?: string
    rewards?: string
    rewardPerTokenPaid?: string
  }
}

type TokenBalanceData = {
  tokenBalance?: {
    balance?: string
  }
}

type TokenDistroData = {
  tokenDistro?: {
    initialAmount: string
    lockedAmount: string
    totalTokens: string
    startTime: string
    duration: string
    cliffTime: string
  }
  tokenDistroBalance?: {
    allocatedTokens: string
    claimed: string
    givback?: string
    givbackLiquidPart?: string
  }
  tokenLocks?: Array<{
    amount: string
    unlockableAt?: string
  }>
}

/* ============================================================================
  Core Query
============================================================================ */

/**
 * Query the subgraph for a user
 *
 * @param chainId - The chain ID
 * @param query - The query to run
 * @returns The subgraph data
 */
async function querySubgraph<T>(chainId: number, query: string): Promise<T> {
  const config = STAKING_POOLS[chainId]

  if (!config?.subgraphUrl) {
    throw new Error(`Missing subgraph for chain ${chainId}`)
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY
      ? {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY}`,
        }
      : {}),
  }

  const res = await fetch(config.subgraphUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
  })

  const json = (await res.json()) as SubgraphResponse<T>

  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message)
  }

  return json.data as T
}

/* ============================================================================
  Query Builders
============================================================================ */

/**
 * Query the staking data for a user
 *
 * @param user - The user's address
 * @param lm - The LM address
 * @returns The staking query
 */
function stakingQuery(user: Address, lm: Address) {
  return `{
    unipool(id: "${lm.toLowerCase()}") {
      totalSupply
      rewardRate
      periodFinish
      rewardPerTokenStored
    }

    unipoolBalance(id: "${lm.toLowerCase()}-${user.toLowerCase()}") {
      balance
      rewards
      rewardPerTokenPaid
    }
  }`
}

/**
 * Query the token balance for a user
 *
 * @param user - The user's address
 * @param token - The token address
 * @returns The token balance query
 */
function tokenBalanceQuery(user: Address, token: Address) {
  return `{
    tokenBalance(id: "${token.toLowerCase()}-${user.toLowerCase()}") {
      balance
    }
  }`
}

function tokenDistroQuery(user: Address, distro: Address) {
  return `{
    tokenDistro(id: "${distro.toLowerCase()}") {
      initialAmount
      lockedAmount
      totalTokens
      startTime
      duration
      cliffTime
    }

    tokenDistroBalance(id: "${distro.toLowerCase()}-${user.toLowerCase()}") {
      allocatedTokens
      claimed
      givback
      givbackLiquidPart
    }
  }`
}

/**
 * Query the token locks for a user
 *
 * @param user - The user's address
 * @param first - The number of locks to return (default: 100)
 * @param skip - The number of locks to skip (default: 0)
 * @returns The token locks query
 */
function tokenLocksQuery(user: Address, first = 100, skip = 0) {
  return `{
    tokenLocks(where:{user: "${user.toLowerCase()}", unlocked: false}, first: ${first}, skip: ${skip}, orderBy: unlockableAt){
      amount
      unlockableAt
    }
  }`
}

/**
 * Fetch the staking data for a user
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @returns The staking data
 */
export async function fetchStaking(user: Address, chainId: number) {
  const cfg = STAKING_POOLS[chainId]

  const data = await querySubgraph<StakingData>(
    chainId,
    stakingQuery(user, cfg.GIVPOWER.LM_ADDRESS as Address),
  )

  if (!data.unipool) throw new Error('Pool not found')

  const staked = BigInt(data.unipoolBalance?.balance || '0')
  const baseRewards = BigInt(data.unipoolBalance?.rewards || '0')
  const rewardPerTokenStored = BigInt(data.unipool?.rewardPerTokenStored || '0')
  const rewardPerTokenPaid = BigInt(
    data.unipoolBalance?.rewardPerTokenPaid || '0',
  )
  const rewardPerTokenDelta =
    rewardPerTokenStored > rewardPerTokenPaid
      ? rewardPerTokenStored - rewardPerTokenPaid
      : 0n
  const accruedRewards =
    rewardPerTokenDelta > 0n
      ? (staked * rewardPerTokenDelta) / 1_000_000_000_000_000_000n
      : 0n
  const earned = baseRewards + accruedRewards
  const claimable = earned

  return {
    staked,
    earned,
    claimable,
    streaming: 0n,
    apr: 0,
  }
}

/* ============================================================================
  Wallet Balance
============================================================================ */

/**
 * Fetch the wallet balance for a user
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @returns The wallet balance
 */
export async function fetchWalletBalance(user: Address, chainId: number) {
  const cfg = STAKING_POOLS[chainId]

  const data = await querySubgraph<TokenBalanceData>(
    chainId,
    tokenBalanceQuery(user, cfg.GIV_TOKEN_ADDRESS as `0x${string}`),
  )

  return BigInt(data.tokenBalance?.balance || '0')
}

/* ============================================================================
  GIVbacks (TokenDistro)
============================================================================ */

/**
 * Fetch the GIVbacks for a user
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @returns The GIVbacks
 */
export async function fetchGIVbacks(user: Address, chainId: number) {
  const cfg = STAKING_POOLS[chainId]

  if (!cfg.TOKEN_DISTRO_ADDRESS) {
    return {
      claimable: 0n,
      streaming: 0n,
      allocated: 0n,
      claimed: 0n,
    }
  }

  const [distroData, locksData] = await Promise.all([
    querySubgraph<TokenDistroData>(
      chainId,
      tokenDistroQuery(user, cfg.TOKEN_DISTRO_ADDRESS as `0x${string}`),
    ),
    querySubgraph<TokenDistroData>(chainId, tokenLocksQuery(user)),
  ])

  if (!distroData.tokenDistro || !distroData.tokenDistroBalance) {
    return {
      claimable: 0n,
      streaming: 0n,
      allocated: 0n,
      claimed: 0n,
      claimableFromLocks: 0n,
      streamingFromLocks: 0n,
      totalLocked: 0n,
    }
  }

  const distro = distroData.tokenDistro
  const balance = distroData.tokenDistroBalance

  const helper = new TokenDistroHelper({
    contractAddress: cfg.TOKEN_DISTRO_ADDRESS as `0x${string}`,
    initialAmount: distro.initialAmount,
    lockedAmount: distro.lockedAmount,
    totalTokens: distro.totalTokens,
    startTime: Number(distro.startTime) * 1000,
    cliffTime: Number(distro.cliffTime) * 1000,
    endTime: (Number(distro.startTime) + Number(distro.duration)) * 1000,
  })

  const nowSeconds = Math.floor(Date.now() / 1000)
  const claimableLocked = (locksData.tokenLocks ?? []).reduce((acc, lock) => {
    const unlockableAt = Number(lock.unlockableAt || 0)
    if (unlockableAt > 0 && unlockableAt <= nowSeconds) {
      return acc + BigInt(lock.amount || '0')
    }
    return acc
  }, 0n)
  const totalLocked = (locksData.tokenLocks ?? []).reduce(
    (acc, lock) => acc + BigInt(lock.amount || '0'),
    0n,
  )
  const claimableFromLocks = claimableLocked
  const streamingFromLocks =
    claimableLocked > 0n ? helper.getStreamPartTokenPerWeek(totalLocked) : 0n

  console.warn('[GIVbacks] tokenLocks totals', {
    totalLocked: totalLocked.toString(),
    claimableLocked: claimableLocked.toString(),
    claimableFromLocks: claimableFromLocks.toString(),
  })

  const claimable = BigInt(balance.givbackLiquidPart || '0')

  return {
    claimable,
    streaming: helper.getStreamPartTokenPerWeek(
      BigInt(balance.allocatedTokens),
    ),
    allocated: BigInt(balance.allocatedTokens),
    claimed: BigInt(balance.claimed),
    claimableFromLocks,
    streamingFromLocks,
    totalLocked,
  }
}

/* ============================================================================
  User Overview (Main API)
============================================================================ */

/**
 * Fetch the user overview for a user
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @returns The user overview
 */
export async function fetchUserOverview(user: Address, chainId: number) {
  const [walletResult, stakingResult, givbacksResult] =
    await Promise.allSettled([
      fetchWalletBalance(user, chainId),
      fetchStaking(user, chainId),
      fetchGIVbacks(user, chainId),
    ])

  const wallet = walletResult.status === 'fulfilled' ? walletResult.value : 0n
  const staking =
    stakingResult.status === 'fulfilled'
      ? stakingResult.value
      : {
          staked: 0n,
          earned: 0n,
          claimable: 0n,
          streaming: 0n,
          apr: 0,
        }
  const givbacks =
    givbacksResult.status === 'fulfilled'
      ? givbacksResult.value
      : {
          claimable: 0n,
          streaming: 0n,
          allocated: 0n,
          claimed: 0n,
          claimableFromLocks: 0n,
          streamingFromLocks: 0n,
          totalLocked: 0n,
        }

  return {
    balances: {
      wallet,
      staked: staking.staked,
      total: wallet + staking.staked,
    },

    staking,

    givbacks,
  }
}
