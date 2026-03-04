import { createThirdwebClient, defineChain } from 'thirdweb'
import {
  arbitrumSepolia,
  base,
  baseSepolia,
  gnosis,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  type Chain,
} from 'thirdweb/chains'
import {
  createWallet,
  inAppWallet,
  walletConnect,
  type Wallet,
} from 'thirdweb/wallets'
import { env } from '@/lib/env'

const celoAlfajores = defineChain(44787)

export const supportedChains: Chain[] = [
  gnosis,
  mainnet,
  optimism,
  base,
  polygon,
  celoAlfajores,
  ...(process.env.VERCEL_ENV === 'development' ||
  process.env.VERCEL_ENV === 'preview' ||
  process.env.VERCEL_ENV === 'local'
    ? [optimismSepolia, baseSepolia, arbitrumSepolia]
    : []),
]

const baseWallets: Wallet[] = [
  createWallet('io.metamask'),
  createWallet('com.trustwallet.app'),
  createWallet('com.coinbase.wallet'),
]

export const primaryWallets = baseWallets

const walletConnectWallet = env.WALLETCONNECT_PROJECT_ID
  ? walletConnect()
  : undefined

export const supportedWallets = walletConnectWallet
  ? [...baseWallets, walletConnectWallet]
  : baseWallets

/**
 * In-app wallet for AA (Account Abstraction) flow.
 * Supports email / Google auth and browser-wallet signer auth
 * with a smart account on Optimism.
 * This gives non-crypto users a "Donate with dollars" experience.
 */
export const aaInAppWallet = inAppWallet({
  auth: {
    options: ['email', 'google', 'wallet'],
  },
  smartAccount: {
    chain: optimism,
    sponsorGas: true,
    factoryAddress: undefined, // add a factor address later
  },
})

/** USDC contract address on Optimism */
export const OPTIMISM_USDC_ADDRESS =
  '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85'

/** Optimism chain ID */
export const OPTIMISM_CHAIN_ID = 10

export const thirdwebClient = createThirdwebClient({
  clientId: env.THIRDWEB_CLIENT_ID,
})
