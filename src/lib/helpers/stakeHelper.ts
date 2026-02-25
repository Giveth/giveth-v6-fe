import {
  defineChain,
  getContract,
  prepareContractCall,
  readContract,
  sendTransaction,
  waitForReceipt,
} from 'thirdweb'
import { type Account } from 'thirdweb/wallets'
import { type Address, formatUnits, parseUnits } from 'viem'
import {
  ERC20_ABI,
  GIVPOWER_ABI,
  LM_ABI,
  TOKEN_MANAGER_ABI,
  UNIPOOL_ABI_WITHDRAW,
} from '@/lib/abis/staking'
import { STAKING_POOLS } from '@/lib/constants/staking-power-constants'
import { TokenDistroHelper } from '@/lib/helpers/tokenDistroHelper'
import { thirdwebClient } from '@/lib/thirdweb/client'
import {
  type GIVpowerInfoData,
  type GIVpowerUserData,
  type StakingData,
  type SubgraphResponse,
  type TokenAllocationEvent,
  type TokenBalanceData,
  type TokenAllocationData,
  type TokenDistroData,
} from '@/lib/types/staking'
import { type ITokenDistroBalance } from '@/lib/types/subgraph'

/* Core Query Functions */

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

/* Query Builders */

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
      lastUpdateTime
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

function tokenAllocationsQuery(
  user: Address,
  distro: Address,
  skip = 0,
  first = 10,
) {
  return `{
    tokenDistro(id: "${distro.toLowerCase()}") {
      initialAmount
      lockedAmount
      totalTokens
      startTime
      duration
      cliffTime
    }

    tokenAllocations(
      skip: ${skip}
      first: ${first}
      orderBy: timestamp
      orderDirection: desc
      where: {
        recipient: "${user.toLowerCase()}"
        tokenDistroAddress: "${distro.toLowerCase()}"
      }
    ) {
      recipient
      amount
      timestamp
      txHash
      distributor
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
      id
      user
      amount
      rounds
      untilRound
      unlockableAt
      unlockedAt
      unlocked
    }
  }`
}

/**
 * Query the GIVpower info for a GIVpower
 *
 * @param lmAddress - The GIVpower LM address
 * @returns The GIVpower info query
 */
function givpowerInfoQuery(lmAddress: Address) {
  return `{
    givpower(id: "${lmAddress.toLowerCase()}") {
      initialDate
      roundDuration
    }
  }`
}

/**
 * Type for a token lock
 *
 * @param id - The lock ID
 * @param amount - The amount of the lock
 * @param rounds - The number of rounds to lock for
 * @param untilRound - The round number to unlock at
 * @param unlockableAt - The timestamp to unlock at
 * @returns The token lock
 */
export type TokenLock = {
  id?: string
  amount: bigint
  rounds: number
  untilRound?: number
  unlockableAt?: number
}

/**
 * Fetch the token locks for a user
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @param first - The number of locks to return (default: 100)
 * @param skip - The number of locks to skip (default: 0)
 * @returns The token locks
 */
export async function fetchTokenLocks(
  user: Address,
  chainId: number,
  first = 100,
  skip = 0,
): Promise<TokenLock[]> {
  const data = await querySubgraph<TokenDistroData>(
    chainId,
    tokenLocksQuery(user, first, skip),
  )

  return (data.tokenLocks ?? []).map(lock => ({
    id: lock.id,
    amount: BigInt(lock.amount || '0'),
    rounds: lock.rounds ? Number(lock.rounds) : 0,
    untilRound: lock.untilRound ? Number(lock.untilRound) : undefined,
    unlockableAt: lock.unlockableAt ? Number(lock.unlockableAt) : undefined,
  }))
}

export const LOCK_CONSTANTS = {
  MIN_ROUNDS: 1,
  MAX_ROUNDS: 26,
}

/**
 * Calculate the multiplier for a GIVpower
 *
 * @param rounds - The number of rounds to calculate for
 * @returns The multiplier
 */
export function calculateMultiplier(rounds: number): number {
  return Math.sqrt(1 + rounds)
}

/**
 * Calculate the boosted APR for a GIVpower
 *
 * @param baseAPR - The base APR
 * @param rounds - The number of rounds to calculate for
 * @returns The boosted APR
 */
export function calculateBoostedAPR(baseAPR: number, rounds: number): number {
  return baseAPR * calculateMultiplier(rounds)
}

/**
 * Calculate the GIVpower for a user
 *
 * @param amount - The amount of GIVpower to calculate
 * @param rounds - The number of rounds to calculate for
 * @returns The GIVpower
 */
