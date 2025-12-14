interface AllTimeDonationsProps {
  project: {
    totalDonations: number
    countUniqueDonors?: number | null | undefined
  }
}

export function AllTimeDonations({ project }: AllTimeDonationsProps) {
  return (
    <div className="bg-white rounded-xl border border-[#ebecf2] p-6">
      <h3 className="text-sm font-medium text-[#82899a] mb-3">
        All Time Donations
      </h3>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold text-[#1f2333]">
          ${project.totalDonations.toFixed(2)}
        </span>
        <div className="text-right">
          <span className="text-xl font-bold text-[#1f2333]">
            {project.countUniqueDonors || 0}
          </span>
          <p className="text-xs text-[#82899a]">contributors</p>
        </div>
      </div>
    </div>
  )
}
