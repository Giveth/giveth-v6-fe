import { type Address } from 'viem'

export interface IUnipool {
  totalSupply: string
  lastUpdateTime: number
  periodFinish: number
  rewardPerTokenStored: string
  rewardRate: string
}

export interface IUnipoolBalance {
  balance: string
  rewards: string
  rewardPerTokenPaid: string
}

export interface ITokenDistro {
  contractAddress: Address
  initialAmount: string
  lockedAmount: string
  totalTokens: string
  startTime: number
  cliffTime: number
  endTime: number
}

export interface ITokenDistroBalance {
  allocatedTokens: string
  allocationCount: string
  claimed: string
  givback: string
  givDropClaimed: boolean
  givbackLiquidPart: string
  tokenDistroAddress: Address
}

export interface ITokenBalance {
  balance: string
}

export interface IUniswapV3Pool {
  token0: string
  token1: string
  sqrtPriceX96: string
  tick: number
  liquidity: string
}

export interface IUniswapV3Position {
  tokenId: number
  token0: string
  token1: string
  liquidity: string
  tickLower: number
  tickUpper: number
  owner: string
  staker: string | null
  staked: boolean
}

export interface IInfinitePositionReward {
  lastRewardAmount: string
  lastUpdateTimeStamp: number
}

export interface IGIVpower {
  id: string
  initialDate: string
  locksCreated: number
  roundDuration: number
  totalGIVLocked: string
  currentRound: number
  nextRoundDate: string
}

export type StakingPoolConfig = {
  GIVPOWER: {
    network: number
    LM_ADDRESS: string
    POOL_ADDRESS: string
    GARDEN_ADDRESS?: string
    type: string
    platform: string
    title: string
    description: string
    unit: string
    coingeckoId: string
    decimals: number
  }
  TOKEN_DISTRO_ADDRESS: string
  GIV_TOKEN_ADDRESS: string
  gGIV_TOKEN_ADDRESS?: string
  subgraphUrl: string
}

export interface ISubgraphState {
  [key: string]:
    | IUnipool
    | IUnipoolBalance
    | ITokenDistro
    | ITokenDistroBalance
    | ITokenBalance
    | IUniswapV3Pool
    | IUniswapV3Position[]
    | IInfinitePositionReward
    | IUniswapV3Position
    | IGIVpower
    | number
    | boolean
}

export enum StakingPlatform {
  GIVETH = 'Staking',
  UNISWAP = 'Uniswap',
  BALANCER = 'Balancer',
  HONEYSWAP = 'Honeyswap',
  SUSHISWAP = 'Sushiswap',
  ICHI = 'ICHI',
}

export enum StakingType {
  UNISWAPV2_GIV_DAI = 'UniswapV2_GIV_DAI',
  UNISWAPV3_ETH_GIV = 'UniswapV3', // ETH-GIV
  BALANCER_ETH_GIV = 'Balancer', // ETH-GIV
  SUSHISWAP_ETH_GIV = 'Sushiswap', // ETH-GIV
  HONEYSWAP_GIV_HNY = 'Honeyswap_GIV_HNY',
  HONEYSWAP_GIV_DAI = 'Honeyswap_GIV_DAI',
  GIV_GARDEN_LM = 'GIV_GARDEN_LM',
  GIV_UNIPOOL_LM = 'GIV_UNIPOOL_LM',
  ICHI_GIV_ONEGIV = 'Ichi_GIV_oneGIV',

  HONEYSWAP_FOX_HNY = 'Honeyswap_FOX_HNY',
  HONEYSWAP_FOX_XDAI = 'Honeyswap_FOX_DAI',
  UNISWAPV2_CULT_ETH = 'UniswapV2_CULT_ETH',
}

export interface IntroCardConfig {
  icon?: string
  title: string
  description: string
  link: string
}

export interface SimplePoolStakingConfig {
  network: number
  POOL_ADDRESS: Address
  type: StakingType
  LM_ADDRESS: Address
  GARDEN_ADDRESS?: Address
  farmStartTimeMS?: number
  farmEndTimeMS?: number
  icon?: string
  exploited?: boolean
  platform: StakingPlatform
  platformTitle?: string
  title: string
  description?: string
  provideLiquidityLink?: string
  unit: string
  introCard?: IntroCardConfig
}
