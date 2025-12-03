import { ExternalLinkIcon } from '@radix-ui/react-icons'

const DONATIONS = [
  {
    id: 1,
    date: 'Jan 7, 2022',
    donor: 'Carlos Quintero',
    network: 'Mainnet',
    amount: '897,943.84 GIV',
    usdValue: '$9999.99',
    avatar: '🦁',
  },
  {
    id: 2,
    date: 'Jan 7, 2022',
    donor: 'Anonymous',
    network: 'Optimism',
    amount: '54 OP',
    usdValue: '$173.00',
    avatar: '👤',
  },
  {
    id: 3,
    date: 'Jan 7, 2022',
    donor: 'Lauren Luz',
    network: 'Mainnet',
    amount: '109 DAI',
    usdValue: '$109.00',
    avatar: '🦄',
  },
  {
    id: 4,
    date: 'Jan 7, 2022',
    donor: 'Vitalik Buterin',
    network: 'Optimism',
    amount: '76 DAI',
    usdValue: '$84.00',
    avatar: '🦊',
  },
  {
    id: 5,
    date: 'Jan 7, 2022',
    donor: 'Griff Green',
    network: 'Optimism',
    amount: '63 DAI',
    usdValue: '$73.00',
    avatar: '🧙‍♂️',
  },
  {
    id: 6,
    date: 'Jan 7, 2022',
    donor: 'Keanu Reeves',
    network: 'Optimism',
    amount: '0.28368387 WETH',
    usdValue: '$811.69',
    avatar: '😎',
  },
  {
    id: 7,
    date: 'Jan 7, 2022',
    donor: 'Elon Musk',
    network: 'Gnosis',
    amount: '7609.7 xDAI',
    usdValue: '$550',
    avatar: '🚀',
  },
  {
    id: 8,
    date: 'Jan 7, 2022',
    donor: 'Jane Doe',
    network: 'Optimism',
    amount: '120 GIV',
    usdValue: '$92',
    avatar: '👩',
  },
]

export function DonationTable() {
  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="relative">
          <select className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-4 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5326ec]">
            <option>Showing all donations</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
              <th className="pb-3 font-medium">Donated at ↓</th>
              <th className="pb-3 font-medium">Donor</th>
              <th className="pb-3 font-medium">Network</th>
              <th className="pb-3 font-medium">Amount ⇅</th>
              <th className="pb-3 font-medium text-right">USD Value ↗</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {DONATIONS.map(donation => (
              <tr key={donation.id} className="group">
                <td className="py-4 text-sm text-gray-500">{donation.date}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs">
                      {donation.avatar}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {donation.donor}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${donation.network === 'Mainnet' ? 'bg-blue-500' : donation.network === 'Optimism' ? 'bg-red-500' : 'bg-green-500'}`}
                    />
                    <span className="text-sm text-gray-700">
                      {donation.network}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    {donation.amount}
                    <ExternalLinkIcon className="h-3 w-3 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </td>
                <td className="py-4 text-right text-sm text-gray-500">
                  {donation.usdValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
        <button
          className="px-2 py-1 hover:text-gray-900 disabled:opacity-50"
          disabled
        >
          &lt; Prev
        </button>
        <button className="rounded bg-gray-100 px-2 py-1 font-medium text-gray-900">
          1
        </button>
        <button className="px-2 py-1 hover:text-gray-900">2</button>
        <button className="px-2 py-1 hover:text-gray-900">3</button>
        <span className="px-1">...</span>
        <button className="px-2 py-1 hover:text-gray-900">8</button>
        <button className="px-2 py-1 hover:text-gray-900">9</button>
        <button className="px-2 py-1 hover:text-gray-900">Next &gt;</button>
      </div>
    </div>
  )
}
