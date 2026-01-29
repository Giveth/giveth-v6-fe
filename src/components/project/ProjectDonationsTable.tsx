import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { type Address } from 'thirdweb'
import { EnsName } from '@/components/account/EnsName'
import { ChainIcon } from '@/components/ChainIcon'
import {
  DonationTableDropdown,
  type FilterType,
} from '@/components/project/DonationTableDropdown'
import { ProjectImage } from '@/components/project/ProjectImage'
import { useProjectDonations } from '@/hooks/useProject'
import { USER_AVATAR_FALLBACK_IMAGE } from '@/lib/constants/other-constants'
import {
  DonationSortField,
  SortDirection,
} from '@/lib/graphql/generated/graphql'
import type { ProjectBySlugQuery } from '@/lib/graphql/generated/graphql'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { getChainName, getTransactionUrl } from '@/lib/helpers/chainHelper'
import { shortenAddress } from '@/lib/helpers/userHelper'

interface ProjectDonationsTableProps {
  projectId: number
  qfRoundEntries?: Array<
    NonNullable<ProjectBySlugQuery['projectBySlug']['projectQfRounds']>[number]
  >
  setSelectedRound: (
    round:
      | NonNullable<
          NonNullable<
            ProjectBySlugQuery['projectBySlug']['projectQfRounds']
          >[number]
        >
      | undefined,
  ) => void
}

type QfRoundOption = NonNullable<
  NonNullable<
    ProjectBySlugQuery['projectBySlug']['projectQfRounds']
  >[number]['qfRound']
>

