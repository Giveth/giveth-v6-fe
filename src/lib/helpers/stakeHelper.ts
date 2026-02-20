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
import { STAKING_POOLS } from '@/lib/constants/staking-power-constants'
import { TokenDistroHelper } from '@/lib/helpers/tokenDistroHelper'
import { thirdwebClient } from '@/lib/thirdweb/client'
import { type ITokenDistroBalance } from '@/lib/types/subgraph'

/* Types */
type SubgraphResponse<T> = {
  data?: T
  errors?: { message?: string }[]
}

type StakingData = {
  unipool?: {
    totalSupply: string
    rewardRate: string
    periodFinish: string
    lastUpdateTime?: string
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

type GIVpowerUserData = {
  user?: {
    givLocked?: string
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

const LM_ABI = [
  {
    type: 'function',
    name: 'earned',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'depositTokenBalance',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'stake',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
] as const

const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

const TOKEN_MANAGER_ABI = [
  {
    type: 'function',
    name: 'wrap',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
] as const

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

  try {
    if (cfg.GIVPOWER.type === 'GIV_GARDEN_LM' && cfg.gGIV_TOKEN_ADDRESS) {
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

  const tokenContract = getContract({
    client: thirdwebClient,
    chain: defineChain(chainId),
    address: cfg.GIV_TOKEN_ADDRESS as Address,
    abi: ERC20_ABI,
  })

  const transaction = prepareContractCall({
    contract: tokenContract,
    method: 'approve',
    params: [spenderAddress as Address, amount],
  })

  const receipt = await sendTransaction({ account, transaction })
  const finalReceipt = await waitForReceipt(receipt)
  return finalReceipt.transactionHash
}

/**
 * Stake GIV into GIVpower pool
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

    const tokenManagerContract = getContract({
      client: thirdwebClient,
      chain: defineChain(chainId),
      address: cfg.GIVPOWER.GARDEN_ADDRESS as Address,
      abi: TOKEN_MANAGER_ABI,
    })

    const wrapTx = prepareContractCall({
      contract: tokenManagerContract,
      method: 'wrap',
      params: [amount],
    })

    const wrapReceipt = await sendTransaction({ account, transaction: wrapTx })
    const finalWrapReceipt = await waitForReceipt(wrapReceipt)
    return finalWrapReceipt.transactionHash
  }

  const contract = getContract({
    client: thirdwebClient,
    chain: defineChain(chainId),
    address: cfg.GIVPOWER.LM_ADDRESS as Address,
    abi: LM_ABI,
  })

  const transaction = prepareContractCall({
    contract,
    method: 'stake',
    params: [amount],
  })

  const receipt = await sendTransaction({ account, transaction })
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
export const formatToken = (value: bigint, tokenDecimals: number) =>
  new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(formatUnits(value, tokenDecimals)))
