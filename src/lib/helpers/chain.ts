import { CHAINS, CHAIN_ICONS } from '@/lib/constants/chain'
import type { ChainInfo } from '@/lib/types/chain'

export function getChainInfo(chainId: number): ChainInfo | undefined {
  return CHAINS[chainId]
}

export function getChainIcon(chainId: number): {
  bg: string
  iconUrl: string
  fallbackIcon: string
  textColor?: string
} {
  const chain = getChainInfo(chainId)
  if (!chain) {
    return CHAIN_ICONS.ethereum // fallback
  }
  return CHAIN_ICONS[chain.iconKey] || CHAIN_ICONS.ethereum
}

export function getChainName(chainId: number): string {
  const chain = getChainInfo(chainId)
  return chain?.name || `Chain ${chainId}`
}

export function getChainShortName(chainId: number): string {
  const chain = getChainInfo(chainId)
  return chain?.shortName || `${chainId}`
}

export function getBlockExplorerUrl(chainId: number): string {
  const chain = getChainInfo(chainId)
  return chain?.blockExplorerUrl || ''
}

export function getTransactionUrl(chainId: number, txHash: string): string {
  const explorerUrl = getBlockExplorerUrl(chainId)
  return explorerUrl ? `${explorerUrl}/tx/${txHash}` : ''
}
