interface QFDonationStatsProps {
  project: {
    totalDonations: number
    countUniqueDonors?: number | null
    addresses: Array<{
      address: string
      chainType: string
      networkId: number
    }>
  }
}

export function QFDonationStats({ project }: QFDonationStatsProps) {
  const getNetworkIcon = (chainType: string) => {
    switch (chainType) {
      case 'EVM':
        return '⚡'
      case 'SOLANA':
        return '◎'
      default:
        return '🔗'
    }
  }

  const getNetworkColor = (chainType: string) => {
    switch (chainType) {
      case 'EVM':
        return 'text-purple-500'
      case 'SOLANA':
        return 'text-green-500'
      default:
        return 'text-blue-500'
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-gray-900">
        Project Donations
      </h3>

      <div className="mb-2">
        <p className="text-4xl font-bold text-gray-900">
          ${project.totalDonations.toLocaleString()}
        </p>
      </div>

      <p className="mb-8 text-sm text-gray-500">
        Raised from{' '}
        <span className="font-bold text-gray-900">
          {project.countUniqueDonors || 0}
        </span>{' '}
        contributors
      </p>

      <div>
        <p className="mb-3 text-sm text-gray-500">Project recipient address</p>
        <div className="flex flex-col gap-2">
          {project.addresses.map((address, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
            >
              <span
                className="truncate text-xs text-gray-500 font-mono"
                title={address.address}
              >
                {address.address.slice(0, 6)}...{address.address.slice(-4)}
              </span>
              <div className="flex items-center gap-2">
                <span className={getNetworkColor(address.chainType)}>
                  {getNetworkIcon(address.chainType)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
