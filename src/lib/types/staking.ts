export type SubgraphResponse<T> = {
  data?: T
  errors?: { message?: string }[]
}

export type StakingData = {
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

export type TokenBalanceData = {
  tokenBalance?: {
    balance?: string
  }
}

export type GIVpowerInfoData = {
  givpower?: {
    initialDate?: string
    roundDuration?: string
  }
}

export type GIVpowerUserData = {
  user?: {
    givLocked?: string
  }
}

export type TokenDistroData = {
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
    id?: string
    user?: string
    amount: string
    rounds?: string
    untilRound?: string
    unlockableAt?: string
    unlockedAt?: string
    unlocked?: boolean
  }>
}

export type TokenAllocationEvent = {
  recipient: string
  amount: string
  timestamp: string
  txHash: string
  distributor: string
}

export type TokenAllocationData = TokenDistroData & {
  tokenAllocations?: TokenAllocationEvent[]
}
