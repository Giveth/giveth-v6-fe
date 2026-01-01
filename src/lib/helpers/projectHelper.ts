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
