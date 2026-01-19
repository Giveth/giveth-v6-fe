import { resolveName } from 'thirdweb/extensions/ens'
import type { UserProfile } from '@/hooks/useAccount'
import type { ThirdwebClient } from 'thirdweb'
import type { Chain } from 'thirdweb/chains'
import type { Address } from 'thirdweb/utils'

export const shortenAddress = (
  address?: string,
  startLength: number = 6,
  endLength: number = 5,
) => {
  if (!address) return ''
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

export const getUserName = (user: UserProfile) => {
  return user.name || user.firstName || user.lastName || ''
}

export function getEnsName(options: {
  client: ThirdwebClient
  address: Address
  resolverChain?: Chain
  resolverAddress?: Address
}) {
  return resolveName(options)
}
