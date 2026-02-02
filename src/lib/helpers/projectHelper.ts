import { type ProjectEntity } from '@/lib/graphql/generated/graphql'

export const calculateEstimatedMatchingWithDonationAmount = (
  donationAmountInUSD: number,
  projectDonationsSqrtRootSum?: number,
  allProjectsSum?: number,
  matchingPool?: number,
  matchingCapPercentage?: number,
) => {
  if (!matchingCapPercentage || !matchingPool || !donationAmountInUSD) return 0
  const _projectDonationsSqrtRootSum = projectDonationsSqrtRootSum || 0
  const _allProjectsSum = allProjectsSum || 0
  const beforeNewDonationPow = Math.pow(_projectDonationsSqrtRootSum, 2)
  const afterNewDonationPow = Math.pow(
    _projectDonationsSqrtRootSum + Math.sqrt(donationAmountInUSD),
    2,
  )

  const newEstimateMatching = Math.min(
    (afterNewDonationPow /
      (_allProjectsSum + afterNewDonationPow - beforeNewDonationPow)) *
      matchingPool,
    matchingPool * matchingCapPercentage,
  )
  return (
    newEstimateMatching *
    ((afterNewDonationPow - beforeNewDonationPow) / afterNewDonationPow)
  )
}

/**
 * Get the active rounds for a project
 *
 * @param project - The project to get the active rounds for
 * @returns The active rounds for the project
 */
export const getProjectActiveRounds = (project: ProjectEntity) => {
  return project.projectQfRounds?.filter(pqr => pqr.qfRound?.isActive)
}
