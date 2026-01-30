import { formatNumber } from '@/lib/helpers/cartHelper'

interface AllTimeDonationsProps {
  project: {
    totalDonations: number
    countUniqueDonors?: number | null | undefined
  }
}

export function AllTimeDonations({ project }: AllTimeDonationsProps) {
  return (
    <div className="h-full flex flex-col justify-between bg-giv-neutral-200 rounded-xl border-4 border-white p-4">
      <h3 className="text-base font-semibold text-giv-neutral-800 mb-4">
        All Time Donations
      </h3>
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-giv-neutral-800 ml-2">
          $
          {formatNumber(project.totalDonations, {
            minDecimals: 2,
            maxDecimals: 2,
          })}
        </span>
        <div className="text-right">
          <span className="text-xs font-bold text-giv-neutral-900">
            {project.countUniqueDonors || 0}
          </span>
          <p className="text-sm font-medium text-giv-neutral-700">
            All contributors
          </p>
        </div>
      </div>
    </div>
  )
}
