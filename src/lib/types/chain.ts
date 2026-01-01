export interface ChainInfo {
  id: number
  name: string
  shortName: string
  blockExplorerUrl: string
  iconKey: string
  isTestnet: boolean
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export type WalletTokenWithBalance = {
  address?: `0x${string}` // undefined for native token
  symbol: string
  decimals: number
  name?: string
  logoURI?: string
  chainId: number
  priceInUSD: number
  balance: string
  formattedBalance: string
  isGivbackEligible?: boolean
}
