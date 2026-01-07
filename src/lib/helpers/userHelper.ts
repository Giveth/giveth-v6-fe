import { type UserProfile } from '@/hooks/useAccount'

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