export function calculateGIVpower(amount: bigint, rounds: number): bigint {
  const multiplier = calculateMultiplier(rounds)
  const multiplierFixed = BigInt(Math.floor(multiplier * 1e18))
  return (amount * multiplierFixed) / 1_000_000_000_000_000_000n
}

/**
 * Get the current round info for a GIVpower
 *
 * @param chainId - The chain ID
 * @returns The current round info
 */
export async function getCurrentRoundInfo(chainId: number): Promise<{
  currentRound: number
  nextRoundDate: Date
  roundDuration: number
}> {
  const cfg = STAKING_POOLS[chainId]
  if (!cfg?.GIVPOWER?.LM_ADDRESS) {
    throw new Error(`GIVpower not configured for chain ${chainId}`)
  }

  // Get the GIVpower info from the subgraph, this is used to get the current round info
  const data = await querySubgraph<GIVpowerInfoData>(
    chainId,
    givpowerInfoQuery(cfg.GIVPOWER.LM_ADDRESS as Address),
  )

  // Get the initial date and round duration from the GIVpower info
  const initialDate = Number(data.givpower?.initialDate || 0)
  const roundDuration = Number(data.givpower?.roundDuration || 0)

  // If the initial date or round duration is not available, throw an error
  if (!initialDate || !roundDuration) {
    throw new Error('GIVpower round info not available')
  }

  // Calculate the current round and the next round date
  const now = Math.floor(Date.now() / 1000)
  const currentRound = Math.floor((now - initialDate) / roundDuration)
  const nextRoundTimestamp = initialDate + roundDuration * (currentRound + 1)

  return {
    currentRound,
    nextRoundDate: new Date(nextRoundTimestamp * 1000),
    roundDuration,
  }
}

/**
 * Calculate the unlock date for a GIVpower lock
 *
 * @param nextRoundDate - The date of the next round
 * @param roundDuration - The duration of a round
 * @param rounds - The number of rounds to lock for
 * @returns The unlock date
 */
export function calculateUnlockDate(
  nextRoundDate: Date,
  roundDuration: number,
  rounds: number,
): Date {
  const unlockTimestamp =
    nextRoundDate.getTime() + rounds * roundDuration * 1000
  return new Date(unlockTimestamp)
}

/**
 * Lock GIVpower for a user
 *
 * @param account - The user's account
 * @param chainId - The chain ID
 * @param amount - The amount of GIVpower to lock
 * @param rounds - The number of rounds to lock for
 * @returns The transaction hash
 */
export async function lockGIVpower(
  account: Account,
  chainId: number,
  amount: bigint,
  rounds: number,
): Promise<string> {
  const cfg = STAKING_POOLS[chainId]
  if (!cfg?.GIVPOWER?.LM_ADDRESS) {
    throw new Error(`GIVpower not configured for chain ${chainId}`)
  }
  if (rounds < LOCK_CONSTANTS.MIN_ROUNDS) {
    throw new Error('Rounds must be at least 1')
  }
  if (rounds > LOCK_CONSTANTS.MAX_ROUNDS) {
    throw new Error('Rounds must be at most 26')
  }
  if (amount <= 0n) {
    throw new Error('Amount must be greater than 0')
  }

  const contract = getContract({
    client: thirdwebClient,
    chain: defineChain(chainId),
    address: cfg.GIVPOWER.LM_ADDRESS as Address,
    abi: GIVPOWER_ABI,
  })

  const transaction = prepareContractCall({
    contract,
    method: 'lock',
    params: [amount, BigInt(rounds)],
  })

  const receipt = await sendTransaction({ account, transaction })
  const finalReceipt = await waitForReceipt(receipt)
  return finalReceipt.transactionHash
}

/**
 * Unlock GIVpower for a user
 *
 * @param account - The user's account
 * @param chainId - The chain ID
 * @param lockIndex - The index of the lock to unlock
 * @returns The transaction hash
 */
export async function unlockGIVpower(
  account: Account,
  chainId: number,
  lockIndex: number,
): Promise<string> {
  const cfg = STAKING_POOLS[chainId]
  if (!cfg?.GIVPOWER?.LM_ADDRESS) {
    throw new Error(`GIVpower not configured for chain ${chainId}`)
  }

  const contract = getContract({
    client: thirdwebClient,
    chain: defineChain(chainId),
    address: cfg.GIVPOWER.LM_ADDRESS as Address,
    abi: GIVPOWER_ABI,
  })

  const transaction = prepareContractCall({
    contract,
    method: 'unlock',
    params: [BigInt(lockIndex)],
  })

  const receipt = await sendTransaction({ account, transaction })
  const finalReceipt = await waitForReceipt(receipt)
  return finalReceipt.transactionHash
}

/**
 * Fetch the GIVpower for a user on a single chain
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @returns The GIVpower
 */
