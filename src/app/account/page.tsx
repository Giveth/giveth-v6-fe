'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowUpRight, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react'
import { EditProfileModal } from '@/components/account/EditProfileModal'
import { ProjectActionsMenu } from '@/components/account/ProjectActionsMenu'
import { SiweAuthButton } from '@/components/auth/SiweAuthButton'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import type { MyDonation, MyProject } from '@/hooks/useAccount'
import {
  useMe,
  useMyDonations,
  useMyProjects,
  useUserStats,
} from '@/hooks/useAccount'
import { useSiweAuth } from '@/hooks/useSiweAuth'
import type {
  ReviewStatus,
  UserStatsQuery,
} from '@/lib/graphql/generated/graphql'
import type { Route } from 'next'

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value ?? 0)

const formatNumber = (value?: number) =>
  new Intl.NumberFormat('en-US').format(value ?? 0)

const shortenAddress = (address?: string) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not set'

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(value))
    : '--'

const formatUsdValue = (value?: number | null) => {
  if (value === null || value === undefined) return '< $0.01'
  if (value < 0.01) return '< $0.01'
  return formatCurrency(value)
}

const formatTokenAmount = (amount: number) => {
  if (amount >= 1) {
    return amount.toLocaleString('en-US', { maximumFractionDigits: 4 })
  }
  if (amount >= 0.01) {
    return amount.toFixed(2)
  }
  return amount.toPrecision(2)
}

const NETWORK_META: Record<
  number,
  { name: string; dot: string; pill: string; explorer?: string }
> = {
  1: {
    name: 'Ethereum',
    dot: 'bg-[#8247e5]',
    pill: 'bg-[#f1e6ff] text-[#4b2faa]',
    explorer: 'https://etherscan.io/tx/',
  },
  10: {
    name: 'Optimism',
    dot: 'bg-[#ff0420]',
    pill: 'bg-[#ffe4e7] text-[#c8102e]',
    explorer: 'https://optimistic.etherscan.io/tx/',
  },
  100: {
    name: 'Gnosis',
    dot: 'bg-[#0f9b6d]',
    pill: 'bg-[#e6f5ef] text-[#0f9b6d]',
    explorer: 'https://gnosisscan.io/tx/',
  },
  137: {
    name: 'Polygon',
    dot: 'bg-[#8247e5]',
    pill: 'bg-[#efe7ff] text-[#5b3dbf]',
    explorer: 'https://polygonscan.com/tx/',
  },
  42161: {
    name: 'Arbitrum',
    dot: 'bg-[#1b75d0]',
    pill: 'bg-[#e8f3ff] text-[#1b75d0]',
    explorer: 'https://arbiscan.io/tx/',
  },
  8453: {
    name: 'Base',
    dot: 'bg-[#1d4ed8]',
    pill: 'bg-[#e6f0ff] text-[#1d4ed8]',
    explorer: 'https://basescan.org/tx/',
  },
}

const getNetworkMeta = (networkId: number) =>
  NETWORK_META[networkId] || {
    name: `Chain ${networkId}`,
    dot: 'bg-[#9aa0b5]',
    pill: 'bg-[#f3f4f6] text-[#4b5169]',
  }

const getExplorerUrl = (networkId: number, txHash?: string) => {
  const meta = getNetworkMeta(networkId)
  if (!meta.explorer || !txHash) return undefined
  return `${meta.explorer}${txHash}`
}

const getDonationStatusBadge = (status?: string) => {
  const normalized = status?.toUpperCase()
  if (normalized === 'VERIFIED' || normalized === 'SUCCESS') {
    return { label: 'Success', tone: 'success' as const }
  }
  if (normalized === 'PENDING') {
    return { label: 'Pending', tone: 'warning' as const }
  }
  if (normalized === 'FAILED') {
    return { label: 'Failed', tone: 'danger' as const }
  }
  return { label: status || 'Unknown', tone: 'neutral' as const }
}

type TabKey =
  | 'overview'
  | 'givpower'
  | 'projects'
  | 'causes'
  | 'donations'
  | 'bookmarks'

