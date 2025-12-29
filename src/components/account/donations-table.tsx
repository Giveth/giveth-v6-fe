'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowUpDown, ExternalLink } from 'lucide-react'
import { useSiweAuth } from '@/context/AuthContext'
import { useMyDonations } from '@/hooks/useAccount'
import { getChainIcon, getTransactionUrl } from '@/lib/constants'

function NetworkIcon({ chainId }: { chainId: number }) {
  const { iconUrl } = getChainIcon(chainId)

  return (
    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
      <img
        src={iconUrl}
        alt="Network Icon"
        className="w-full h-full object-cover"
      />
    </div>
  )
}

const PAGE_SIZE = 15

export function DonationsTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const { token } = useSiweAuth()

  const { data, isLoading } = useMyDonations(token || undefined, {
    enabled: !!token,
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  const donations = data?.myDonations?.donations || []
  const totalDonations = data?.myDonations?.total || 0
  const totalPages = Math.ceil(totalDonations / PAGE_SIZE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading && !data) {
    return (
      <div className="p-8 text-center text-gray-500">Loading donations...</div>
    )
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  return (
    <div className="bg-white rounded-xl border border-[#ebecf2] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#ebecf2] bg-[#f7f7f9]">
              <th className="text-left px-6 py-4 text-sm font-medium text-[#82899a]">
                <button className="flex items-center gap-2 hover:text-[#5326ec]">
                  Donated at
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#82899a]">
                Project
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#82899a]">
                Status
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#82899a]">
                <button className="flex items-center gap-2 hover:text-[#5326ec]">
                  Amount
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#82899a]">
                <button className="flex items-center gap-2 hover:text-[#5326ec]">
                  USD value
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#82899a]">
                QF round
              </th>
            </tr>
          </thead>
          <tbody>
            {donations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No donations found
                </td>
              </tr>
            ) : (
              donations.map(donation => {
                const txUrl = getTransactionUrl(
                  donation.transactionNetworkId,
                  donation.transactionId,
                )

                return (
                  <tr
                    key={donation.id}
                    className="border-b border-[#ebecf2] hover:bg-[#fcfcff] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-[#1f2333]">
                      {format(new Date(donation.createdAt), 'MMM d, yyyy')}
                    </td>

                    <td className="px-6 py-4 text-sm text-[#1f2333] font-medium">
                      {donation.project?.slug ? (
                        <Link
                          href={`/project/${donation.project.slug}`}
                          className="hover:text-[#5326ec] hover:underline"
                        >
                          {donation.project.title || 'Unknown Project'}
                        </Link>
                      ) : (
                        donation.project?.title || 'Unknown Project'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#d2fffb] text-[#1b8c82]">
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <NetworkIcon chainId={donation.transactionNetworkId} />
                        <span className="text-sm font-medium text-[#1f2333]">
                          {donation.amount} {donation.currency}
                        </span>
                        {txUrl && (
                          <a
                            href={txUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-[#82899a]" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1f2333]">
                      ${donation.valueUsd?.toFixed(2) ?? '0.00'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#f7f7f9] text-[#82899a]">
                        ---
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-[#ebecf2]">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm text-[#82899a] hover:text-[#5326ec] disabled:opacity-50 disabled:hover:text-[#82899a]"
          >
            ← Prev
          </button>

          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-1 text-sm text-[#82899a]"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page as number)}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  currentPage === page
                    ? 'bg-[#5326ec] text-white'
                    : 'text-[#82899a] hover:text-[#5326ec]'
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm text-[#82899a] hover:text-[#5326ec] disabled:opacity-50 disabled:hover:text-[#82899a]"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