export async function fetchUserGIVpower(
  user: Address,
  chainId: number,
): Promise<bigint> {
  const cfg = STAKING_POOLS[chainId]
  if (!cfg?.GIVPOWER?.LM_ADDRESS) {
    throw new Error(`GIVpower not configured for chain ${chainId}`)
  }

  // Get the GIVpower contract, this is used to get the user's GIVpower balance
  const contract = getContract({
    client: thirdwebClient,
    chain: defineChain(chainId),
    address: cfg.GIVPOWER.LM_ADDRESS as Address,
    abi: ERC20_ABI,
  })

  const givpower = (await readContract({
    contract,
    method: 'balanceOf',
    params: [user],
  })) as bigint

  return givpower
}

/**
 * Fetch the GIVpower for a user on a single chain
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @returns The GIVpower
 */
export async function fetchGIVpowerSingleChain(
  user: Address,
  chainId: number,
): Promise<bigint> {
  const cfg = STAKING_POOLS[chainId]
  if (!cfg?.GIVPOWER?.LM_ADDRESS) {
    return 0n
  }

  try {
    const contract = getContract({
      client: thirdwebClient,
      chain: defineChain(chainId),
      address: cfg.GIVPOWER.LM_ADDRESS as Address,
      abi: GIVPOWER_ABI,
    })

    const givpower = (await readContract({
      contract,
      method: 'balanceOf',
      params: [user],
    })) as bigint

    return givpower
  } catch (error) {
    console.warn(`Failed to fetch GIVpower on chain ${chainId}:`, error)
    return 0n
  }
}

/**
 * Fetch the total GIVpower for a user
 *
 * @param user - The user's address
 * @returns The total GIVpower
 */
export async function fetchTotalGIVpower(user: Address): Promise<{
  total: bigint
  byChain: Array<{
    chainId: number
    chainName: string
    givpower: bigint
  }>
}> {
  const [optimismGIVpower, gnosisGIVpower] = await Promise.all([
    fetchGIVpowerSingleChain(user, 10),
    fetchGIVpowerSingleChain(user, 100),
  ])

  const total = optimismGIVpower + gnosisGIVpower

  return {
    total,
    byChain: [
      { chainId: 10, chainName: 'Optimism', givpower: optimismGIVpower },
      { chainId: 100, chainName: 'Gnosis', givpower: gnosisGIVpower },
    ],
  }
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

  let staked = BigInt(data.unipoolBalance?.balance || '0')
  const baseRewards = BigInt(data.unipoolBalance?.rewards || '0')
  const rewardPerTokenPaid = BigInt(
    data.unipoolBalance?.rewardPerTokenPaid || '0',
  )
  const rewardPerTokenStored = BigInt(data.unipool.rewardPerTokenStored || '0')
  const totalSupply = BigInt(data.unipool.totalSupply)
  const rewardRate = BigInt(data.unipool.rewardRate)
  const periodFinish = Number(data.unipool.periodFinish)

  // Calculate FRESH rewardPerToken
  let freshRewardPerToken = rewardPerTokenStored
  if (totalSupply > 0n) {
    const now = Math.floor(Date.now() / 1000)
    const lastTimeRewardApplicable = Math.min(now, periodFinish)

    // Need lastUpdateTime from subgraph - add it to your query!
    const lastUpdateTime = Number(data.unipool.lastUpdateTime || now)
    const timeDelta = BigInt(lastTimeRewardApplicable - lastUpdateTime)

    const E18 = 1_000_000_000_000_000_000n
    freshRewardPerToken =
      rewardPerTokenStored + (timeDelta * rewardRate * E18) / totalSupply
  }

  // Use FRESH value for calculation
  const rewardPerTokenDelta =
    freshRewardPerToken > rewardPerTokenPaid
      ? freshRewardPerToken - rewardPerTokenPaid
      : 0n
  const accruedRewards =
    (staked * rewardPerTokenDelta) / 1_000_000_000_000_000_000n
  let earned = baseRewards + accruedRewards

  // On-chain fallback
  try {
    const contract = getContract({
      client: thirdwebClient,
      chain: defineChain(chainId),
      address: cfg.GIVPOWER.LM_ADDRESS as Address,
      abi: LM_ABI,
    })
    if (earned === 0n) {
      const onchainEarned = (await readContract({
        contract,
        method: 'earned',
        params: [user],
      })) as bigint
      earned = onchainEarned
    }
    if (staked === 0n) {
      const onchainStaked = (await readContract({
        contract,
        method: 'balanceOf',
        params: [user],
      })) as bigint
      staked = onchainStaked
    }
    if (cfg.GIVPOWER.type === 'GIV_GARDEN_LM') {
      const depositBalance = await fetchGIVpowerDepositBalance(user, chainId)
      if (depositBalance > 0n) {
        staked = depositBalance
      }
    }
  } catch (error) {
    console.warn('Failed to read on-chain staking data:', error)
  }
  // Calculate APR (BigInt-safe)
  const now = Math.floor(Date.now() / 1000)
  const poolActive = periodFinish > now
  const SECONDS_PER_YEAR = 31_536_000n
  const APR_SCALE = 1_000_000n

  // Calculate APR (BigInt-safe), this is used to calculate the APR
  const apr =
    poolActive && totalSupply > 0n
      ? Number(
          (rewardRate * SECONDS_PER_YEAR * 100n * APR_SCALE) / totalSupply,
        ) / Number(APR_SCALE)
      : 0

  if (poolActive) {
    console.warn('[GIVpower APR]', {
      rewardRate: formatUnits(rewardRate, 18),
      totalSupply: formatUnits(totalSupply, 18),
      apr,
    })
  }

  const locked = await fetchGIVpowerLocked(user, chainId)
  const boostMultiplier = locked > 0n ? Number(staked) / Number(locked) : 1
  const boostedAPR = locked > 0n ? apr * boostMultiplier : apr

  // Calculate streaming/claimable split
  if (cfg.TOKEN_DISTRO_ADDRESS && earned > 0n) {
    const distroData = await querySubgraph<TokenDistroData>(
      chainId,
      tokenDistroQuery(user, cfg.TOKEN_DISTRO_ADDRESS as Address),
    )

    // Create TokenDistroHelper for calculations, this is used to calculate the GIVstream
    if (distroData.tokenDistro) {
      const helper = new TokenDistroHelper({
        contractAddress: cfg.TOKEN_DISTRO_ADDRESS as Address,
        initialAmount: distroData.tokenDistro.initialAmount,
        lockedAmount: distroData.tokenDistro.lockedAmount,
        totalTokens: distroData.tokenDistro.totalTokens,
        startTime: Number(distroData.tokenDistro.startTime) * 1000,
        cliffTime: Number(distroData.tokenDistro.cliffTime) * 1000,
        endTime:
          (Number(distroData.tokenDistro.startTime) +
            Number(distroData.tokenDistro.duration)) *
          1000,
      })

      const claimable = helper.getLiquidPart(earned)
      const streaming = helper.getStreamPartTokenPerWeek(earned)

      return {
        staked,
        earned,
        claimable,
        streaming,
        apr,
        baseAPR: apr,
        boostedAPR,
        boostMultiplier,
      }
    }
  }

  // No streaming - everything is claimable
  return {
    staked,
    earned,
    claimable: earned,
    streaming: 0n,
    apr,
    baseAPR: apr,
    boostedAPR,
    boostMultiplier,
  }
}

