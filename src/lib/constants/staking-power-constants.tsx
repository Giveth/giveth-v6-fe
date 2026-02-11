import { env } from 'process'

// For local or developemnt we use these chains
export const DEV_STAKING_CHAINS = [
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
    id: 1,
    name: 'Ethereum',
    shortName: 'ETH',
  },
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

export const DEV_STAKING_POOLS = [
  {
    OPTIMISM_CONFIG: {
      GIVPOWER: {
        network: 11155420, // Optimism Sepolia chain ID
        LM_ADDRESS: '0xE6836325B13819CF38f030108255A5213491A725',
        POOL_ADDRESS: '0x2f2c819210191750F2E11F7CfC5664a0eB4fd5e6', // GIV token on OP Sepolia
        type: 'GIV_UNIPOOL_LM',
        platform: 'Staking',
        title: 'GIV',
        description: '100% GIV',
        unit: 'GIV',
      },
    },
  },
]

export const STAKING_POOLS =
  env.VERCEL_ENV === 'production' ? DEV_STAKING_POOLS : DEV_STAKING_POOLS
