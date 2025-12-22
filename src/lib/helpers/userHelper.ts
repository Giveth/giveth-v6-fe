import { type UserProfile } from '@/hooks/useAccount'

export const shortenAddress = (address?: string) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-5)}`
}

export const getUserName = (user: UserProfile) => {
  return user.name || user.firstName || user.lastName || ''
}