/**
 * Fetch the locked GIVpower amount for a user
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @returns The locked amount
 */
export async function fetchGIVpowerLocked(user: Address, chainId: number) {
  const data = await querySubgraph<GIVpowerUserData>(
    chainId,
    `{
      user(id: "${user.toLowerCase()}") {
        givLocked
      }
    }`,
  )

  const rawLocked = data.user?.givLocked
  if (!rawLocked) return 0n
  return rawLocked.includes('.') ? parseUnits(rawLocked, 18) : BigInt(rawLocked)
}

/**
 * Fetch the actual deposited GIV amount (not shares) for GIVpower
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @returns The deposited GIV amount
 */
export async function fetchGIVpowerDepositBalance(
  user: Address,
  chainId: number,
): Promise<bigint> {
  const cfg = STAKING_POOLS[chainId]

  if (!cfg?.GIVPOWER?.LM_ADDRESS) {
    return 0n
  }

  // Try to get the GIVpower balance from the GIVpower contract, this is used to get the user's GIVpower balance
  try {
    // If the GIVpower type is GIV_GARDEN_LM, get the GIV balance from the GIV contract
    if (cfg.GIVPOWER.type === 'GIV_GARDEN_LM' && cfg.gGIV_TOKEN_ADDRESS) {
      // Get the GIV contract, this is used to get the user's GIV balance
      const gGivContract = getContract({
        client: thirdwebClient,
        chain: defineChain(chainId),
        address: cfg.gGIV_TOKEN_ADDRESS as Address,
        abi: ERC20_ABI,
      })
      const gGivBalance = (await readContract({
        contract: gGivContract,
        method: 'balanceOf',
        params: [user],
      })) as bigint
      return gGivBalance
    }

    // Get the GIVpower contract, this is used to get the user's GIVpower balance
    const contract = getContract({
      client: thirdwebClient,
      chain: defineChain(chainId),
      address: cfg.GIVPOWER.LM_ADDRESS as Address,
      abi: LM_ABI,
    })

    const depositBalance = (await readContract({
      contract,
      method: 'depositTokenBalance',
      params: [user],
    })) as bigint

    return depositBalance
  } catch (error) {
    console.warn('Failed to read depositTokenBalance:', error)
    return 0n
  }
}