const PROJECTS_PAGE_SIZE = 4

const badgeStyles: Record<
  'primary' | 'neutral' | 'warning' | 'danger' | 'success' | 'info',
  string
> = {
  primary: 'bg-[#e5d5ff] text-[#4c249f]',
  neutral: 'bg-[#eef2f7] text-[#4b5169]',
  warning: 'bg-[#fff3d6] text-[#b25f00]',
  danger: 'bg-[#ffe0e0] text-[#b91c1c]',
  success: 'bg-[#d1f4e7] text-[#0f9b6d]',
  info: 'bg-[#d9f3ff] text-[#0b6fa4]',
}

const StatusBadge = ({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: keyof typeof badgeStyles
}) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[tone]}`}
  >
    {label}
  </span>
)

const getProjectStatusBadge = (reviewStatus: ReviewStatus) => {
  if (reviewStatus === 'NOT_REVIEWED')
    return { label: 'Draft', tone: 'neutral' as const }
  if (reviewStatus === 'LISTED')
    return { label: 'Active', tone: 'success' as const }
  return { label: 'Active', tone: 'info' as const }
}

const getReviewBadge = (reviewStatus: ReviewStatus) => {
  if (reviewStatus === 'LISTED')
    return { label: 'Listed', tone: 'primary' as const }
  if (reviewStatus === 'NOT_LISTED')
    return { label: 'Not Listed', tone: 'danger' as const }
  return { label: 'Not reviewed', tone: 'neutral' as const }
}

const getGivbacksBadge = (isEligible?: boolean | null) => {
  if (isEligible === true)
    return { label: 'Eligible', tone: 'success' as const }
  if (isEligible === false)
    return { label: 'Ineligible', tone: 'warning' as const }
  return { label: 'Not evaluated', tone: 'neutral' as const }
}

const getVerificationBadge = (vouched: boolean) =>
  vouched
    ? { label: 'Verified', tone: 'success' as const }
    : { label: 'Not verified', tone: 'warning' as const }

const ProjectCard = ({ project }: { project: MyProject }) => {
  const [showActions, setShowActions] = useState(false)

  const projectStatus = getProjectStatusBadge(project.reviewStatus)
  const reviewBadge = getReviewBadge(project.reviewStatus)
  const givbacksBadge = getGivbacksBadge(project.isGivbacksEligible)
  const verificationBadge = getVerificationBadge(project.vouched)

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_45px_rgba(83,38,236,0.08)]">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="text-sm text-[#9aa0b5]">
            Created at {formatDate(project.createdAt)}
          </div>
          <h3 className="text-2xl font-bold text-[var(--giv-deep-900)]">
            {project.title}
          </h3>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-[#6b7285]">
              <span className="font-semibold text-[var(--color-text)]">
                Project status
              </span>
              <StatusBadge {...projectStatus} />
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6b7285]">
              <span className="font-semibold text-[var(--color-text)]">
                Listed on public site
              </span>
              <StatusBadge {...reviewBadge} />
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6b7285]">
              <span className="font-semibold text-[var(--color-text)]">
                GIVbacks Eligibility status
              </span>
              <StatusBadge {...givbacksBadge} />
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6b7285]">
              <span className="font-semibold text-[var(--color-text)]">
                Verification status
              </span>
              <StatusBadge {...verificationBadge} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white px-5 py-4 text-left shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#9aa0b5]">
              Total Raised
            </div>
            <div className="mt-1 text-3xl font-bold text-[var(--giv-primary-700)]">
              {formatCurrency(project.totalDonations)}
            </div>
          </div>
          <div className="relative">
            <Button
              variant="secondary"
              className="flex items-center gap-2 text-[var(--color-text)]"
              onClick={() => setShowActions(current => !current)}
              aria-expanded={showActions}
            >
              Actions
              <ChevronDown size={16} />
            </Button>
            <ProjectActionsMenu
              project={project}
              open={showActions}
              onClose={() => setShowActions(false)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const ProjectsTab = ({ token }: { token?: string }) => {
  const [page, setPage] = useState(1)
  const skip = (page - 1) * PROJECTS_PAGE_SIZE
  const { data, isLoading, error, isFetching } = useMyProjects(token, {
    skip,
    take: PROJECTS_PAGE_SIZE,
    enabled: !!token,
  })
  const projects = data?.myProjects.projects ?? []
  const total = data?.myProjects.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PROJECTS_PAGE_SIZE))

  const handlePrev = () => setPage(current => Math.max(1, current - 1))
  const handleNext = () => setPage(current => Math.min(totalPages, current + 1))

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--giv-deep-900)]">
            My Projects
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Manage your listed, in-review, and draft projects
          </p>
        </div>
        <Button asChild>
          <Link href="/create/project">Create Project</Link>
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
          Unable to load your projects right now. Please try again in a moment.
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="h-40 animate-pulse rounded-[28px] bg-white shadow-[0_20px_45px_rgba(83,38,236,0.08)]"
            />
          ))}
        </div>
      ) : projects.length ? (
        <div className="flex flex-col gap-4">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-[var(--color-border)] bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-[var(--giv-deep-900)]">
            You don't have any projects yet
          </h3>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Create your first project to start receiving donations and track its
            status here.
          </p>
          <div className="mt-4 flex justify-center">
            <Button asChild>
              <Link href="/create/project">Create Project</Link>
            </Button>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-[#7b8199]">
          <button
            type="button"
            onClick={handlePrev}
            disabled={page === 1 || isFetching}
            className="rounded-full px-3 py-2 transition hover:text-[var(--giv-primary-700)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Prev
          </button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--color-text)]">
              Page {page}
            </span>
            <span>of {totalPages}</span>
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-[var(--giv-primary-700)]" />
            )}
          </div>
          <button
            type="button"
            onClick={handleNext}
            disabled={page >= totalPages || isFetching}
            className="rounded-full px-3 py-2 transition hover:text-[var(--giv-primary-700)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      )}
    </section>
  )
}

const DonationsTab = ({ token }: { token?: string }) => {
  const [page, setPage] = useState(1)
  const [donationType, setDonationType] = useState<'one-time' | 'recurring'>(
    'one-time',
  )
  const pageSize = 10
  const skip = (page - 1) * pageSize

  const { data, isLoading, isFetching, error } = useMyDonations(token, {
    skip,
    take: pageSize,
    enabled: !!token,
  })

  const donations = data?.myDonations.donations ?? []
  const total = data?.myDonations.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const pageNumbers = useMemo<(number | string)[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1)
    }

    const pages: (number | string)[] = [1]
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)

    if (start > 2) pages.push('...')
    for (let i = start; i <= end; i += 1) {
      pages.push(i)
    }
    if (end < totalPages - 1) pages.push('...')
    pages.push(totalPages)
    return pages
  }, [page, totalPages])

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages))
  }

  const renderRow = (donation: MyDonation) => {
    const networkMeta = getNetworkMeta(donation.transactionNetworkId)
    const explorer = getExplorerUrl(
      donation.transactionNetworkId,
      donation.transactionId,
    )
    const projectName = donation.project?.title || 'Project unavailable'
    const projectUrl = donation.project?.slug
      ? (`/project/${donation.project.slug}` as Route)
      : undefined

    return (
      <tr
        key={donation.id}
        className="group border-b border-[#f0f2f5] last:border-0 hover:bg-[#faf5fb]"
      >
        <td className="whitespace-nowrap py-4 text-sm font-semibold text-[var(--color-text)]">
          {formatDate(donation.createdAt)}
        </td>
        <td className="py-4 text-sm font-semibold text-[var(--giv-deep-900)]">
          {projectUrl ? (
            <Link
              href={projectUrl}
              className="inline-flex items-center gap-2 hover:text-[var(--giv-primary-700)]"
            >
              {projectName}
              <ArrowUpRight size={14} className="text-[#d81a72]" />
            </Link>
          ) : (
            projectName
          )}
        </td>
        <td className="py-4">
          <StatusBadge {...getDonationStatusBadge(donation.status)} />
        </td>
        <td className="py-4">
          {explorer ? (
            <a
              href={explorer}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition hover:translate-y-[-1px] hover:shadow-sm"
            >
              <span
                className={`h-2 w-2 rounded-full ${networkMeta.dot}`}
                aria-hidden
              />
              <span
                className={`rounded-full px-3 py-1 text-xs ${networkMeta.pill}`}
              >
                {networkMeta.name}
              </span>
              <ArrowUpRight size={14} className="text-[#9aa0b5]" />
            </a>
          ) : (
            <div className="inline-flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${networkMeta.dot}`}
                aria-hidden
              />
              <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-semibold text-[#4b5169]">
                {networkMeta.name}
              </span>
            </div>
          )}
        </td>
        <td className="py-4 text-sm font-semibold text-[var(--giv-deep-900)]">
          {formatTokenAmount(donation.amount)} {donation.currency}
        </td>
        <td className="py-4 text-right text-sm font-semibold text-[var(--giv-deep-900)]">
          {formatUsdValue(donation.valueUsd)}
        </td>
      </tr>
    )
  }

  const renderSkeletonRows = () => (
    <tbody className="divide-y divide-[#f0f2f5]">
      {Array.from({ length: 5 }).map((_, idx) => (
        <tr key={idx} className="animate-pulse">
          {Array.from({ length: 6 }).map((__, cellIdx) => (
            <td key={cellIdx} className="py-4">
              <div className="h-4 w-24 rounded-full bg-[#f1f3f6]" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )

  const renderEmptyState = () => (
    <tbody>
      <tr>
        <td
          colSpan={6}
          className="py-8 text-center text-sm font-semibold text-[var(--color-text-muted)]"
        >
          You have not made any donations yet.
        </td>
      </tr>
    </tbody>
  )

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_45px_rgba(83,38,236,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--giv-deep-900)]">
              My Donations
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Track your one-time and recurring donations
            </p>
          </div>
          {isFetching && (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f4f2ff] px-3 py-1 text-xs font-semibold text-[#4b2faa]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setDonationType('one-time')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              donationType === 'one-time'
                ? 'bg-[#d81a72] text-white shadow-[0_10px_25px_rgba(216,26,114,0.25)]'
                : 'bg-[#f3f4f6] text-[#7b8199] hover:text-[var(--giv-deep-900)]'
            }`}
          >
            One-Time Donation
          </button>
          <button
            type="button"
            onClick={() => setDonationType('recurring')}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              donationType === 'recurring'
                ? 'bg-[#d81a72] text-white shadow-[0_10px_25px_rgba(216,26,114,0.25)]'
                : 'bg-[#f3f4f6] text-[#7b8199] hover:text-[var(--giv-deep-900)]'
            }`}
          >
            Recurring Donation
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Unable to load your donations right now. Please try again shortly.
          </div>
        )}

        {donationType === 'recurring' ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-border)] bg-[#f9fafb] p-8 text-center">
            <h3 className="text-lg font-semibold text-[var(--giv-deep-900)]">
              Recurring donations are coming soon
            </h3>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Set up subscriptions to support projects you love on autopilot.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-[#f0f2f5] text-left text-xs font-semibold uppercase tracking-wide text-[#9aa0b5]">
                  <th className="pb-3">Donated at</th>
                  <th className="pb-3">Project</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Network</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3 text-right">USD Value</th>
                </tr>
              </thead>
              {isLoading ? (
                renderSkeletonRows()
              ) : donations.length ? (
                <tbody>{donations.map(renderRow)}</tbody>
              ) : (
                renderEmptyState()
              )}
            </table>
          </div>
        )}

        {donationType === 'one-time' && totalPages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-[#7b8199]">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1 || isFetching}
              className="rounded-full px-3 py-2 transition hover:text-[var(--giv-primary-700)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Prev
            </button>
            {pageNumbers.map((item, idx) =>
              typeof item === 'string' ? (
                <span key={`${item}-${idx}`} className="px-2">
                  {item}
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => handlePageChange(item)}
                  className={`rounded-full px-3 py-2 font-semibold transition ${
                    item === page
                      ? 'bg-[#fdf0f7] text-[#d81a72]'
                      : 'text-[#4b5169] hover:text-[var(--giv-primary-700)]'
                  }`}
                  disabled={isFetching}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || isFetching}
              className="rounded-full px-3 py-2 transition hover:text-[var(--giv-primary-700)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

const OverviewTab = ({
  userStats,
  isLoading,
  statsError,
  givPower,
}: {
  userStats?: UserStatsQuery['userStats']
  isLoading: boolean
  statsError?: unknown
  givPower: number
}) => (
  <>
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="DONATIONS"
          value={
            isLoading ? '...' : formatNumber(userStats?.donationsCount || 0)
          }
        />
        <StatCard
          label="TOTAL AMOUNT DONATED"
          value={isLoading ? '...' : formatCurrency(userStats?.totalDonated)}
        />
        <StatCard
          label="PROJECTS"
          value={isLoading ? '...' : formatNumber(userStats?.projectsCount)}
        />
        <StatCard
          label="DONATIONS RECEIVED"
          value={isLoading ? '...' : formatCurrency(userStats?.totalReceived)}
        />
        <StatCard
          label="PROJECTS BOOSTED"
          value={
            isLoading ? '...' : formatNumber(userStats?.likedProjectsCount || 0)
          }
        />
        <StatCard
          label="GIVPOWER"
          value={isLoading ? '...' : formatNumber(givPower)}
          helper="GIVpower metrics coming soon"
        />
      </div>

      {Boolean(statsError) && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
          Unable to load stats from the backend right now. Please try again in a
          moment.
        </div>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4e2bd4] via-[#602feb] to-[#d81a72] p-10 text-white shadow-[0_30px_60px_rgba(83,38,236,0.25)]">
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/80">
              Support Public Goods, Win Big Rewards
            </p>
            <h3 className="text-3xl font-bold">Giveth � PoolTogether</h3>
            <p className="text-lg text-white/90">
              Deposit tokens into the Giveth PoolTogether Vault; fund public
              goods, win ETH prizes and get back 100% of your deposit.
            </p>
            <Button
              className="bg-white text-[var(--giv-primary-700)] shadow-md hover:bg-white/90"
              variant="primary"
            >
              Enter The Vault
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--color-border)] bg-white p-10 text-center shadow-soft">
          <h3 className="text-3xl font-bold text-[var(--giv-deep-900)]">
            Give and get GIV
          </h3>
          <p className="mt-3 text-lg text-[var(--color-text-muted)]">
            Donate to GIVbacks eligible projects and get rewarded with GIV.
            Support the public goods you love and earn along the way.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="px-6">
              Explore GIVbacks
            </Button>
            <Link
              href={{ pathname: '/projects' }}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] hover:border-[var(--giv-primary-300)]"
            >
              Browse Projects
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  </>
)

export default function AccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = (searchParams.get('tab') as TabKey | null) ?? 'overview'

  const {
    isAuthenticated,
    isLoading: authLoading,
    token,
    user: authUser,
  } = useSiweAuth()

  const { data: meData, isLoading: meLoading } = useMe(token || undefined)
  const userId = meData?.me?.id ? Number(meData.me.id) : undefined
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useUserStats(userId, token || undefined)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)

  const isLoading = authLoading || meLoading || statsLoading
  const userProfile = meData?.me
  const userStats = statsData?.userStats
  const primaryWallet =
    userProfile?.wallets.find(wallet => wallet.isPrimary)?.address ??
    userProfile?.wallets[0]?.address ??
    authUser?.primaryWallet

  const givPower = 0 // Placeholder until GIVpower endpoint is available

  const tabs = useMemo(
    () => [
      { key: 'overview', label: 'Overview', count: undefined },
      { key: 'givpower', label: 'My GIVpower', count: givPower },
      {
        key: 'projects',
        label: 'My Projects',
        count: userStats?.projectsCount ?? 0,
      },
      { key: 'causes', label: 'My Causes', count: 0 },
      {
        key: 'donations',
        label: 'My Donations',
        count: userStats?.donationsCount ?? 0,
      },
      {
        key: 'bookmarks',
        label: 'Bookmarks',
        count: userStats?.likedProjectsCount ?? 0,
      },
    ],
    [
      givPower,
      userStats?.projectsCount,
      userStats?.donationsCount,
      userStats?.likedProjectsCount,
    ],
  )

  const handleTabChange = (tab: TabKey) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tab === 'overview') {
      params.delete('tab')
    } else {
      params.set('tab', tab)
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f7f7fb] pb-16">
        <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 pt-16 text-center">
          <div className="rounded-3xl bg-white px-8 py-10 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
              Account
            </p>
            <h1 className="mt-3 text-3xl font-bold text-[var(--giv-primary-700)]">
              Sign in to view your account
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-[var(--color-text-muted)]">
              Connect your wallet and sign in with Ethereum to see your profile,
              donations, projects, and rewards.
            </p>
            <div className="mt-6 flex items-center justify-center">
              <SiweAuthButton />
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f7f7fb] pb-20">
      <section className="bg-gradient-to-b from-white via-white to-[#f7f7fb]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="text-sm text-[#9aa0b5]">Home / Account</div>

          <div className="mt-4 rounded-[32px] bg-white p-8 shadow-[0_25px_65px_rgba(83,38,236,0.12)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#ffd8f0] via-[#efe7ff] to-[#d9f3ff] text-4xl font-bold text-[var(--giv-primary-700)]">
                  {userProfile?.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name || 'User avatar'}
                      className="h-full w-full rounded-3xl object-cover"
                    />
                  ) : (
                    userProfile?.name?.[0] || userProfile?.firstName?.[0] || 'U'
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold text-[var(--giv-deep-900)]">
                      {userProfile?.name ||
                        `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() ||
                        'Giveth User'}
                    </h1>
                    <button
                      className="text-sm font-semibold text-[#d81a72] underline decoration-[#d81a72]/60 decoration-2 underline-offset-4"
                      type="button"
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      Edit Profile
                    </button>
                  </div>
                  <p className="text-base text-[#6b7285]">
                    {userProfile?.email || 'Email not provided'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-[#6b7285]">
                    <span className="font-semibold text-[var(--color-text)]">
                      {shortenAddress(primaryWallet)}
                    </span>
                    <ArrowUpRight size={14} className="text-[#d81a72]" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 text-sm sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-2 rounded-full bg-[#f1f5ff] px-4 py-2 text-[#1f3a8a] ring-1 ring-[#dce6ff]">
                  <CheckCircle2 size={16} />
                  Connected to Polygon
                </div>
                <div className="rounded-2xl bg-[#f9f8ff] px-5 py-4 text-left text-sm text-[var(--color-text-muted)] shadow-[0_10px_30px_rgba(83,38,236,0.08)]">
                  <div className="flex items-center gap-2 font-semibold text-[var(--color-text)]">
                    Total received
                  </div>
                  <div className="mt-1 text-2xl font-bold text-[var(--giv-primary-700)]">
                    {formatCurrency(userProfile?.totalReceived)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
                    tab.key === activeTab
                      ? 'bg-[#fdf0f7] text-[#d81a72]'
                      : 'bg-[#f3f4f6] text-[#7b8199] hover:text-[#4b5169]'
                  }`}
                  type="button"
                  aria-pressed={tab.key === activeTab}
                  onClick={() => handleTabChange(tab.key as TabKey)}
                >
                  {tab.label}
                  {typeof tab.count === 'number' && (
                    <span className="rounded-full bg-[#d81a72] px-2 py-0.5 text-xs font-bold text-white">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {(() => {
        switch (activeTab) {
          case 'projects':
            return <ProjectsTab token={token || undefined} />
          case 'donations':
            return <DonationsTab token={token || undefined} />
          default:
            return (
              <OverviewTab
                userStats={userStats}
                isLoading={isLoading}
                statsError={statsError}
                givPower={givPower}
              />
            )
        }
      })()}
      <EditProfileModal
        open={isEditProfileOpen}
        token={token || undefined}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </main>
  )
}
