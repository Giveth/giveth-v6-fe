import { useQfRoundStats } from '@/hooks/useQfRoundStats'

interface QFStatsProps {
  round?: any
  isLoading?: boolean
}

export function QFStats({ round, isLoading }: QFStatsProps) {
  const { data: statsData, isLoading: statsLoading } = useQfRoundStats(
    round?.id ? Number(round.id) : undefined,
  )

  const stats = statsData?.qfRoundStats

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const matchingPool = round?.allocatedFundUSD
    ? `$${round.allocatedFundUSD.toLocaleString()}`
    : 'TBD'
  const donations = stats?.totalDonationsUsd
    ? `$${Math.round(stats.totalDonationsUsd).toLocaleString()}`
    : '$0'
  const donationsCount = stats?.donationsCount?.toLocaleString() || '0'

  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div className="flex flex-1 flex-wrap gap-8 sm:gap-16">
        <div>
          <p className="text-sm font-medium text-gray-500">Matching Pool</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {isLoading || statsLoading ? '...' : matchingPool}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Donations</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {isLoading || statsLoading ? '...' : donations}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500"># of Donations</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {isLoading || statsLoading ? '...' : donationsCount}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-xl font-bold text-gray-900">
          {isLoading
            ? 'Loading...'
            : `${formatDate(round?.beginDate)} - ${formatDate(round?.endDate)}`}
        </p>
      </div>
    </div>
  )
}