/* Wallet Balance */

/**
 * Fetch the wallet balance for a user
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @returns The wallet balance
 */
export async function fetchWalletBalance(user: Address, chainId: number) {
  const cfg = STAKING_POOLS[chainId]

  // Fetch the token balance data from the subgraph, this is used to get the user's GIV balance
  const data = await querySubgraph<TokenBalanceData>(
    chainId,
    tokenBalanceQuery(user, cfg.GIV_TOKEN_ADDRESS as `0x${string}`),
  )

  return BigInt(data.tokenBalance?.balance || '0')
}

/* GIVbacks (TokenDistro) */

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

  // Fetch both token distro and token locks data in parallel
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

  // Create TokenDistroHelper for calculations
  const helper = new TokenDistroHelper({
    contractAddress: cfg.TOKEN_DISTRO_ADDRESS as `0x${string}`,
    initialAmount: distro.initialAmount,
    lockedAmount: distro.lockedAmount,
    totalTokens: distro.totalTokens,
    startTime: Number(distro.startTime) * 1000,
    cliffTime: Number(distro.cliffTime) * 1000,
    endTime: (Number(distro.startTime) + Number(distro.duration)) * 1000,
  })

  // Calculate claimable locked tokens
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
  // Calculate claimable from locked tokens
  const claimableFromLocks = claimableLocked
  // Calculate streaming from locked tokens
  const streamingFromLocks =
    claimableLocked > 0n ? helper.getStreamPartTokenPerWeek(totalLocked) : 0n

  console.warn('[GIVbacks] tokenLocks totals', {
    totalLocked: totalLocked.toString(),
    claimableLocked: claimableLocked.toString(),
    claimableFromLocks: claimableFromLocks.toString(),
  })

  // Calculate GIVback values
  const liquidPart = BigInt(balance.givbackLiquidPart || '0')
  const givbackTotal = BigInt(balance.givback || '0')
  const helperClaimable = helper.getUserClaimableNow(
    balance as unknown as ITokenDistroBalance,
  )
  // Calculate streamable amount
  const streamableAmount =
    helperClaimable > liquidPart ? helperClaimable - liquidPart : 0n
  // Calculate GIVback stream
  const givbackStream = helper.getStreamPartTokenPerWeek(givbackTotal)

  return {
    claimable: helperClaimable,
    claimableByHelper: helperClaimable,
    streamableAmount,
    streaming: helper.getStreamPartTokenPerWeek(
      BigInt(balance.allocatedTokens),
    ),
    allocated: BigInt(balance.allocatedTokens),
    claimed: BigInt(balance.claimed),
    givbackLiquidPart: liquidPart,
    givbackStream,
    claimableFromLocks,
    streamingFromLocks,
    totalLocked,
  }
}

/**
 * Fetch the GIVstream for a user
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @returns The GIVstream
 */
export async function fetchGIVstream(user: Address, chainId: number) {
  const cfg = STAKING_POOLS[chainId]

  if (!cfg.TOKEN_DISTRO_ADDRESS) {
    return {
      claimableNow: 0n,
      flowRatePerWeek: 0n,
      totalAllocated: 0n,
      totalClaimed: 0n,
      percentComplete: 0,
      timeRemaining: 0,
    }
  }

  // Fetch the token distro data, including the balance
  const distroData = await querySubgraph<TokenDistroData>(
    chainId,
    tokenDistroQuery(user, cfg.TOKEN_DISTRO_ADDRESS as `0x${string}`),
  )

  if (!distroData.tokenDistro || !distroData.tokenDistroBalance) {
    return {
      claimableNow: 0n,
      flowRatePerWeek: 0n,
      totalAllocated: 0n,
      totalClaimed: 0n,
      percentComplete: 0,
      timeRemaining: 0,
    }
  }

  const distro = distroData.tokenDistro
  const balance = distroData.tokenDistroBalance

  // Create TokenDistroHelper for calculations, this is used to calculate the GIVstream
  const helper = new TokenDistroHelper({
    contractAddress: cfg.TOKEN_DISTRO_ADDRESS as `0x${string}`,
    initialAmount: distro.initialAmount,
    lockedAmount: distro.lockedAmount,
    totalTokens: distro.totalTokens,
    startTime: Number(distro.startTime) * 1000,
    cliffTime: Number(distro.cliffTime) * 1000,
    endTime: (Number(distro.startTime) + Number(distro.duration)) * 1000,
  })

  const allocatedTokens = BigInt(balance.allocatedTokens)
  const givback = BigInt(balance.givback || '0')
  const claimed = BigInt(balance.claimed)
  const streamableAmount = allocatedTokens - givback

  const rawClaimable =
    helper.getLiquidPart(streamableAmount) - BigInt(balance.claimed)
  const claimableNow = rawClaimable > 0n ? rawClaimable : 0n

  return {
    claimableNow,
    flowRatePerWeek: helper.getStreamPartTokenPerWeek(streamableAmount),
    totalAllocated: allocatedTokens,
    totalClaimed: claimed,
    percentComplete: helper.GlobalReleasePercentage,
    timeRemaining: helper.remain,
  }
}

