import { createThirdwebClient, defineChain } from 'thirdweb'
import {
  arbitrumSepolia,
  base,
  baseSepolia,
  gnosis,
  mainnet,
  optimism,
  polygon,
  type Chain,
} from 'thirdweb/chains'
import { createWallet, walletConnect, type Wallet } from 'thirdweb/wallets'
import { env } from '@/lib/env'

const celoAlfajores = defineChain(44787)

export const supportedChains: Chain[] = [
  gnosis,
  mainnet,
  optimism,
  base,
  polygon,
  celoAlfajores,
  arbitrumSepolia,
  baseSepolia,
]

const baseWallets: Wallet[] = [
  createWallet('io.metamask'),
  createWallet('com.trustwallet.app'),
  createWallet('com.coinbase.wallet'),
]

const walletConnectWallet = env.WALLETCONNECT_PROJECT_ID
  ? walletConnect()
  : undefined

export const supportedWallets = walletConnectWallet
  ? [...baseWallets, walletConnectWallet]
  : baseWallets

export const thirdwebClient = createThirdwebClient({
  clientId: env.THIRDWEB_CLIENT_ID,
})
