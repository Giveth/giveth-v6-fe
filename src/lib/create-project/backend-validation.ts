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

const recipientAddressesValidationQuery = /* GraphQL */ `
  query ValidateCreateProjectRecipientAddresses(
    $addresses: [ValidateCreateProjectRecipientAddressInput!]!
  ) {
    validateCreateProjectRecipientAddresses(addresses: $addresses) {
      clientId
      isValid
      error
    }
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

export async function validateCreateProjectRecipientAddressesRemotely(
  recipientAddresses: CreateProjectRecipientAddress[],
): Promise<{
  resolvedAddresses: Record<string, string>
  errors: Record<string, string>
}> {
  if (!recipientAddresses.length) {
    return { resolvedAddresses: {}, errors: {} }
  }

  const resolvedAddresses: Record<string, string> = {}
  const errors: Record<string, string> = {}

  const preparedAddresses = await Promise.all(
    recipientAddresses.map(async recipientAddress => {
      const rawAddress = recipientAddress.address.trim()
      if (!rawAddress) {
        return null
      }

      let normalizedAddress = rawAddress
      if (
        recipientAddress.chainType === 'EVM' &&
        isLikelyEnsName(normalizedAddress)
      ) {
        const resolvedAddress = await resolveEnsAddress(normalizedAddress)
        if (!resolvedAddress) {
          errors[recipientAddress.id] =
            'ENS name could not be resolved on Ethereum mainnet'
          return null
        }

        normalizedAddress = resolvedAddress
        resolvedAddresses[recipientAddress.id] = resolvedAddress
      }

      return {
        clientId: recipientAddress.id,
        address: normalizedAddress,
        chainType: recipientAddress.chainType,
        memo:
          recipientAddress.chainType === 'STELLAR'
            ? recipientAddress.memo?.trim() || undefined
            : undefined,
      }
    }),
  )

  const addresses = preparedAddresses.filter(
    (
      address,
    ): address is {
      clientId: string
      address: string
      chainType: CreateProjectRecipientAddress['chainType']
      memo: string | undefined
    } => address !== null,
  )

  if (!addresses.length) {
    return { resolvedAddresses, errors }
  }

  try {
    const response = await graphQLClient.request<{
      validateCreateProjectRecipientAddresses: Array<{
        clientId: string
        isValid: boolean
        error?: string | null
      }>
    }>(recipientAddressesValidationQuery, {
      addresses,
    })

    for (const result of response.validateCreateProjectRecipientAddresses) {
      if (!result.isValid && result.error) {
        errors[result.clientId] = result.error
      }
    }
  } catch (error) {
    console.error('Recipient address batch pre-validation failed:', error)
  }

  return { resolvedAddresses, errors }
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