/**
 * Fetch the available to unstake amount for a user
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @returns The available to unstake amount
 */
export async function getAvailableToUnstake(
  user: Address,
  chainId: number,
): Promise<{
  totalStaked: bigint
  locked: bigint
  availableToUnstake: bigint
}> {
  const lockInfo = await fetchAvailableToLock(user, chainId)

  return {
    totalStaked: lockInfo.totalDeposited,
    locked: lockInfo.alreadyLocked,
    availableToUnstake: lockInfo.availableToLock,
  }
}

/**
 * Unstake GIV for a user
 *
 * @param account - The user's account
 * @param chainId - The chain ID
 * @param amount - The amount to unstake
 * @returns The transaction hash
 */
export async function unstakeGIV(
  account: Account,
  chainId: number,
  amount: bigint,
): Promise<string> {
  const cfg = STAKING_POOLS[chainId]
  if (!cfg?.GIVPOWER) {
    throw new Error(`GIVpower not configured for chain ${chainId}`)
  }
  if (amount === 0n) {
    throw new Error('Amount must be greater than 0')
  }

  // Fetch the available to unstake amount for the user
  const available = await getAvailableToUnstake(
    account.address as Address,
    chainId,
  )

  // Check if the amount is greater than the available to unstake amount
  if (amount > available.availableToUnstake) {
    throw new Error(
      `Insufficient available balance. Available: ${available.availableToUnstake}`,
    )
  }

  // If the GIVpower type is GIV_GARDEN_LM, unwrap the GIVpower
  if (cfg.GIVPOWER.type === 'GIV_GARDEN_LM' && cfg.GIVPOWER.GARDEN_ADDRESS) {
    const contract = getContract({
      client: thirdwebClient,
      chain: defineChain(chainId),
      address: cfg.GIVPOWER.GARDEN_ADDRESS as Address,
      abi: TOKEN_MANAGER_ABI,
    })
    const transaction = prepareContractCall({
      contract,
      method: 'unwrap',
      params: [amount],
    })
    const receipt = await sendTransaction({ account, transaction })
    const finalReceipt = await waitForReceipt(receipt)
    return finalReceipt.transactionHash
  }

  // If the GIVpower type is not GIV_GARDEN_LM, withdraw the GIVpower
  const contract = getContract({
    client: thirdwebClient,
    chain: defineChain(chainId),
    address: cfg.GIVPOWER.LM_ADDRESS as Address,
    abi: UNIPOOL_ABI_WITHDRAW,
  })

  // Prepare the transaction to withdraw the GIVpower
  const transaction = prepareContractCall({
    contract,
    method: 'withdraw',
    params: [amount],
  })

  const receipt = await sendTransaction({ account, transaction })
  const finalReceipt = await waitForReceipt(receipt)
  return finalReceipt.transactionHash
}

/**
 * Fetch the GIVstream history for a user
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @param skip - The number of events to skip
 * @param first - The number of events to fetch
 * @returns The GIVstream history
 */
export async function fetchGIVstreamHistory(
  user: Address,
  chainId: number,
  skip = 0,
  first = 6,
): Promise<{
  events: TokenAllocationEvent[]
  helper: TokenDistroHelper | null
}> {
  const cfg = STAKING_POOLS[chainId]

  if (!cfg.TOKEN_DISTRO_ADDRESS) {
    return { events: [], helper: null }
  }

  // Fetch the GIVstream history from the subgraph
  const data = await querySubgraph<TokenAllocationData>(
    chainId,
    tokenAllocationsQuery(
      user,
      cfg.TOKEN_DISTRO_ADDRESS as `0x${string}`,
      skip,
      first,
    ),
  )

  if (!data.tokenDistro) {
    return { events: data.tokenAllocations ?? [], helper: null }
  }

  const helper = new TokenDistroHelper({
    contractAddress: cfg.TOKEN_DISTRO_ADDRESS as `0x${string}`,
    initialAmount: data.tokenDistro.initialAmount,
    lockedAmount: data.tokenDistro.lockedAmount,
    totalTokens: data.tokenDistro.totalTokens,
    startTime: Number(data.tokenDistro.startTime) * 1000,
    cliffTime: Number(data.tokenDistro.cliffTime) * 1000,
    endTime:
      (Number(data.tokenDistro.startTime) + Number(data.tokenDistro.duration)) *
      1000,
  })

  return {
    events: data.tokenAllocations ?? [],
    helper,
  }
}

