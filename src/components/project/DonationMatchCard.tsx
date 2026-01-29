import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'
import { useProjectEstimatedMatching } from '@/hooks/projectHooks'
import { useQfRoundBySlug } from '@/hooks/useQfRoundBySlug'
import { useQfRoundStats } from '@/hooks/useQfRoundStats'
import type { QfRoundEntity } from '@/lib/graphql/generated/graphql'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { roundAmount } from '@/lib/helpers/numbersHelper'
import { calculateEstimatedMatchingWithDonationAmount } from '@/lib/helpers/projectHelper'

export const DonationMatchCard = ({
  amount,
  project,
  roundData,
}: {
  amount: number
  project: { id: string }
  roundData: QfRoundEntity
}) => {
  const { data: fullRoundData } = useQfRoundBySlug(roundData?.slug)

  const { data: qfRoundStats } = useQfRoundStats(Number(roundData?.id))

  // Get user wallet address
  const account = useActiveAccount()

  const [projectMatchingData, setProjectMatchingData] = useState({
    allProjectsSum: 0,
    matchingPool: 0,
    projectDonationsSqrtRootSum: 0,
  })
  // Get estimated matching for the project
  const { data: estimatedMatching, isLoading: isEstimatedMatchingLoading } =
    useProjectEstimatedMatching({
      donationAmount: Number(amount ?? 0),
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

  const esMatching = calculateEstimatedMatchingWithDonationAmount(
    amount,
    projectMatchingData.projectDonationsSqrtRootSum,
    projectMatchingData.allProjectsSum,
    (fullRoundData?.qfRoundBySlug?.allocatedFundUSDPreferred ?? false)
      ? Number(fullRoundData?.qfRoundBySlug?.allocatedFundUSD ?? 0)
      : projectMatchingData.matchingPool,
    fullRoundData?.qfRoundBySlug?.maximumReward ?? 0,
  )

  return (
    <div
      key={amount}
      className="grid grid-cols-[1fr_auto_1fr] mb-1 items-center text-xs font-medium"
    >
      <span className="text-giv-gray-800">{amount} USDC</span>

      <span className="text-giv-jade-500 text-lg">
        <ArrowRight className="w-4 h-4" />
      </span>

      {qfRoundStats && qfRoundStats.qfRoundStats.uniqueDonors < 10 && (
        <span className="text-giv-jade-500 text-right font-medium">TBD</span>
      )}
      {qfRoundStats && qfRoundStats.qfRoundStats.uniqueDonors >= 10 && (
        <span className="text-giv-jade-500 text-right font-medium">
          {fullRoundData?.qfRoundBySlug?.allocatedFundUSDPreferred ? '$' : ''}
          {formatNumber(roundAmount(esMatching))}{' '}
          {fullRoundData?.qfRoundBySlug?.allocatedTokenSymbol &&
          !fullRoundData?.qfRoundBySlug?.allocatedFundUSDPreferred
            ? fullRoundData?.qfRoundBySlug?.allocatedTokenSymbol
            : ''}
        </span>
      )}
    </div>
  )
}
