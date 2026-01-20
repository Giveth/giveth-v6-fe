import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import {
  type DonationEntity,
  DonationSortField,
  type PaginatedDonationsEntity,
  SortDirection,
} from '@/lib/graphql/generated/graphql'
import { donationsByUserQuery } from '@/lib/graphql/queries'

export const useUserDonations = (
  userId?: number,
  params?: {
    skip?: number
    take?: number
    enabled?: boolean
    orderBy?: DonationSortField
    orderDirection?: SortDirection
  },
) =>
  useQuery<UserDonationsResponse>({
    queryKey: [
      'donationsByUser',
      params?.skip ?? 0,
      params?.take ?? 20,
      params?.orderBy ?? DonationSortField.CreatedAt,
      params?.orderDirection ?? SortDirection.Desc,
      userId,
    ],
    queryFn: async () => {
      const client = graphQLClient
      return client.request<UserDonationsResponse>(donationsByUserQuery, {
        userId: userId ?? 0,
        skip: params?.skip ?? 0,
        take: params?.take ?? 20,
        orderBy: params?.orderBy ?? DonationSortField.CreatedAt,
        orderDirection: params?.orderDirection ?? SortDirection.Desc,
      })
    },
    enabled: !!userId && (params?.enabled ?? true),
    placeholderData: keepPreviousData,
  })

type UserDonationsResponse = {
  donationsByUser: Pick<PaginatedDonationsEntity, 'total'> & {
    donations: DonationEntity[]
  }
}
