interface QFStatsProps {
  matchingPool: number
  totalDonations: number
  donationsCount: number
  beginDate: string
  endDate: string
}

export function QFStats({
  matchingPool,
  totalDonations,
  donationsCount,
  beginDate,
  endDate,
}: QFStatsProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))

  return (
    <div className="max-w-7xl mx-auto px-6 mt-4 mb-8">
      <div className="bg-white rounded-xl border border-[#ebecf2] p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-[#82899a] mb-1">Matching Pool</p>
            <p className="text-2xl font-bold text-[#1f2333]">
              {formatCurrency(matchingPool)}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#82899a] mb-1">Donations</p>
            <p className="text-2xl font-bold text-[#1f2333]">
              {formatCurrency(totalDonations)}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#82899a] mb-1"># of Donations</p>
            <p className="text-2xl font-bold text-[#1f2333]">
              {donationsCount}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[#1f2333]">
              {formatDate(beginDate)} - {formatDate(endDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
