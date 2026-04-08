'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { ArrowDown } from 'lucide-react'
import { type Route } from 'next'
import {
  useBoostModalData,
  useTotalGivpowerAcrossBoostNetworks,
} from '@/hooks/projectHooks'
import { formatNumber } from '@/lib/helpers/cartHelper'

type SortKey = 'amount' | 'percent'
type SortDirection = 'asc' | 'desc'

type BoostedProjectTableRow = {
  id: string
  title: string
  slug?: string
  amount: number | null
  percent: number
}

const TABLE_GRID_COLUMNS =
  'grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,0.8fr)]'

const formatPercent = (value: number) =>
  `${formatNumber(value, {
    minDecimals: Number.isInteger(value) ? 0 : 2,
    maxDecimals: 2,
    locale: 'en-US',
  })}%`

export function UserBoostedProjects({
  userId,
  walletAddress,
  isUserLoading,
}: {
  userId?: number
  walletAddress?: string
  isUserLoading?: boolean
}) {
  const [sortBy, setSortBy] = useState<SortKey>('percent')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const {
    data: boostData,
    isLoading: isLoadingBoostData,
    error: boostDataError,
  } = useBoostModalData({
    userId,
    enabled: Boolean(userId),
    take: 200,
    skip: 0,
  })

  const {
    data: totalGivpowerData,
    isLoading: isLoadingTotalGivpower,
    error: totalGivpowerError,
  } = useTotalGivpowerAcrossBoostNetworks({
    walletAddress,
    enabled: Boolean(walletAddress),
  })

  const totalGivpower = totalGivpowerData?.totalBalanceNumber ?? null
  const isInitialLoading =
    Boolean(isUserLoading) ||
    (Boolean(userId) && isLoadingBoostData) ||
    (Boolean(walletAddress) && isLoadingTotalGivpower)

  const rows = useMemo<BoostedProjectTableRow[]>(() => {
    const boostedProjects = (boostData?.boostedProjects ?? []).filter(
      item => Number(item.percentage) > 0,
    )

    return boostedProjects
      .map(item => {
        const percent = Number(item.percentage) || 0
        const amount =
          totalGivpower == null ? null : (totalGivpower * percent) / 100

        return {
          id: item.id,
          title: item.project?.title || `Project #${item.projectId}`,
          slug: item.project?.slug || undefined,
          amount,
          percent,
        }
      })
      .sort((a, b) => {
        const multiplier = sortDirection === 'asc' ? 1 : -1
        if (sortBy === 'amount') {
          return ((a.amount ?? 0) - (b.amount ?? 0)) * multiplier
        }
        return (a.percent - b.percent) * multiplier
      })
  }, [boostData?.boostedProjects, totalGivpower, sortBy, sortDirection])

  const displayedTotalPercent = useMemo(
    () => rows.reduce((acc, row) => acc + row.percent, 0),
    [rows],
  )

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortBy(key)
    setSortDirection('desc')
  }

  if (isInitialLoading) {
    return (
      <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-giv-brand-500 mx-auto"></div>
          <p className="mt-2 text-2xl text-giv-neutral-600 font-bold">
            Loading boosted projects...
          </p>
        </div>
      </div>
    )
  }

  if (boostDataError || totalGivpowerError) {
    return (
      <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
        <div className="rounded-xl border border-giv-error-400 bg-giv-error-100 p-4 text-giv-error-400">
          {(boostDataError instanceof Error && boostDataError.message) ||
            (totalGivpowerError instanceof Error &&
              totalGivpowerError.message) ||
            'Failed to load boosted projects'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-giv-neutral-900">
          GIVpower Summary
        </h2>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-giv-neutral-300 p-8 text-center">
          <p className="text-lg font-medium text-giv-neutral-700">
            This user has no boosted projects yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={clsx(
              'grid items-center gap-4',
              TABLE_GRID_COLUMNS,
              'rounded-xl bg-giv-neutral-300 px-4 py-3',
              'border border-giv-neutral-300',
              'text-lg font-bold text-giv-neutral-800',
            )}
          >
            <div className="min-w-0">Project</div>
            <button
              type="button"
              onClick={() => handleSort('amount')}
              className="w-full inline-flex items-center justify-start gap-2 cursor-pointer"
            >
              GIVpower Amount
              <ArrowDown
                className={clsx(
                  'w-4 h-4 transition-transform',
                  sortBy === 'amount' &&
                    sortDirection === 'asc' &&
                    'rotate-180',
                )}
              />
            </button>
            <button
              type="button"
              onClick={() => handleSort('percent')}
              className="w-full inline-flex items-center justify-start gap-2 cursor-pointer"
            >
              % of Total
              <ArrowDown
                className={clsx(
                  'w-4 h-4 transition-transform',
                  sortBy === 'percent' &&
                    sortDirection === 'asc' &&
                    'rotate-180',
                )}
              />
            </button>
          </div>

          {rows.map((row, index) => (
            <div
              key={row.id}
              className={clsx(
                'grid items-center gap-4 rounded-xl',
                TABLE_GRID_COLUMNS,
                'px-4 py-3 text-lg font-medium text-giv-neutral-800',
                index % 2 === 0 ? 'bg-white' : 'bg-giv-neutral-200',
              )}
            >
              <div className="min-w-0 truncate">
                {row.slug ? (
                  <Link
                    href={`/project/${row.slug}` as Route}
                    className="hover:underline"
                  >
                    {row.title}
                  </Link>
                ) : (
                  row.title
                )}
              </div>
              <div className="text-left tabular-nums">
                {row.amount == null
                  ? '-'
                  : formatNumber(row.amount, {
                      minDecimals: 2,
                      maxDecimals: 2,
                      locale: 'en-US',
                    })}
              </div>
              <div className="text-left tabular-nums">
                {formatPercent(row.percent)}
              </div>
            </div>
          ))}

          <div
            className={clsx(
              'grid items-center gap-4',
              TABLE_GRID_COLUMNS,
              'px-4 py-2 text-lg font-bold text-giv-neutral-800',
            )}
          >
            <div>Total GIVpower</div>
            <div className="text-left tabular-nums">
              {totalGivpower == null
                ? '-'
                : formatNumber(totalGivpower, {
                    minDecimals: 2,
                    maxDecimals: 2,
                    locale: 'en-US',
                  })}
            </div>
            <div className="text-left tabular-nums">
              {formatPercent(displayedTotalPercent)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
