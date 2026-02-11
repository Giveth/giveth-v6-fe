import { env } from 'process'

// For local or developemnt we use these chains
export const DEV_CHAINS = [
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
export const PROD_CHAINS = [
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
export const CHAINS = env.VERCEL_ENV === 'production' ? PROD_CHAINS : DEV_CHAINS
