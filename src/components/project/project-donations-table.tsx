import { useState, type SyntheticEvent } from 'react'
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import {
  DonationTableDropdown,
  type FilterType,
} from '@/components/project/donation-table-dropdown'
import { useProjectDonations } from '@/hooks/useProject'
import {
  getChainIcon,
  getChainName,
  getTransactionUrl,
  USER_AVATAR_FALLBACK_IMAGE,
} from '@/lib/constants'
import { ProjectImage } from './ProjectImage'

interface ProjectDonationsTableProps {
  projectId: number
  qfRounds?: Array<{
    id: string
    name: string
    isActive: boolean
  }>
}

export function ProjectDonationsTable({
  projectId,
  qfRounds = [],
}: ProjectDonationsTableProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [filter, setFilter] = useState<FilterType>({ type: 'all' })
  const donationsPerPage = 10

  const qfRoundId = filter.type === 'round' ? parseInt(filter.id) : undefined

  const { data, isLoading } = useProjectDonations(
    projectId,
    currentPage * donationsPerPage,
    donationsPerPage,
    qfRoundId,
  )
  const donations = data?.donationsByProject?.donations || []
  const totalDonations = data?.donationsByProject?.total || 0

  // Calculate pagination
  const totalPages = Math.ceil(totalDonations / donationsPerPage)

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  const handlePageClick = (pageIndex: number) => {
    setCurrentPage(pageIndex)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-[#ebecf2] p-6">
        <div className="text-center py-8">Loading donations...</div>
      </div>
    )
  }

  // Transform donations data to match the expected format
  const formattedDonations = donations.map(donation => ({
    date: new Date(donation.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    donor: donation.user
      ? `${donation.user.firstName || ''} ${donation.user.lastName || ''}`.trim() ||
        donation.user.name ||
        'Anonymous'
      : 'Anonymous',
    avatar: donation.user?.avatar || null,
    network: getChainName(donation.transactionNetworkId),
    networkId: donation.transactionNetworkId,
    transactionId: donation.transactionId,
    amount: donation.amount.toString(),
    token: donation.currency,
    usd: `$${donation.valueUsd?.toFixed(2) || '0.00'}`,
  }))

  function NetworkIcon({ networkId }: { networkId: number }) {
    const iconData = getChainIcon(networkId)
    return (
      <div className="w-5 h-5 rounded-full overflow-hidden bg-white flex items-center justify-center">
        <img
          src={iconData.iconUrl}
          alt={`${networkId} icon`}
          className="w-4 h-4 object-contain"
          onError={(event: SyntheticEvent<HTMLImageElement>) => {
            const target = event.currentTarget
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent) {
              parent.innerHTML = `<div class="w-5 h-5 rounded-full ${iconData.bg} flex items-center justify-center ${iconData.textColor || 'text-white'} text-xs">${iconData.fallbackIcon}</div>`
            }
          }}
        />
      </div>
    )
  }

  return (
    <>
      <div className="mb-4">
        <DonationTableDropdown
          qfRounds={qfRounds}
          selectedFilter={filter}
          onSelect={newFilter => {
            setFilter(newFilter)
            setCurrentPage(0)
          }}
        />
      </div>

      <div className="bg-white rounded-xl border border-[#ebecf2] overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#ebecf2] bg-[#f7f7f9]">
                <th className="text-left px-6 py-3 text-sm font-medium text-[#82899a]">
                  <button className="flex items-center gap-2 hover:text-[#5326ec]">
                    Donated at
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-[#82899a]">
                  Donor
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-[#82899a]">
                  Network
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-[#82899a]">
                  <button className="flex items-center gap-2 hover:text-[#5326ec]">
                    Amount
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-[#82899a]">
                  <button className="flex items-center gap-2 hover:text-[#5326ec]">
                    USD Value
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {formattedDonations.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-[#82899a]"
                  >
                    No donations yet
                  </td>
                </tr>
              ) : (
                formattedDonations.map((donation, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[#ebecf2] hover:bg-[#fcfcff] transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-[#1f2333]">
                      {donation.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden">
                          <ProjectImage
                            src={donation.avatar || USER_AVATAR_FALLBACK_IMAGE}
                            alt={donation.donor}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm text-[#1f2333]">
                          {donation.donor}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <NetworkIcon networkId={donation.networkId} />
                        <span className="text-sm text-[#1f2333]">
                          {donation.network}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-[#1f2333]">
                          {donation.amount}
                        </span>
                        <span className="text-sm text-[#5326ec]">
                          {donation.token}
                        </span>
                        <a
                          href={getTransactionUrl(
                            donation.networkId,
                            donation.transactionId,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#5326ec] transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 text-[#82899a]" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1f2333]">
                      {donation.usd}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-[#ebecf2]">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="flex items-center gap-1 px-3 py-1 text-sm text-[#82899a] hover:text-[#5326ec] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3" />
              Prev
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
              // Show first few pages, or adjust to show current page in middle
              let pageIndex = index
              if (totalPages > 5 && currentPage > 2) {
                pageIndex = currentPage - 2 + index
              }
              if (pageIndex >= totalPages) return null

              return (
                <button
                  key={pageIndex}
                  onClick={() => handlePageClick(pageIndex)}
                  className={`w-7 h-7 text-sm rounded ${
                    currentPage === pageIndex
                      ? 'font-medium text-[#5326ec] border-b-2 border-[#5326ec]'
                      : 'text-[#82899a] hover:text-[#5326ec]'
                  }`}
                >
                  {pageIndex + 1}
                </button>
              )
            })}

            {totalPages > 5 && currentPage < totalPages - 3 && (
              <span className="px-2 text-sm text-[#82899a]">...</span>
            )}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-1 px-3 py-1 text-sm text-[#82899a] hover:text-[#5326ec] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}