export function ProjectDonationsTable({
  projectId,
  qfRoundEntries = [],
  setSelectedRound,
}: ProjectDonationsTableProps) {
  const lastSelectedRoundIdRef = useRef<string | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(0)
  const [filter, setFilter] = useState<FilterType>({ type: 'all' })
  const [useUrlFilter, setUseUrlFilter] = useState(true)
  const donationsPerPage = 10

  // Get query string parameters from the URL
  const searchParams = useSearchParams()
  const roundIdFromUrl = searchParams.get('roundId')

  const qfRoundId =
    useUrlFilter && roundIdFromUrl
      ? parseInt(roundIdFromUrl)
      : filter.type === 'round'
        ? parseInt(filter.id)
        : undefined

  useEffect(() => {
    const nextRoundId = qfRoundId ? qfRoundId.toString() : undefined
    if (lastSelectedRoundIdRef.current === nextRoundId) return
    lastSelectedRoundIdRef.current = nextRoundId

    if (!nextRoundId) {
      setSelectedRound(undefined)
      return
    }

    const roundEntry = qfRoundEntries.find(r => r.qfRound?.id === nextRoundId)
    setSelectedRound(roundEntry)
  }, [qfRoundEntries, qfRoundId, setSelectedRound])

  // Setup filter based on the roundId from the URL if exists
  useEffect(() => {
    if (useUrlFilter && roundIdFromUrl) {
      const roundName =
        qfRoundEntries.find(r => r.qfRound?.id === roundIdFromUrl)?.qfRound
          ?.name || ''
      setFilter({
        type: 'round',
        id: roundIdFromUrl,
        name: roundName,
      })
    }
  }, [qfRoundEntries, roundIdFromUrl, useUrlFilter])

  // Set up sorting
  const [orderBy, setOrderBy] = useState<DonationSortField>(
    DonationSortField.CreatedAt,
  )
  const [orderDirection, setOrderDirection] = useState<SortDirection>(
    SortDirection.Desc,
  )

  const { data, isLoading, isFetching } = useProjectDonations(
    projectId,
    currentPage * donationsPerPage,
    donationsPerPage,
    qfRoundId,
    orderBy,
    orderDirection,
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
      <div className="bg-white rounded-xl border border-giv-gray-300 p-6">
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
    donorName: donation.anonymous
      ? 'Anonymous'
      : donation.user
        ? `${donation.user.firstName || ''} ${donation.user.lastName || ''}`.trim() ||
          donation.user.name ||
          ''
        : '',
    donorAddress: donation.anonymous ? null : donation.fromWalletAddress,
    avatar: donation.user?.avatar || null,
    network: getChainName(donation.transactionNetworkId),
    networkId: donation.transactionNetworkId,
    transactionId: donation.transactionId,
    amount: donation.amount.toString(),
    token: donation.currency,
    usd: `$${donation.valueUsd?.toFixed(2) || '0.00'}`,
  }))

  const handleSort = (field: DonationSortField) => {
    setCurrentPage(0)
    // NOTE: keep this handler side-effect-free (no setState calls inside another setState updater),
    // otherwise React StrictMode can call the updater twice in dev and "cancel out" the toggle.
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

  const dropdownRounds: QfRoundOption[] = qfRoundEntries
    .map(entry => entry.qfRound)
    .filter((round): round is QfRoundOption => Boolean(round))

  return (
    <>
      <div className="mb-4">
        <DonationTableDropdown
          qfRounds={dropdownRounds}
          selectedFilter={filter}
          onSelect={newFilter => {
            setFilter(newFilter)
            setUseUrlFilter(false)
            setCurrentPage(0)
            const roundEntry =
              newFilter.type === 'round'
                ? qfRoundEntries.find(
                    entry => entry.qfRound?.id === newFilter.id,
                  )
                : undefined
            setSelectedRound(roundEntry)
          }}
        />
      </div>

      <div className="overflow-hidden">
        {isFetching && (
          <div className="text-sm text-giv-gray-600 mb-2">Loading…</div>
        )}
        {/* Table */}
        {!isFetching && (
          <div className="overflow-x-auto">
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
                    Donor
                  </th>
                  <th className="text-left px-1 py-3 text-base font-medium text-giv-gray-900">
                    Network
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
                      USD Value
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
                </tr>
              </thead>
              <tbody>
                {formattedDonations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-base text-giv-gray-700"
                    >
                      No donations yet
                    </td>
                  </tr>
                ) : (
                  formattedDonations.map((donation, idx) => {
                    const donorAddress = donation.donorAddress
                      ? (donation.donorAddress as Address as `0x${string}`)
                      : null
                    const donorAlt =
                      donation.donorName ||
                      (donorAddress
                        ? shortenAddress(donorAddress)
                        : 'Anonymous')

                    return (
                      <tr
                        key={idx}
                        className="text-base border-b border-giv-gray-300 hover:bg-[#fcfcff] transition-colors"
                      >
                        <td className="px-1 py-4">{donation.date}</td>
                        <td className="px-1 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden">
                              <ProjectImage
                                src={
                                  donation.avatar || USER_AVATAR_FALLBACK_IMAGE
                                }
                                alt={donorAlt}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="">
                              {donation.donorName === 'Anonymous'
                                ? 'Anonymous'
                                : donation.donorName ||
                                  (donorAddress ? (
                                    <EnsName address={donorAddress} />
                                  ) : (
                                    'Anonymous'
                                  ))}
                            </span>
                          </div>
                        </td>
                        <td className="px-1 py-4">
                          <div className="flex items-center gap-2">
                            <ChainIcon
                              networkId={donation.networkId}
                              height={20}
                              width={20}
                            />
                            <span>{donation.network}</span>
                          </div>
                        </td>
                        <td className="px-1 py-4">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">
                              {formatNumber(Number(donation.amount), {
                                minDecimals: 2,
                                maxDecimals: 2,
                              })}{' '}
                            </span>
                            <span className="text-giv-gray-800">
                              {donation.token}
                            </span>
                            <a
                              href={getTransactionUrl(
                                donation.networkId,
                                donation.transactionId,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-giv-primary-500 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 text-giv-gray-800" />
                            </a>
                          </div>
                        </td>
                        <td className="px-1 py-4">{donation.usd}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-6 py-4">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="flex items-center gap-1 px-3 py-1 text-sm text-giv-deep-900 hover:text-giv-primary-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
                  className={`w-7 h-7 text-sm rounded cursor-pointer ${
                    currentPage === pageIndex
                      ? 'font-medium text-giv-primary-500'
                      : 'text-giv-gray-600 hover:text-giv-primary-500'
                  }`}
                >
                  {pageIndex + 1}
                </button>
              )
            })}

            {totalPages > 5 && currentPage < totalPages - 3 && (
              <span className="px-2 text-sm text-giv-gray-600">...</span>
            )}

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages - 1}
              className="flex items-center gap-1 px-3 py-1 text-sm text-giv-deep-900 hover:text-giv-primary-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
