import type { Project } from '@/context/CartContext'
import type { GroupedProjects } from '@/lib/types/cart'

/**
 * Group cart items by round
 * @param cartItems - The cart items to group
 * @returns {
 *   qfRoundGroups: GroupedProjects[]
 *   nonQfProjects: Project[]
 * }
 * @returns The grouped projects
 */
export function groupCartItemsByRound(cartItems: Project[]): {
  qfRoundGroups: GroupedProjects[]
  nonQfProjects: Project[]
} {
  const groups: Map<string, GroupedProjects> = new Map()
  const nonQf: Project[] = []

  cartItems.forEach(item => {
    if (item.roundId && item.roundName) {
      const key = String(item.roundId)

      if (!groups.has(key)) {
        groups.set(key, {
          roundId: item.roundId,
          roundName: item.roundName,
          selectedChainId: item.chainId ?? 0,
          tokenSymbol: item.tokenSymbol ?? '',
          tokenAddress: item.tokenAddress ?? '',
          tokenDecimals: item.tokenDecimals ?? 18,
          projects: [],
          totalAmount: '0',
        })
      }

      const round = groups.get(key)!
      round.projects.push(item)

      const total = round.projects.reduce((sum, project) => {
        const amount = parseFloat(project.donationAmount || '0')
        return sum + amount
      }, 0)
      round.totalAmount = total.toString()
    } else {
      nonQf.push(item)
    }
  })

  return {
    qfRoundGroups: Array.from(groups.values()),
    nonQfProjects: nonQf,
  }
}
