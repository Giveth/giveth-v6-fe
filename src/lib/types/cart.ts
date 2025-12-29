import type { Project } from '@/context/CartContext'

export interface GroupedProjects {
  roundId: number
  roundName: string
  selectedChainId: number
  tokenSymbol: string
  tokenDecimals: number
  tokenAddress: string
  projects: Project[]
  totalAmount: string
}
