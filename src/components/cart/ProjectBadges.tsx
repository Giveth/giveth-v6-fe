import { useEffect, useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { GivBacksBadge } from '@/components/badges/GivBacksBadge'
import { useCart, type ProjectCartItem } from '@/context/CartContext'
import { useProjectEstimatedMatching } from '@/hooks/projectHooks'
import { GIVBACKS_DONATION_QUALIFICATION_VALUE_USD } from '@/lib/constants/app-main'
import { type ActiveQfRoundsQuery } from '@/lib/graphql/generated/graphql'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { calculateEstimatedMatchingWithDonationAmount } from '@/lib/helpers/projectHelper'

export const ProjectBadges = ({
  project,
  roundData,
}: {
  project: ProjectCartItem
  roundData: ActiveQfRoundsQuery['activeQfRounds'][0]
}) => {
  const { updateProjectDonation } = useCart()

  const donationAmountInUSD =
    Number(project.donationAmount ?? 0) *
    Number(project.selectedToken?.priceInUSD ?? 0)

  const [projectMatchingData, setProjectMatchingData] = useState({
    allProjectsSum: 0,
    matchingPool: 0,
    projectDonationsSqrtRootSum: 0,
  })

  // Get user wallet address
  const account = useActiveAccount()

  // FIRST check GIVBacks eligibility
  // Project needs to be GIVbacks eligible and the token needs to be GIVbacks eligible
  // and the donation amount needs to be greater than the GIVBACKS_DONATION_QUALIFICATION_VALUE_USD
  const isTokenGivbacksEligible = project?.selectedToken?.isGivbackEligible
  const isProjectGivbacks = project?.isGivbackEligible
  const isProjectGivbacksEligible =
    isTokenGivbacksEligible &&
    isProjectGivbacks &&
    donationAmountInUSD >= GIVBACKS_DONATION_QUALIFICATION_VALUE_USD

  const isProjectGivbacksEligibleColor = isProjectGivbacksEligible
    ? 'green'
    : 'gray'

  const isProjectGivbacksEligibleMessage = isProjectGivbacksEligible
    ? 'GIVbacks eligible'
    : 'makes you eligible for GIVbacks'

  // Second check round matching for the project
  const projectChainId = project.chainId
  const isOnQFEligibleNetworks = roundData?.eligibleNetworks?.includes(
    projectChainId || 0,
  )

  const isDonationMatched =
    !!roundData &&
    isTokenGivbacksEligible &&
    isOnQFEligibleNetworks &&
    donationAmountInUSD >= (roundData?.minimumValidUsdValue || 0)

  const isDonationMatchedColor = isDonationMatched ? 'green' : 'gray'
  const isDonationMatchedMessage = isDonationMatched
    ? 'Donation will be matched'
    : 'unlocks matching funds'

  // Get estimated matching for the project
  const { data: estimatedMatching, isLoading: isEstimatedMatchingLoading } =
    useProjectEstimatedMatching({
      donationAmount: Number(project.donationAmount ?? 0),
      donorAddress: account?.address ?? '', // ensure string
      projectId: Number(project.id), // ensure number
      qfRoundId: Number(roundData?.id), // ensure number
    })

  useEffect(() => {
    const em = estimatedMatching?.estimatedMatching
    if (em && !isEstimatedMatchingLoading) {
      setProjectMatchingData({
        allProjectsSum: em.allProjectsSqrtSum,
        matchingPool: em.matchingPool,
        projectDonationsSqrtRootSum: em.projectDonationsSqrtSum,
      })
    }
  }, [estimatedMatching, isEstimatedMatchingLoading])

  // Get the maximum reward, allocated fund USD, and allocated fund USD preferred from the round data
  const maximumReward = roundData?.maximumReward ?? 0
  const allocatedFundUSD = roundData?.allocatedFundUSD ?? 0
  const allocatedFundUSDPreferred =
    roundData?.allocatedFundUSDPreferred ?? false

  const esMatching = calculateEstimatedMatchingWithDonationAmount(
    donationAmountInUSD,
    projectMatchingData.projectDonationsSqrtRootSum,
    projectMatchingData.allProjectsSum,
    allocatedFundUSDPreferred
      ? Number(allocatedFundUSD)
      : projectMatchingData.matchingPool,
    maximumReward,
  )

  // Update the project donation with the estimated matching value
  useEffect(() => {
    if (esMatching && !isEstimatedMatchingLoading) {
      if (project.roundId == null) return
      updateProjectDonation(
        project.roundId,
        project.id,
        project.donationAmount ?? '0',
        project.selectedToken?.symbol ?? '',
        project.selectedToken?.address ?? '',
        project.chainId ?? 0,
        esMatching,
      )
    }
  }, [esMatching, isEstimatedMatchingLoading, project.roundId, project.id])

  return (
    <>
      <GivBacksBadge
        key={0}
        type="eligible"
        color={isProjectGivbacksEligibleColor}
        amountPrefix={
          isProjectGivbacksEligible
            ? undefined
            : '$' + GIVBACKS_DONATION_QUALIFICATION_VALUE_USD.toString()
        }
        label={isProjectGivbacksEligibleMessage}
      />

      {!!roundData && (
        <GivBacksBadge
          key={1}
          type="matching"
          color={isDonationMatchedColor}
          amountPrefix={
            isDonationMatched
              ? (roundData?.allocatedFundUSDPreferred ? '$' : '') +
                formatNumber(esMatching ?? 0) +
                ' ' +
                (roundData?.allocatedTokenSymbol &&
                !roundData?.allocatedFundUSDPreferred
                  ? roundData?.allocatedTokenSymbol
                  : '')
              : '$' + roundData?.minimumValidUsdValue.toString()
          }
          label={isDonationMatchedMessage}
        />
      )}
    </>
  )
}
