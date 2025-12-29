import type { Project } from '@/context/CartContext'

export interface GroupedProjects {
  roundId: number
  roundName: string
  selectedChainId: number
  token: string
  tokenAddress: string
  projects: Project[]
  totalAmount: string
}
