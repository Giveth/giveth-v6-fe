import { impactGraphClient } from '@/lib/impact-graph/client'
import {
  impactGraphCreateUserByAddressMutation,
  impactGraphUserExistsByAddressQuery,
} from '@/lib/impact-graph/queries'

export async function userExistsByAddress(address: string): Promise<boolean> {
  const res = await impactGraphClient.request<{
    userExistsByAddress: boolean
  }>(impactGraphUserExistsByAddressQuery, { address })
  return Boolean(res.userExistsByAddress)
}

export async function createUserByAddress(address: string): Promise<{
  id: number
  walletAddress?: string | null
}> {
  const res = await impactGraphClient.request<{
    createUserByAddress: {
      existing: boolean
      user: { id: number; walletAddress?: string | null }
    }
  }>(impactGraphCreateUserByAddressMutation, { address })
  return res.createUserByAddress.user
}

export async function ensureImpactGraphUserExists(
  address: string,
): Promise<void> {
  const exists = await userExistsByAddress(address)
  if (exists) return
  await createUserByAddress(address)
}