/**
 * Calculate the flowrate change for a given amount
 *
 * @param amount - The amount to calculate the flowrate change for
 * @param helper - The TokenDistroHelper
 * @returns The flowrate change
 */
export function calculateFlowrateChange(
  amount: bigint,
  helper: TokenDistroHelper,
): bigint {
  return helper.getStreamPartTokenPerWeek(amount)
}

/**
 * Get the source label for a given distributor
 *
 * @param distributor - The distributor
 * @returns The source label
 */
export function getSourceLabel(distributor: string): string {
  switch (distributor.toLowerCase()) {
    case 'givback':
      return 'GIVbacks'
    case 'unipool':
    case 'uniswapv3':
      return 'GIVfarm'
    case 'givdrop':
      return 'GIVdrop'
    case 'balancer':
      return 'Balancer'
    default:
      return distributor || 'Unknown'
  }
}

/**
 * Format the history date for a given timestamp
 *
 * @param timestamp - The timestamp to format
 * @returns The formatted date
 */
export function formatHistoryDate(timestamp: string): string {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    year: 'numeric',
    month: 'short',
  })
}

/**
 * Shorten the transaction hash for a given transaction hash
 *
 * @param txHash - The transaction hash to shorten
 * @returns The shortened transaction hash
 */
export function shortenTxHash(txHash: string): string {
  if (!txHash || txHash.length < 10) return txHash
  return `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
}

/* User Overview (Main API) */

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
          claimableByHelper: 0n,
          streamableAmount: 0n,
          streaming: 0n,
          allocated: 0n,
          claimed: 0n,
          claimableFromLocks: 0n,
          streamingFromLocks: 0n,
          totalLocked: 0n,
          givbackLiquidPart: 0n,
          givbackStream: 0n,
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

/**
 * Claim all rewards from the token distro
 *
 * @param account - The account to claim from
 * @param chainId - The chain ID
 * @param tokenDistroAddress - The token distro address
 * @returns The transaction hash
 */
export async function claimAll(
  account: Account,
  chainId: number,
  tokenDistroAddress: Address,
) {
  // Get TokenDistro contract
  const contract = getContract({
    client: thirdwebClient,
    chain: defineChain(chainId),
    address: tokenDistroAddress,
    abi: [
      {
        type: 'function',
        name: 'claim',
        stateMutability: 'nonpayable',
        inputs: [],
        outputs: [],
      },
    ],
  })

  // Prepare transaction
  const transaction = prepareContractCall({
    contract,
    method: 'claim',
    params: [],
  })

  // Send transaction
  const receipt = await sendTransaction({
    account,
    transaction,
  })

  const finalReceipt = await waitForReceipt(receipt)

  return finalReceipt.transactionHash
}

/**
 * ABI for the GIVpower Unipool contract
 */
const UNIPOOL_ABI = [
  {
    type: 'function',
    name: 'getReward',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const

/**
 * Harvest rewards based on whether the user is staking GIVpower
 *
 * - If staking: claim from GIVpower (includes GIVbacks/GIVstream)
 * - If not staking: claim from TokenDistro only
 */
export async function harvestRewards(
  account: Account,
  chainId: number,
  givpowerLmAddress: Address,
  tokenDistroAddress: Address,
  stakedAmount: bigint,
) {
  if (stakedAmount > 0n) {
    const contract = getContract({
      client: thirdwebClient,
      chain: defineChain(chainId),
      address: givpowerLmAddress,
      abi: UNIPOOL_ABI,
    })

    const transaction = prepareContractCall({
      contract,
      method: 'getReward',
      params: [],
    })

    const receipt = await sendTransaction({
      account,
      transaction,
    })

    const finalReceipt = await waitForReceipt(receipt)
    return finalReceipt.transactionHash
  }

  return claimAll(account, chainId, tokenDistroAddress)
}

/**
 * Calculate available amount to lock for GIVpower
 *
 * @param user - The user's address
 * @param chainId - The chain ID
 * @returns Object with staked, locked, and available amounts
 */
export async function fetchAvailableToLock(
  user: Address,
  chainId: number,
): Promise<{
  totalDeposited: bigint
  alreadyLocked: bigint
  availableToLock: bigint
}> {
  const cfg = STAKING_POOLS[chainId]

  if (!cfg?.GIVPOWER?.LM_ADDRESS) {
    throw new Error(`GIVpower not configured for chain ${chainId}`)
  }

  // Fetch both in parallel - use depositTokenBalance, NOT balanceOf
  const [depositBalance, lockedAmount] = await Promise.all([
    fetchGIVpowerDepositBalance(user, chainId),
    fetchGIVpowerLocked(user, chainId),
  ])

  const availableToLock =
    depositBalance > lockedAmount ? depositBalance - lockedAmount : 0n

  return {
    totalDeposited: depositBalance,
    alreadyLocked: lockedAmount,
    availableToLock,
  }
}

/**
 * Approve GIV token spend for GIVpower staking
 *
 * @param account - The account to approve
 * @param chainId - The chain ID
 * @param amount - The amount to approve
 * @returns The transaction hash
 */
export async function approveGIVpowerStake(
  account: Account,
  chainId: number,
  amount: bigint,
) {
  const cfg = STAKING_POOLS[chainId]
  if (!cfg?.GIVPOWER?.LM_ADDRESS || !cfg?.GIV_TOKEN_ADDRESS) {
    throw new Error(`GIVpower not configured for chain ${chainId}`)
  }

  const spenderAddress =
    cfg.GIVPOWER.type === 'GIV_GARDEN_LM'
      ? cfg.GIVPOWER.GARDEN_ADDRESS
      : cfg.GIVPOWER.LM_ADDRESS
  if (!spenderAddress) {
    throw new Error(`Spender address not configured for chain ${chainId}`)
  }

  // Get the GIV token contract, this is used to approve the GIV token spend
  const tokenContract = getContract({
    client: thirdwebClient,
    chain: defineChain(chainId),
    address: cfg.GIV_TOKEN_ADDRESS as Address,
    abi: ERC20_ABI,
  })

  // Prepare the transaction to approve the GIV token spend, this is used to approve the GIV token spend
  const transaction = prepareContractCall({
    contract: tokenContract,
    method: 'approve',
    params: [spenderAddress as Address, amount],
  })

  // Send the transaction to approve the GIV token spend
  const receipt = await sendTransaction({ account, transaction })

  // Wait for the transaction to be mined
  const finalReceipt = await waitForReceipt(receipt)

  return finalReceipt.transactionHash
}

/**
 * Stake GIV into GIVpower pool
 *
 * @param account - The account to stake from
 * @param chainId - The chain ID
 * @param amount - The amount to stake
 * @returns The transaction hash
 */
export async function stakeGIVpower(
  account: Account,
  chainId: number,
  amount: bigint,
) {
  const cfg = STAKING_POOLS[chainId]
  if (!cfg?.GIVPOWER?.LM_ADDRESS) {
    throw new Error(`GIVpower not configured for chain ${chainId}`)
  }

  if (cfg.GIVPOWER.type === 'GIV_GARDEN_LM') {
    if (!cfg.GIVPOWER.GARDEN_ADDRESS) {
      throw new Error(`GARDEN_ADDRESS not configured for chain ${chainId}`)
    }

    // Get the GIV token manager contract, this is used to wrap the GIV token
    const tokenManagerContract = getContract({
      client: thirdwebClient,
      chain: defineChain(chainId),
      address: cfg.GIVPOWER.GARDEN_ADDRESS as Address,
      abi: TOKEN_MANAGER_ABI,
    })

    // Prepare the transaction to wrap the GIV token
    const wrapTx = prepareContractCall({
      contract: tokenManagerContract,
      method: 'wrap',
      params: [amount],
    })

    // Send the transaction to wrap the GIV token
    const wrapReceipt = await sendTransaction({ account, transaction: wrapTx })

    // Wait for the transaction to be mined
    const finalWrapReceipt = await waitForReceipt(wrapReceipt)

    return finalWrapReceipt.transactionHash
  }

  // Get the GIVpower contract, this is used to stake the GIVpower
  const contract = getContract({
    client: thirdwebClient,
    chain: defineChain(chainId),
    address: cfg.GIVPOWER.LM_ADDRESS as Address,
    abi: LM_ABI,
  })

  // Prepare the transaction to stake the GIVpower
  const transaction = prepareContractCall({
    contract,
    method: 'stake',
    params: [amount],
  })

  // Send the transaction to stake the GIVpower
  const receipt = await sendTransaction({ account, transaction })

  // Wait for the transaction to be mined
  const finalReceipt = await waitForReceipt(receipt)

  return finalReceipt.transactionHash
}

/**
 * Format a token amount to a human readable string
 *
 * @param value - The token amount
 * @param tokenDecimals - The token decimals
 * @returns The formatted token amount
 */
export const formatToken = (
  value: bigint | null | undefined,
  tokenDecimals: number,
) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(formatUnits(value ?? 0n, tokenDecimals)))
