import { env } from 'process'
import { type StakingPoolConfig } from '@/lib/types/subgraph'

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
// For claim rewards we use these chains
export const CLAIM_REWARDS_CHAINS = [
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
  {
    id: 1,
    name: 'Ethereum Mainnet',
    shortName: 'ETH',
  },
  {
    id: 1101,
    name: 'Polygon zkEVM',
    shortName: 'zkEVM',
  },
]

// For all chains we use these constants
export const STAKING_CHAINS =
  env.VERCEL_ENV === 'production' ? PROD_STAKING_CHAINS : DEV_STAKING_CHAINS

export const DEV_STAKING_POOLS: Record<number, StakingPoolConfig> = {
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
      decimals: 18,
    },
    TOKEN_DISTRO_ADDRESS: '0x301C739CF6bfb6B47A74878BdEB13f92F13Ae5E7',
    GIV_TOKEN_ADDRESS: '0x2f2c819210191750F2E11F7CfC5664a0eB4fd5e6',
    subgraphUrl:
      'https://gateway.thegraph.com/api/subgraphs/id/2SDamh7QMqXtwMGEigKb6ofuuYthRo23dsru74uszcpM',
  },
  // Gnosis chain ID for staging
  100: {
    GIVPOWER: {
      network: 100, // Gnosis chain ID
      LM_ADDRESS: '0xDAEa66Adc97833781139373DF5B3bcEd3fdda5b1',
      POOL_ADDRESS: '0x83a8eea6427985C523a0c4d9d3E62C051B6580d3', // GIV token on Gnosis
      type: 'GIV_GARDEN_LM',
      platform: 'Staking',
      title: 'GIV',
      description: '100% GIV',
      unit: 'GIV',
      coingeckoId: 'giveth',
      decimals: 18,
    },
    TOKEN_DISTRO_ADDRESS: '0x18a46865AAbAf416a970eaA8625CFC430D2364A1',
    GIV_TOKEN_ADDRESS: '0x83a8eea6427985C523a0c4d9d3E62C051B6580d3',
    subgraphUrl:
      'https://gateway.thegraph.com/api/subgraphs/id/BGkr8hzRGb8UK3GoDni6QTBmiPVeCioqawJ96BRxjsvs',
  },
}

export const PROD_STAKING_POOLS: Record<number, StakingPoolConfig> = {
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
      decimals: 18,
    },
    TOKEN_DISTRO_ADDRESS: '0xe3ac7b3e6b4065f4765d76fdc215606483bf3bd1',
    GIV_TOKEN_ADDRESS: '0x528CDc92eAB044E1E39FE43B9514bfdAB4412B98',
    subgraphUrl:
      'https://gateway.thegraph.com/api/subgraphs/id/zyoJAUh2eGLEbEkBqESDD497qHLGH1YcKH9PBEMnWjM',
  },
  // Gnosis (xDai) Mainnet chain ID
  100: {
    GIVPOWER: {
      network: 100, // Gnosis Mainnet
      LM_ADDRESS: '0xD93d3bDBa18ebcB3317a57119ea44ed2Cf41C2F2',
      POOL_ADDRESS: '0x4f4F9b8D5B4d0Dc10506e5551B0513B61fD59e75', // GIV token on Gnosis
      GARDEN_ADDRESS: '0x24f2d06446af8d6e89febc205e7936a602a87b60', // gGIV wrapper
      type: 'GIV_GARDEN_LM',
      platform: 'Staking',
      title: 'GIV',
      description: '100% GIV',
      unit: 'GIV',
      coingeckoId: 'giveth',
      decimals: 18,
    },
    TOKEN_DISTRO_ADDRESS: '0xc0dbDcA66a0636236fAbe1B3C16B1bD4C84bB1E1',
    GIV_TOKEN_ADDRESS: '0x4f4F9b8D5B4d0Dc10506e5551B0513B61fD59e75',
    gGIV_TOKEN_ADDRESS: '0xfFBAbEb49be77E5254333d5fdfF72920B989425f', // Wrapped GIV for Garden
    subgraphUrl:
      'https://gateway-arbitrum.network.thegraph.com/api/720ca27934ee17d259dc2975d9a6d714/subgraphs/id/Bbz1imi78Set7VYKxqwNGZ4dwqJpEUBNYqGsbPPZPh4q',
  },
  // ETHEREUM MAINNET - GIVstreams & GIVbacks only (NO GIVpower staking)
  1: {
    // NO GIVPOWER - staking not available on Ethereum Mainnet
    // Users can only claim GIVstream rewards and view GIVbacks history
    TOKEN_DISTRO_ADDRESS: '0x87dE995F6744B75bBe0255A973081142aDb61f4d',
    GIV_TOKEN_ADDRESS: '0x900db999074d9277c5da2a43f252d74366230da0',
    subgraphUrl:
      'https://gateway-arbitrum.network.thegraph.com/api/720ca27934ee17d259dc2975d9a6d714/subgraphs/id/9QK3vLoWF69TXSenUzQkkLhessaViu4naE58gRyKCxU7',
    GIVPOWER: {
      LM_ADDRESS: '',
      POOL_ADDRESS: '',
      type: '',
      platform: '',
      title: '',
      description: '',
      unit: '',
      network: 1,
      coingeckoId: 'giveth',
      decimals: 18,
    },
  },
  // POLYGON ZKEVM - GIVstreams & GIVbacks only (NO GIVpower staking)
  1101: {
    // NO GIVPOWER - staking not available on Polygon zkEVM
    // Users can only claim GIVstream rewards and view GIVbacks history
    TOKEN_DISTRO_ADDRESS: '0xE3Ac7b3e6B4065f4765d76fDc215606483BF3bD1',
    GIV_TOKEN_ADDRESS: '0xddAFB91475bBf6210a151FA911AC8fdA7dE46Ec2',
    subgraphUrl:
      'https://gateway-arbitrum.network.thegraph.com/api/720ca27934ee17d259dc2975d9a6d714/subgraphs/id/2vCbDTY8yM27SgxUXZHf1YLWHjX5cCc2LtJpEix6NWVq',

    GIVPOWER: {
      network: 1101,
      LM_ADDRESS: '',
      POOL_ADDRESS: '',
      type: '',
      platform: '',
      title: '',
      description: '',
      unit: '',
      coingeckoId: 'giveth',
      decimals: 18,
    },
  },
}

// For all chains we use these constants
export const STAKING_POOLS =
  env.VERCEL_ENV === 'production'
    ? PROD_STAKING_POOLS
    : { ...DEV_STAKING_POOLS, ...PROD_STAKING_POOLS }

// For boosting we use these chains
export const STAKING_POOLS_FOR_BOOSTING =
  env.VERCEL_ENV === 'production' ? PROD_STAKING_POOLS : DEV_STAKING_POOLS

export const SUBGRAPH_POLLING_INTERVAL = 300_000 // 5 minutes
