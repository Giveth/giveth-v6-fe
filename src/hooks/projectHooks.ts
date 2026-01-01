import { useQuery } from '@tanstack/react-query'
import { graphQLClient } from '@/lib/graphql/client'
import { estimatedMatchingQuery } from '@/lib/graphql/queries'

/**
 * Hook to get the estimated matching for a project
 *
 * @param donationAmount - The amount of the donation
 * @param donorAddress - The address of the donor
 * @param projectId - The id of the project
 * @param qfRoundId - The id of the qf round
 *
 * @returns The estimated matching for the project
 * @example
 *
 * const { data, isLoading, error } = useProjectEstimatedMatching({
 *   donationAmount: 100,
 *   donorAddress: '0x1234567890123456789012345678901234567890',
 *   projectId: 1,
 *   qfRoundId: 1,
 * })
 */
export function useProjectEstimatedMatching({
  donationAmount,
  donorAddress,
  projectId,
  qfRoundId,
}: {
  donationAmount: number
  donorAddress: string
  projectId: number
  qfRoundId: number
}) {
  return useQuery({
    queryKey: [
      'projectEstimatedMatching',
      donationAmount,
      donorAddress,
      projectId,
      qfRoundId,
    ],
    queryFn: () =>
      graphQLClient.request(estimatedMatchingQuery, {
        donationAmount,
        donorAddress,
        projectId,
        qfRoundId,
      }),
  })
}
