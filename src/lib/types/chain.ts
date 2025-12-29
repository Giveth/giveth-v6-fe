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
