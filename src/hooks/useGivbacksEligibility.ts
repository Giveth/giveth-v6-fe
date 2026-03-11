'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSiweAuth } from '@/context/AuthContext'
import { createGraphQLClient, graphQLClient } from '@/lib/graphql/client'
import type {
  ChainType,
  GivbacksEligibilityFormEntity,
  GivbacksEligibilityUpdateInput,
} from '@/lib/graphql/generated/graphql'

const GET_CURRENT_GIVBACKS_ELIGIBILITY_FORM = `
  query GetCurrentGivbacksEligibilityForm($slug: String!) {
    getCurrentGivbacksEligibilityForm(slug: $slug) {
      id
      status
      lastStep
      emailConfirmed
      emailConfirmationSent
      isTermAndConditionsAccepted
      personalInfo {
        fullName
        walletAddress
        email
      }
      projectRegistry {
        isNonProfitOrganization
        organizationCountry
        organizationWebsite
        organizationDescription
        organizationName
        attachments
      }
      projectContacts {
        name
        url
      }
      milestones {
        foundationDate
        mission
        achievedMilestones
        achievedMilestonesProofs
        problem
        plans
        impact
      }
      managingFunds {
        description
        relatedAddresses {
          title
          address
          memo
          networkId
          chainType
        }
      }
    }
  }
`

const GET_ALLOWED_COUNTRIES = `
  query GetAllowedCountries {
    getAllowedCountries {
      name
      code
    }
  }
`

const CREATE_GIVBACKS_ELIGIBILITY_FORM = `
  mutation CreateGivbacksEligibilityForm($slug: String!) {
    createGivbacksEligibilityForm(slug: $slug) {
      id
      status
      lastStep
    }
  }
`

const UPDATE_GIVBACKS_ELIGIBILITY_FORM = `
  mutation UpdateGivbacksEligibilityForm($input: GivbacksEligibilityUpdateInput!) {
    updateGivbacksEligibilityForm(givbacksEligibilityUpdateInput: $input) {
      id
      status
      lastStep
    }
  }
`

const GIVBACKS_SEND_EMAIL_CONFIRMATION = `
  mutation GivbacksEligibilitySendEmailConfirmation($givbacksEligibilityFormId: Int!) {
    givbacksEligibilitySendEmailConfirmation(
      givbacksEligibilityFormId: $givbacksEligibilityFormId
    ) {
      id
      status
      emailConfirmationSent
    }
  }
`

type CurrentFormResponse = {
  getCurrentGivbacksEligibilityForm: (Omit<
    GivbacksEligibilityFormEntity,
    'managingFunds'
  > & {
    managingFunds?: {
      description?: string | null
      relatedAddresses?: {
        title?: string | null
        address?: string | null
        memo?: string | null
        networkId?: number | null
        chainType?: ChainType | null
      }[] | null
    } | null
  }) | null
}

type AllowedCountriesResponse = {
  getAllowedCountries: { name: string; code: string }[]
}

export const useCurrentGivbacksEligibilityForm = (slug?: string) => {
  const { token } = useSiweAuth()

  return useQuery<CurrentFormResponse>({
    queryKey: ['givbacksEligibilityForm', slug, token],
    queryFn: async () => {
      if (!slug) throw new Error('Missing slug')
      if (!token) throw new Error('Missing JWT token')

      const client = createGraphQLClient({
        headers: { Authorization: `Bearer ${token}` },
      })

      return client.request<CurrentFormResponse>({
        document: GET_CURRENT_GIVBACKS_ELIGIBILITY_FORM,
        variables: { slug },
      })
    },
    enabled: !!slug && !!token,
    retry: false,
  })
}

export const useAllowedCountries = () =>
  useQuery<AllowedCountriesResponse>({
    queryKey: ['allowedCountries'],
    queryFn: () =>
      graphQLClient.request<AllowedCountriesResponse>({
        document: GET_ALLOWED_COUNTRIES,
      }),
    staleTime: 1000 * 60 * 60,
  })

export const useCreateGivbacksEligibilityForm = () => {
  const { token } = useSiweAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (slug: string) => {
      if (!token) throw new Error('Missing JWT token')
      const client = createGraphQLClient({
        headers: { Authorization: `Bearer ${token}` },
      })
      return client.request<{ createGivbacksEligibilityForm: { id: number } }>({
        document: CREATE_GIVBACKS_ELIGIBILITY_FORM,
        variables: { slug },
      })
    },
    onSuccess: (_, slug) => {
      qc.invalidateQueries({ queryKey: ['givbacksEligibilityForm', slug] })
    },
  })
}

export const useUpdateGivbacksEligibilityForm = () => {
  const { token } = useSiweAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: GivbacksEligibilityUpdateInput) => {
      if (!token) throw new Error('Missing JWT token')
      const client = createGraphQLClient({
        headers: { Authorization: `Bearer ${token}` },
      })
      return client.request({
        document: UPDATE_GIVBACKS_ELIGIBILITY_FORM,
        variables: { input },
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['givbacksEligibilityForm'] })
    },
  })
}

export const useSendGivbacksEmailConfirmation = () => {
  const { token } = useSiweAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (givbacksEligibilityFormId: number) => {
      if (!token) throw new Error('Missing JWT token')
      const client = createGraphQLClient({
        headers: { Authorization: `Bearer ${token}` },
      })
      return client.request({
        document: GIVBACKS_SEND_EMAIL_CONFIRMATION,
        variables: { givbacksEligibilityFormId },
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['givbacksEligibilityForm'] })
    },
  })
}
