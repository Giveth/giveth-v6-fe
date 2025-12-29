import { GraphQLClient } from 'graphql-request'
import { env } from '@/lib/env'

const impactGraphClient = new GraphQLClient(env.IMPACT_GRAPH_URL, {
  headers: {
    'Content-Type': 'application/json',
    'apollo-require-preflight': 'true',
  },
})

const userExistsByAddressQuery = `
  query UserExistsByAddress($address: String!) {
    userExistsByAddress(address: $address)
  }
`

const createUserByAddressMutation = `
  mutation CreateUserByAddress($address: String!) {
    createUserByAddress(address: $address) {
      existing
      user {
        id
        walletAddress
      }
    }
  }
`

export async function userExistsByAddress(address: string): Promise<boolean> {
  const res = await impactGraphClient.request<{
    userExistsByAddress: boolean
  }>(userExistsByAddressQuery, { address })
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
  }>(createUserByAddressMutation, { address })
  return res.createUserByAddress.user
}

export async function ensureImpactGraphUserExists(
  address: string,
): Promise<void> {
  const exists = await userExistsByAddress(address)
  if (exists) return
  await createUserByAddress(address)
}
