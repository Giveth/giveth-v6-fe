interface AllTimeDonationsProps {
  project: {
    totalDonations: number
    countUniqueDonors?: number | null | undefined
  }
}

export function AllTimeDonations({ project }: AllTimeDonationsProps) {
  return (
    <div className="h-full flex flex-col justify-between bg-giv-gray-200 rounded-xl border-4 border-white p-4">
      <h3 className="text-base font-medium text-giv-gray-800 mb-4">
        All Time Donations
      </h3>
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-giv-gray-800 ml-2">
          ${project.totalDonations.toFixed(2)}
        </span>
        <div className="text-left">
          <span className="text-sm font-medium text-giv-gray-900">
            {project.countUniqueDonors || 0}
          </span>
          <p className="text-sm text-giv-gray-700">contributors</p>
        </div>
      </div>
    </div>
  )
}
