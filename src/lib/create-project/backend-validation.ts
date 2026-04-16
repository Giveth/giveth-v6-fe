import { createPublicClient, http } from 'viem'
import { getEnsAddress } from 'viem/actions'
import { mainnet } from 'viem/chains'
import { normalize } from 'viem/ens'
import type { CreateProjectRecipientAddress } from '@/lib/create-project/types'
import { isLikelyEnsName } from '@/lib/create-project/validation'
import { createGraphQLClient } from '@/lib/graphql/client'

const titleValidationQuery = /* GraphQL */ `
  query ValidateCreateProjectTitle($title: String!) {
    validateCreateProjectTitle(title: $title)
  }
`

const recipientAddressValidationQuery = /* GraphQL */ `
  query ValidateCreateProjectRecipientAddress(
    $address: String!
    $chainType: ChainType
    $memo: String
  ) {
    validateCreateProjectRecipientAddress(
      address: $address
      chainType: $chainType
      memo: $memo
    )
  }
`

const graphQLClient = createGraphQLClient()
const ensPublicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

type TitleValidationResponse = {
  validateCreateProjectTitle: string | null
}

export async function validateCreateProjectTitleRemotely(
  title: string,
): Promise<string | undefined> {
  const normalizedTitle = title.trim()
  if (!normalizedTitle) return undefined

  try {
    const response = await graphQLClient.request<TitleValidationResponse>(
      titleValidationQuery,
      {
        title: normalizedTitle,
      },
    )

    return response.validateCreateProjectTitle ?? undefined
  } catch (error) {
    console.error('Project title pre-validation failed:', error)
    return undefined
  }
}

export async function validateCreateProjectRecipientAddressRemotely(
  recipientAddress: CreateProjectRecipientAddress,
): Promise<{ resolvedAddress?: string; error?: string }> {
  const rawAddress = recipientAddress.address.trim()
  if (!rawAddress) return {}

  let resolvedAddress: string | undefined
  let normalizedAddress = rawAddress

  if (
    recipientAddress.chainType === 'EVM' &&
    isLikelyEnsName(normalizedAddress)
  ) {
    resolvedAddress = await resolveEnsAddress(normalizedAddress)
    if (!resolvedAddress) {
      return {
        error: 'ENS name could not be resolved on Ethereum mainnet',
      }
    }
    normalizedAddress = resolvedAddress
  }

  try {
    const response = await graphQLClient.request<{
      validateCreateProjectRecipientAddress: string | null
    }>(recipientAddressValidationQuery, {
      address: normalizedAddress,
      chainType: recipientAddress.chainType,
      memo:
        recipientAddress.chainType === 'STELLAR'
          ? recipientAddress.memo?.trim() || undefined
          : undefined,
    })

    if (response.validateCreateProjectRecipientAddress) {
      return {
        resolvedAddress,
        error: response.validateCreateProjectRecipientAddress,
      }
    }
  } catch (error) {
    console.error('Recipient address pre-validation failed:', error)
  }

  return { resolvedAddress }
}

async function resolveEnsAddress(name: string): Promise<string | undefined> {
  try {
    return (
      (await getEnsAddress(ensPublicClient, {
        name: normalize(name),
      })) ?? undefined
    )
  } catch (error) {
    console.error('ENS resolution failed:', error)
    return undefined
  }
}
