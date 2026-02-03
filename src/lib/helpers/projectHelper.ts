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
 * Get the active rounds adn roudns that begin date match the current date for a project
 * Sort the rounds by begin date
 *
 * @param project - The project to get the active rounds for
 * @returns The active rounds for the project
 */
export const getProjectActiveRounds = (project: ProjectEntity) => {
  const currentDate = new Date()
  return project.projectQfRounds
    ?.filter(pqr => pqr.qfRound?.isActive)
    ?.filter(pqr => {
      if (pqr.qfRound?.beginDate) {
        return (
          new Date(pqr.qfRound.beginDate).getTime() <= currentDate.getTime()
        )
      }
      return false
    })
    .sort((a, b) => {
      if (a.qfRound?.beginDate && b.qfRound?.beginDate) {
        return (
          new Date(a.qfRound.beginDate).getTime() -
          new Date(b.qfRound.beginDate).getTime()
        )
      }
      return 0
    })
}
