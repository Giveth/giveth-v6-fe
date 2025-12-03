const WALLETS = [
  {
    address: '0x712852005C0423db1511c59D20283092E4aB3a2A',
    icon: '⚡',
    color: 'text-purple-500',
  }, // Placeholder icons
  {
    address: '0x712852005C0423db1511c59D20283092E4aB3a2A',
    icon: '🟢',
    color: 'text-green-500',
  },
  {
    address: '0x712852005C0423db1511c59D20283092E4aB3a2A',
    icon: '🔗',
    color: 'text-blue-500',
  },
  {
    address: '0x712852005C0423db1511c59D20283092E4aB3a2A',
    icon: '🔴',
    color: 'text-red-500',
  },
]

export function QFDonationStats() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-gray-900">
        QF round 3 donations
      </h3>

      <div className="mb-2">
        <p className="text-4xl font-bold text-gray-900">$854.45</p>
      </div>

      <p className="mb-8 text-sm text-gray-500">
        Raised from <span className="font-bold text-gray-900">89</span>{' '}
        contributors
      </p>

      <div>
        <p className="mb-3 text-sm text-gray-500">Project recipient address</p>
        <div className="flex flex-col gap-2">
          {WALLETS.map((wallet, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
            >
              <span className="truncate text-xs text-gray-500 font-mono">
                {wallet.address}
              </span>
              <div className="flex items-center gap-2">
                <span className={wallet.color}>{wallet.icon}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
