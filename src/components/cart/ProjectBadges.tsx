import { GivBacksBadge } from '@/components/badges/GivBacksBadge'
import { type ProjectCartItem } from '@/context/CartContext'
import { GIVBACKS_DONATION_QUALIFICATION_VALUE_USD } from '@/lib/constants/app-main'
import { type ActiveQfRoundsQuery } from '@/lib/graphql/generated/graphql'

export const ProjectBadges = ({
  project,
  roundData,
}: {
  project: ProjectCartItem
  roundData: ActiveQfRoundsQuery['activeQfRounds'][0]
}) => {
  const donationAmountInUSD =
    Number(project.donationAmount ?? 0) *
    Number(project.selectedToken?.priceInUSD ?? 0)

  console.log('project', project)

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

  // const isDonationMatched =
  // !!selectedQFRound &&
  // isOnQFEligibleNetworks &&
  // donationUsdValue >= (selectedQFRound?.minimumValidUsdValue || 0);
  //
  //
  //
  // TODO: Check project matching eligibility"!!!!"
  // HERE IS ONLY FOR SHOWING THE BADGE, NOT FOR THE LOGIC
  // const { isGivbackEligible } = project || {}
  // const isTokenGivbacksEligible = token?.isGivbackEligible
  // const isProjectGivbacksEligible = !!isGivbackEligible

  // const donationUsdValue =
  //   (tokenPrice || 0) *
  //   (truncateToDecimalPlaces(formatUnits(amount, decimals), decimals) || 0)

  // const isGivbacksEligible =
  //   isTokenGivbacksEligible &&
  //   isProjectGivbacksEligible &&
  //   donationUsdValue >= GIVBACKS_DONATION_QUALIFICATION_VALUE_USD

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
              ? undefined
              : '$' + roundData?.minimumValidUsdValue.toString()
          }
          label={isDonationMatchedMessage}
        />
      )}
    </>
  )
}
