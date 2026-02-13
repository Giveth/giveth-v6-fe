import { env } from 'process'

// For local or developemnt we use these chains
export const DEV_STAKING_CHAINS = [
  {
    id: 10,
    name: 'Optimism Mainnet',
    shortName: 'OP',
  },
  {
    id: 11155420,
    name: 'Optimism Sepolia',
    shortName: 'OP',
  },
  {
    id: 100,
    name: 'Gnosis',
    shortName: 'GNO',
  },
]

// For production we use these chains
export const PROD_STAKING_CHAINS = [
  {
    id: 10,
    name: 'Optimism Mainnet',
    shortName: 'OP',
  },
  {
    id: 100,
    name: 'Gnosis',
    shortName: 'GNO',
  },
]

// For all chains we use these constants
export const STAKING_CHAINS =
  env.VERCEL_ENV === 'production' ? PROD_STAKING_CHAINS : DEV_STAKING_CHAINS

export const DEV_STAKING_POOLS: Record<
  number,
  {
    GIVPOWER: {
      network: number
      LM_ADDRESS: string
      POOL_ADDRESS: string
      type: string
      platform: string
      title: string
      description: string
      unit: string
      coingeckoId: string
    }
    TOKEN_DISTRO_ADDRESS: string
    GIV_TOKEN_ADDRESS: string
    subgraphUrl: string
  }
> = {
  // Optimism Sepolia chain ID
  11155420: {
    GIVPOWER: {
      network: 11155420, // Optimism Sepolia chain ID
      LM_ADDRESS: '0xE6836325B13819CF38f030108255A5213491A725',
      POOL_ADDRESS: '0x2f2c819210191750F2E11F7CfC5664a0eB4fd5e6', // GIV token on OP Sepolia
      type: 'GIV_UNIPOOL_LM',
      platform: 'Staking',
      title: 'GIV',
      description: '100% GIV',
      unit: 'GIV',
      coingeckoId: 'giveth',
    },
    TOKEN_DISTRO_ADDRESS: '0x301C739CF6bfb6B47A74878BdEB13f92F13Ae5E7',
    GIV_TOKEN_ADDRESS: '0x2f2c819210191750F2E11F7CfC5664a0eB4fd5e6',
    subgraphUrl:
      'https://gateway.thegraph.com/api/subgraphs/id/2SDamh7QMqXtwMGEigKb6ofuuYthRo23dsru74uszcpM',
  },
}

export const PROD_STAKING_POOLS: Record<
  number,
  {
    GIVPOWER: {
      network: number
      LM_ADDRESS: string
      POOL_ADDRESS: string
      type: string
      platform: string
      title: string
      description: string
      unit: string
      coingeckoId: string
    }
    TOKEN_DISTRO_ADDRESS: string
    GIV_TOKEN_ADDRESS: string
    subgraphUrl: string
  }
> = {
  // Optimism Sepolia chain ID
  10: {
    GIVPOWER: {
      network: 10, // Optimism Mainnet
      LM_ADDRESS: '0x301C739CF6bfb6B47A74878BdEB13f92F13Ae5E7',
      POOL_ADDRESS: '0x528CDc92eAB044E1E39FE43B9514bfdAB4412B98', // GIV token on OP Mainnet
      type: 'GIV_UNIPOOL_LM',
      platform: 'Staking',
      title: 'GIV',
      description: '100% GIV',
      unit: 'GIV',
      coingeckoId: 'giveth',
    },
    TOKEN_DISTRO_ADDRESS: '0xe3ac7b3e6b4065f4765d76fdc215606483bf3bd1',
    GIV_TOKEN_ADDRESS: '0x528CDc92eAB044E1E39FE43B9514bfdAB4412B98',
    subgraphUrl:
      'https://gateway.thegraph.com/api/subgraphs/id/zyoJAUh2eGLEbEkBqESDD497qHLGH1YcKH9PBEMnWjM',
  },
}

export const STAKING_POOLS =
  env.VERCEL_ENV === 'production'
    ? PROD_STAKING_POOLS
    : { ...DEV_STAKING_POOLS, ...PROD_STAKING_POOLS }

export const SUBGRAPH_POLLING_INTERVAL = 300_000 // 5 minutes
