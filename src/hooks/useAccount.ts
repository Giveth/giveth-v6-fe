'use client'

import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { env } from '@/lib/env'
import { createGraphQLClient } from '@/lib/graphql/client'
import type {
  DonationEntity,
  PaginatedDonationsEntity,
  PaginatedProjectsEntity,
  ProjectEntity,
  UserEntity,
  UserWalletEntity,
} from '@/lib/graphql/generated/graphql'
import {
  confirmEmailVerificationMutation,
  requestEmailVerificationMutation,
  uploadAvatarMutation,
} from '@/lib/graphql/mutations'
import {
  myDonationsQuery,
  myProjectsQuery,
  userProfileQuery,
  userStatsQuery,
} from '@/lib/graphql/queries'

const createAuthorizedClient = (token?: string) =>
  createGraphQLClient(
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  )

export const useUserStats = (userId?: number, token?: string) =>
  useQuery({
    queryKey: ['userStats', userId, token],
    queryFn: async () => {
      const client = createAuthorizedClient(token)
      return client.request(userStatsQuery, { id: userId ?? 0 })
    },
    enabled: !!token && !!userId,
  })

export type MyProject = Pick<
  ProjectEntity,
  | 'id'
  | 'title'
  | 'slug'
  | 'createdAt'
  | 'reviewStatus'
  | 'isGivbacksEligible'
  | 'vouched'
  | 'totalDonations'
>

type MyProjectsResponse = {
  myProjects: Pick<PaginatedProjectsEntity, 'total'> & {
    projects: MyProject[]
  }
}

export const useMyProjects = (
  token?: string,
  params?: { skip?: number; take?: number; enabled?: boolean },
) =>
  useQuery({
    queryKey: ['myProjects', params?.skip ?? 0, params?.take ?? 10, token],
    queryFn: async () => {
      const client = createAuthorizedClient(token)
      return client.request<MyProjectsResponse>(myProjectsQuery, {
        skip: params?.skip ?? 0,
        take: params?.take ?? 10,
      })
    },
    enabled: !!token && (params?.enabled ?? true),
  })

export type MyDonation = Pick<
  DonationEntity,
  | 'id'
  | 'amount'
  | 'valueUsd'
  | 'currency'
  | 'status'
  | 'transactionId'
  | 'transactionNetworkId'
  | 'createdAt'
> & {
  project?: Pick<ProjectEntity, 'id' | 'title' | 'slug'> | null
}

type MyDonationsResponse = {
  myDonations: Pick<PaginatedDonationsEntity, 'total'> & {
    donations: MyDonation[]
  }
}

export const useMyDonations = (
  token?: string,
  params?: { skip?: number; take?: number; enabled?: boolean },
) =>
  useQuery<MyDonationsResponse>({
    queryKey: ['myDonations', params?.skip ?? 0, params?.take ?? 20, token],
    queryFn: async () => {
      const client = createAuthorizedClient(token)
      return client.request<MyDonationsResponse>(myDonationsQuery, {
        skip: params?.skip ?? 0,
        take: params?.take ?? 20,
      })
    },
    enabled: !!token && (params?.enabled ?? true),
    placeholderData: keepPreviousData,
  })

export type UserProfile = Pick<
  UserEntity,
  | 'id'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'name'
  | 'avatar'
  | 'url'
  | 'isEmailVerified'
> & {
  location?: string | null
  twitterName?: string | null
  telegramName?: string | null
  wallets: Array<
    Pick<UserWalletEntity, 'id' | 'address' | 'isPrimary' | 'chainType'>
  >
}

export const useProfile = (token?: string) =>
  useQuery({
    queryKey: ['profile', token],
    queryFn: async () => {
      const client = createAuthorizedClient(token)
      return client.request<{ me: UserProfile | null }>(userProfileQuery)
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Use cache if available, don't refetch on mount
    retry: (failureCount, error) => {
      // Don't retry on auth errors (401, 403)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status
        if (status === 401 || status === 403) return false
      }
      return failureCount < 2 // Retry up to 2 times for other errors
    },
  })

// type UpdateProfileInput = Partial<
//   Pick<
//     UserProfile,
//     | 'firstName'
//     | 'lastName'
//     | 'name'
//     | 'avatar'
//     | 'url'
//     | 'location'
//     | 'twitterName'
//     | 'telegramName'
//   >
// >

// export const useUpdateProfile = (token?: string) =>
//   useMutation({
//     mutationFn: async (input: UpdateProfileInput) => {
//       const client = createAuthorizedClient(token)
//       return client.request<{ updateUser: UserProfile }>(
//         updateProfileMutation,
//         { input },
//       )
//     },
//   })

export const useRequestEmailVerification = (token?: string) =>
  useMutation({
    mutationFn: async (email: string) => {
      const client = createAuthorizedClient(token)
      return client.request<{
        requestEmailVerification: {
          status: string
          email: string
          expiresAt: string
        }
      }>(requestEmailVerificationMutation, {
        input: { email },
      })
    },
  })

export const useConfirmEmailVerification = (token?: string) =>
  useMutation({
    mutationFn: async (params: { email: string; verifyCode: string }) => {
      const client = createAuthorizedClient(token)
      return client.request<{
        confirmEmailVerification: UserProfile
      }>(confirmEmailVerificationMutation, {
        input: {
          email: params.email,
          verifyCode: params.verifyCode,
        },
      })
    },
  })

const uploadAvatarRequest = async (params: {
  file: File
  token?: string
  endpoint: string
}) => {
  const form = new FormData()
  form.append(
    'operations',
    JSON.stringify({
      query: uploadAvatarMutation,
      variables: { file: null },
    }),
  )
  form.append('map', JSON.stringify({ '0': ['variables.file'] }))
  form.append('0', params.file)

  const res = await fetch(params.endpoint, {
    method: 'POST',
    headers: {
      ...(params.token ? { Authorization: `Bearer ${params.token}` } : {}),
    },
    body: form,
  })
  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(json.errors[0].message || 'Upload failed')
  }
  return json.data?.createAvatarUploadUrl as string
}

export const useUploadAvatar = (token?: string) =>
  useMutation({
    mutationFn: async (file: File) =>
      uploadAvatarRequest({
        file,
        token,
        endpoint: env.GRAPHQL_ENDPOINT,
      }),
  })
