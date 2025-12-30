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

  // First check round matching eligibility
  const projectChainId = project.chainId
  const isOnQFEligibleNetworks = roundData?.eligibleNetworks?.includes(
    projectChainId || 0,
  )
  const isDonationMatched =
    !!roundData &&
    isOnQFEligibleNetworks &&
    donationAmountInUSD >= (roundData?.minimumValidUsdValue || 0)

  const isDonationMatchedColor = isDonationMatched ? 'green' : 'gray'
  const isDonationMatchedMessage = isDonationMatched
    ? 'Donation will be matched'
    : 'unlocks matching funds'

  // TODO: Check project GIVBACKS matching eligibility"!!!!"
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

  // Second check project eligibility
  const isProjectGivbacksEligible =
    donationAmountInUSD >= GIVBACKS_DONATION_QUALIFICATION_VALUE_USD

  const isProjectGivbacksEligibleColor = isProjectGivbacksEligible
    ? 'green'
    : 'gray'

  const isProjectGivbacksEligibleMessage = isProjectGivbacksEligible
    ? project.selectedToken?.symbol + ' in matching'
    : 'unlocks matching funds'

  return (
    <>
      {!!roundData && (
        <GivBacksBadge
          key={0}
          type="eligible"
          color={isDonationMatchedColor}
          amountPrefix={
            isDonationMatched
              ? undefined
              : '$' + roundData?.minimumValidUsdValue.toString()
          }
          label={isDonationMatchedMessage}
        />
      )}

      <GivBacksBadge
        key={1}
        type="matching"
        color={isProjectGivbacksEligibleColor}
        amountPrefix={
          '$' + GIVBACKS_DONATION_QUALIFICATION_VALUE_USD.toString()
        }
        label={isProjectGivbacksEligibleMessage}
      />
    </>
  )
}
