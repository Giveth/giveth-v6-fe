import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { useUserDonations } from '@/hooks/useUser'
import {
  DonationSortField,
  SortDirection,
} from '@/lib/graphql/generated/graphql'
import { getTransactionUrl } from '@/lib/helpers/chainHelper'
import { ChainIcon } from '../ChainIcon'

const PAGE_SIZE = 15

export const UserDonationTableOneTime = ({
  userId,
  setIsLoading,
}: {
  userId: number
  setIsLoading: (isLoading: boolean) => void
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [orderBy, setOrderBy] = useState<DonationSortField>(
    DonationSortField.CreatedAt,
  )
  const [orderDirection, setOrderDirection] = useState<SortDirection>(
    SortDirection.Desc,
  )

  const { data, isLoading, isFetching } = useUserDonations(userId ?? 0, {
    enabled: true,
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    orderBy,
    orderDirection,
  })

  useEffect(() => {
    // `isLoading` is only true for the very first load; during pagination/refetch
    // React Query uses `isFetching`.
    setIsLoading(isLoading || isFetching)
  }, [isLoading, isFetching, setIsLoading])

  const donations = data?.donationsByUser?.donations || []
  const totalDonations = data?.donationsByUser?.total || 0
  const totalPages = Math.ceil(totalDonations / PAGE_SIZE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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

  const handleSort = (field: DonationSortField) => {
    setCurrentPage(1)

    if (orderBy === field) {
      setOrderDirection(prevDirection =>
        prevDirection === SortDirection.Desc
          ? SortDirection.Asc
          : SortDirection.Desc,
      )
      return
    }

    setOrderBy(field)
    setOrderDirection(SortDirection.Desc)
  }

  return (
    <>
      <div className="overflow-x-auto">
        {(isLoading || isFetching) && (
          <div className="text-sm text-giv-gray-600 mb-2">Loading…</div>
        )}
        {/* Table */}
        {!isLoading && (
          <table className="w-full">
            <thead>
              <tr className="border-b border-giv-gray-400">
                <th className="text-left px-1 py-3 text-base font-medium text-giv-gray-900">
                  <button
                    type="button"
                    onClick={() => handleSort(DonationSortField.CreatedAt)}
                    className={`flex items-center gap-2 hover:text-giv-primary-500 cursor-pointer ${
                      orderBy === DonationSortField.CreatedAt
                        ? 'text-giv-primary-500'
                        : 'text-giv-gray-900 hover:text-giv-primary-500'
                    }`}
                  >
                    Donated at
                    {orderBy === DonationSortField.CreatedAt &&
                      orderDirection === SortDirection.Asc && (
                        <ArrowUp className="w-3 h-3" />
                      )}
                    {orderBy === DonationSortField.CreatedAt &&
                      orderDirection === SortDirection.Desc && (
                        <ArrowDown className="w-3 h-3" />
                      )}
                    {orderBy !== DonationSortField.CreatedAt && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="text-left px-1 py-3 text-base font-medium text-giv-gray-900">
                  Project
                </th>
                <th className="text-left px-1 py-3 text-base font-medium text-giv-gray-900">
                  Status
                </th>
                <th className="text-left px-1 py-3 text-base font-medium text-giv-gray-900">
                  <button
                    type="button"
                    onClick={() => handleSort(DonationSortField.Amount)}
                    className={`flex items-center gap-2 hover:text-giv-primary-500 cursor-pointer ${
                      orderBy === DonationSortField.Amount
                        ? 'text-giv-primary-500'
                        : 'text-giv-gray-900 hover:text-giv-primary-500'
                    }`}
                  >
                    Amount
                    {orderBy === DonationSortField.Amount &&
                      orderDirection === SortDirection.Asc && (
                        <ArrowUp className="w-3 h-3" />
                      )}
                    {orderBy === DonationSortField.Amount &&
                      orderDirection === SortDirection.Desc && (
                        <ArrowDown className="w-3 h-3" />
                      )}
                    {orderBy !== DonationSortField.Amount && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="text-left px-1 py-3 text-base font-medium text-giv-gray-900">
                  <button
                    type="button"
                    onClick={() => handleSort(DonationSortField.ValueUsd)}
                    className={`flex items-center gap-2 hover:text-giv-primary-500 cursor-pointer ${
                      orderBy === DonationSortField.ValueUsd
                        ? 'text-giv-primary-500'
                        : 'text-giv-gray-900 hover:text-giv-primary-500'
                    }`}
                  >
                    USD value
                    {orderBy === DonationSortField.ValueUsd &&
                      orderDirection === SortDirection.Asc && (
                        <ArrowUp className="w-3 h-3" />
                      )}
                    {orderBy === DonationSortField.ValueUsd &&
                      orderDirection === SortDirection.Desc && (
                        <ArrowDown className="w-3 h-3" />
                      )}
                    {orderBy !== DonationSortField.ValueUsd && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="text-left px-1 py-3 text-base font-medium text-giv-gray-900">
                  QF round
                </th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-1 py-3 text-center text-giv-gray-900"
                  >
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
                      className="text-base border-b border-giv-gray-300 hover:bg-[#fcfcff] transition-colors"
                    >
                      <td className="px-1 py-4">
                        {format(new Date(donation.createdAt), 'MMM d, yyyy')}
                      </td>

                      <td className="px-1 py-4">
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
                      <td className="px-1 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#d2fffb] text-[#1b8c82]">
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-1 py-4">
                        <div className="flex items-center gap-2">
                          <ChainIcon
                            networkId={donation.transactionNetworkId}
                            height={24}
                            width={24}
                          />
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
                      <td className="px-1 py-4 text-sm text-[#1f2333]">
                        ${donation.valueUsd?.toFixed(2) ?? '0.00'}
                      </td>
                      <td className="px-1 py-4">
                        {donation.qfRoundName && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-giv-primary-500 border-2 border-giv-primary-500">
                            {donation.qfRoundName}
                          </span>
                        )}
                        {!donation.qfRoundName && <span>---</span>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 px-6 py-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 text-sm text-giv-deep-900 hover:text-giv-primary-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3 h-3" />
            Prev
          </button>

          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-sm text-giv-gray-600"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page as number)}
                className={`w-8 h-7 text-sm rounded cursor-pointer ${
                  currentPage === page
                    ? 'font-medium text-giv-primary-500'
                    : 'text-giv-gray-600 hover:text-giv-primary-500'
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1 text-sm text-giv-deep-900 hover:text-giv-primary-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </>
  )
}
