import { GraphQLClient } from 'graphql-request'
import { env } from '@/lib/env'

const impactGraphClient = new GraphQLClient(
  env.NEXT_PUBLIC_IMPACT_GRAPHQL_ENDPOINT!,
  {
    headers: {
      'Content-Type': 'application/json',
      'apollo-require-preflight': 'true',
    },
  },
)

const userByAddressQuery = `
  query UserByAddress($address: String!) {
    userByAddress(address: $address) {
      id
    }
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
    userByAddress: { id: string } | null
  }>(userByAddressQuery, { address })

  return Boolean(res.userByAddress)
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
