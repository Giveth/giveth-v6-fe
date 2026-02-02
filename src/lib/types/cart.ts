import type { ProjectCartItem } from '@/context/CartContext'
import { type WalletTokenWithBalance } from './chain'

export interface GroupedProjects {
  roundId: number
  roundName: string
  selectedChainId: number
  selectedToken: WalletTokenWithBalance | undefined
  tokenSymbol: string
  tokenDecimals: number
  tokenAddress: string
  projects: ProjectCartItem[]
  totalAmount: string
  totalUsdValue: string
}
