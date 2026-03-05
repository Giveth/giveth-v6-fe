import { formatNumber } from '@/lib/helpers/cartHelper'

interface AllTimeDonationsProps {
  project: {
    totalDonations: number
    countUniqueDonors?: number | null | undefined
  }
}

export function AllTimeDonations({ project }: AllTimeDonationsProps) {
  return (
    <div className="h-full flex flex-col bg-giv-neutral-200 rounded-xl border-4 border-white p-4 gap-4">
      <h3 className="text-base font-semibold text-giv-neutral-800">
        All Time Donations
      </h3>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-2xl font-bold tracking-tight text-giv-deep-900">
            $
            {formatNumber(project.totalDonations, {
              minDecimals: 2,
              maxDecimals: 2,
            })}
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-giv-neutral-700 mt-1">
            Total raised
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-2xl font-bold tracking-tight text-giv-deep-900">
            {project.countUniqueDonors || 0}
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-giv-neutral-700 mt-1">
            All contributors
          </p>
        </div>
      </div>
    </div>
  )
}
