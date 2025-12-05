import { useState } from 'react'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { useProjectDonations } from '@/hooks/useProject'

interface DonationTableProps {
  projectId: number
}

export function DonationTable({ projectId }: DonationTableProps) {
  const [page, setPage] = useState(0)
  const pageSize = 10
  const { data, isLoading } = useProjectDonations(
    projectId,
    page * pageSize,
    pageSize,
  )

  const donations = data?.donationsByProject.donations || []
  const totalDonations = data?.donationsByProject.total || 0
  const totalPages = Math.ceil(totalDonations / pageSize)

  const getNetworkName = (id: number) => {
    switch (id) {
      case 1:
        return 'Mainnet'
      case 10:
        return 'Optimism'
      case 100:
        return 'Gnosis'
      default:
        return 'Unknown'
    }
  }

  const getNetworkColor = (id: number) => {
    switch (id) {
      case 1:
        return 'bg-blue-500'
      case 10:
        return 'bg-red-500'
      case 100:
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (isLoading) {
    return <div className="mt-8 text-center">Loading donations...</div>
  }

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
            {donations.map(donation => (
              <tr key={donation.id} className="group">
                <td className="py-4 text-sm text-gray-500">
                  {new Date(donation.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs overflow-hidden">
                      {donation.user?.avatar ? (
                        <img
                          src={donation.user.avatar}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        '👤'
                      )}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {donation.user?.name ||
                        donation.user?.firstName ||
                        'Anonymous'}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${getNetworkColor(donation.transactionNetworkId)}`}
                    />
                    <span className="text-sm text-gray-700">
                      {getNetworkName(donation.transactionNetworkId)}
                    </span>
                  </div>
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                    {donation.amount} {donation.currency}
                    <ExternalLinkIcon className="h-3 w-3 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </td>
                <td className="py-4 text-right text-sm text-gray-500">
                  ${donation.valueUsd?.toFixed(2)}
                </td>
              </tr>
            ))}
            {donations.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No donations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <button
            className="px-2 py-1 hover:text-gray-900 disabled:opacity-50"
            disabled={page === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            &lt; Prev
          </button>
          <span className="px-2 py-1">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="px-2 py-1 hover:text-gray-900 disabled:opacity-50"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          >
            Next &gt;
          </button>
        </div>
      )}
    </div>
  )
}
