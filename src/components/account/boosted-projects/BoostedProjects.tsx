'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { ArrowDown, Lock, LockOpen, Trash2 } from 'lucide-react'
import { type Route } from 'next'
import { useSiweAuth } from '@/context/AuthContext'
import {
  useBoostModalData,
  useSyncPowerBoostingTemp,
  useTotalGivpowerAcrossBoostNetworks,
} from '@/hooks/projectHooks'
import { useUserByAddress } from '@/hooks/useAccount'
import { formatNumber } from '@/lib/helpers/cartHelper'

type SortKey = 'amount' | 'percent'
type SortDirection = 'asc' | 'desc'
type Mode = 'VIEWING' | 'EDITING'
const TABLE_GRID_COLUMNS =
  'grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,0.8fr)_56px]'
const SUM_TOLERANCE = 1e-3

interface IEnhancedPowerBoosting {
  id: string
  percentage: number
  displayValue?: string
  isLocked?: boolean
  isLockable?: boolean
  hasError?: boolean
  project: {
    id: string
    title: string
    slug?: string
  }
}

type BoostedProjectTableRow = {
  id: string
  projectId: number
  title: string
  slug?: string
  amount: number | null
  percent: number
  displayValue?: string
  isLocked?: boolean
  isLockable?: boolean
  hasError?: boolean
}

const calculateBoostSum = (boosts: IEnhancedPowerBoosting[]) =>
  boosts.reduce((acc, boost) => acc + Number(boost.percentage || 0), 0)

const cloneBoosts = (boosts: IEnhancedPowerBoosting[]) =>
  boosts.map(boost => ({
    ...boost,
    project: { ...boost.project },
  }))

const formatInputPercent = (value: number) =>
  Number.isInteger(value) ? `${value}` : Number(value.toFixed(2)).toString()
const roundAllocationPercent = (value: number) => Number(value.toFixed(2))

/**
 * Format a number as a percentage
 * @param value - The value to format as a percentage
 * @returns The formatted percentage
 */
const formatPercent = (value: number) => {
  const minDecimals = Number.isInteger(value) ? 0 : 2
  return `${formatNumber(value, {
    minDecimals,
    maxDecimals: 2,
    locale: 'en-US',
  })}%`
}

export const BoostedProjects = () => {
  const { user, token, walletAddress } = useSiweAuth()
  const { data: userByAddressData, isLoading: isLoadingUserByAddress } =
    useUserByAddress(walletAddress)
  const [mode, setMode] = useState<Mode>('VIEWING')
  const [editBoosts, setEditBoosts] = useState<IEnhancedPowerBoosting[]>([])
  const [initialEditBoosts, setInitialEditBoosts] = useState<
    IEnhancedPowerBoosting[]
  >([])

  const connectedUserId =
    Number(user?.id) ||
    Number(userByAddressData?.userByAddress?.id) ||
    undefined

  // Get the boosted projects data
  const {
    data: boostData,
    isLoading: isLoadingBoostData,
    isFetching: isFetchingBoostData,
    error: boostDataError,
  } = useBoostModalData({
    userId: connectedUserId,
    token,
    enabled: Boolean(connectedUserId),
    take: 200,
    skip: 0,
  })

  const [sortBy, setSortBy] = useState<SortKey>('percent')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionWarning, setActionWarning] = useState<string | null>(null)
  const [pendingProjectId, setPendingProjectId] = useState<number | null>(null)

  // Get the sync power boosting temp mutation
  const { mutateAsync: syncPowerBoostingTemp, isPending: isSyncingBoost } =
    useSyncPowerBoostingTemp({ token })
  const {
    data: totalGivpowerData,
    isLoading: isLoadingTotalGivpower,
    error: totalGivpowerError,
  } = useTotalGivpowerAcrossBoostNetworks({
    walletAddress,
    enabled: Boolean(walletAddress),
  })
  const totalGivpower = totalGivpowerData?.totalBalanceNumber ?? null

  const boostedProjects = useMemo(() => {
    return (boostData?.boostedProjects ?? []).filter(
      item => Number(item.percentage) > 0,
    )
  }, [boostData?.boostedProjects])

  // Get the view rows, this is used to display the boosted projects in the table
  const viewRows = useMemo<BoostedProjectTableRow[]>(() => {
    return boostedProjects
      .map(item => {
        const percent = Number(item.percentage) || 0
        const amount =
          totalGivpower == null ? null : (totalGivpower * percent) / 100
        return {
          id: item.id,
          projectId: Number(item.projectId),
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
  }, [boostedProjects, totalGivpower, sortBy, sortDirection])

  // Get the edit rows, this is used to display the boosted projects in the table
  const editRows = useMemo<BoostedProjectTableRow[]>(() => {
    return editBoosts.map(boost => {
      const percent = Number(boost.percentage) || 0
      const amount =
        totalGivpower == null ? null : (totalGivpower * percent) / 100
      return {
        id: boost.id,
        projectId: Number(boost.project.id),
        title: boost.project.title,
        slug: boost.project.slug,
        amount,
        percent,
        displayValue: boost.displayValue,
        isLocked: Boolean(boost.isLocked),
        isLockable: boost.isLockable !== false,
        hasError: Boolean(boost.hasError),
      }
    })
  }, [editBoosts, totalGivpower])

  // Get the rows, this is used to display the boosted projects in the table
  const rows: BoostedProjectTableRow[] =
    mode === 'EDITING' ? editRows : viewRows
  const viewTotalPercent = useMemo(
    () => viewRows.reduce((acc, row) => acc + row.percent, 0),
    [viewRows],
  )
  const sum = useMemo(() => calculateBoostSum(editBoosts), [editBoosts])

  // Get the displayed total percent, this is used to display the total percent of the boosted projects
  const displayedTotalPercent = mode === 'EDITING' ? sum : viewTotalPercent
  // Get the has edit error, this is used to check if there is an error in the edit boosts
  const hasEditError = editBoosts.some(boost => boost.hasError)
  // Get the has empty input, this is used to check if there is an empty input in the edit boosts
  const hasEmptyInput = editBoosts.some(boost => boost.displayValue === '')
  // Get the is sum at hundred, this is used to check if the sum is at hundred
  const isSumAtHundred = Math.abs(sum - 100) < SUM_TOLERANCE
  // Get the is mutation in flight, this is used to check if there is a mutation in flight
  const isMutationInFlight = isSyncingBoost || pendingProjectId != null
  const isTableReadOnly = isMutationInFlight || isFetchingBoostData
  // Get the can enter edit mode, this is used to check if the user can enter the edit mode
  const canEnterEditMode = viewRows.length >= 2 && !isTableReadOnly
  // Get the can apply changes, this is used to check if the user can apply the changes
  const canApplyChanges =
    mode === 'EDITING' &&
    !isSyncingBoost &&
    !hasEditError &&
    !hasEmptyInput &&
    isSumAtHundred
  const showAllocationWarning =
    mode === 'EDITING' && (!isSumAtHundred || hasEditError || hasEmptyInput)

  // Check if the initial loading is in progress
  const isInitialLoading =
    isLoadingUserByAddress || isLoadingBoostData || isLoadingTotalGivpower

  // Handle the sort event
  const handleSort = (key: SortKey) => {
    if (mode === 'EDITING') return

    if (sortBy === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortBy(key)
    setSortDirection('desc')
  }

  // Handle the start editing event, this is used to start the editing mode
  const handleStartEditing = () => {
    if (!canEnterEditMode) return

    const freshEditBoosts: IEnhancedPowerBoosting[] = viewRows.map(row => ({
      id: row.id,
      percentage: Number(row.percent.toFixed(2)),
      isLocked: false,
      isLockable: true,
      hasError: false,
      project: {
        id: String(row.projectId),
        title: row.title,
        slug: row.slug,
      },
    }))

    setMode('EDITING')
    setEditBoosts(freshEditBoosts)
    setInitialEditBoosts(cloneBoosts(freshEditBoosts))
    setActionError(null)
    setActionWarning(null)
  }

  // Handle the reset all event, this is used to reset all the boosted projects
  const handleResetAll = () => {
    if (isSyncingBoost) return

    const resetBoosts = cloneBoosts(initialEditBoosts)
    setEditBoosts(resetBoosts)
    setActionError(null)
    setActionWarning(null)
  }

  // Handle the cancel editing event, this is used to cancel the editing mode
  const handleCancelEditing = () => {
    if (isSyncingBoost) return

    handleResetAll()
    setMode('VIEWING')
    setEditBoosts([])
    setInitialEditBoosts([])
  }

  // Handle the lock power event, this is used to lock or unlock a boosted project
  const toggleLockPower = (id: string) => {
    if (isSyncingBoost) return

    setEditBoosts(prevBoosts => {
      const tempBoosts = cloneBoosts(prevBoosts)
      let locksCount = 0
      const otherNonLockedBoosts: IEnhancedPowerBoosting[] = []

      for (const boost of tempBoosts) {
        if (boost.id === id) {
          if (boost.isLockable === false) return prevBoosts
          boost.isLocked = !boost.isLocked
        }

        if (boost.isLocked) locksCount++
        else otherNonLockedBoosts.push(boost)
      }

      const isLockable = locksCount < tempBoosts.length - 2
      for (const boost of otherNonLockedBoosts) {
        boost.isLockable = isLockable
      }

      return tempBoosts
    })
  }

  // Handle the percentage change event, this is used to update the percentage of a boosted project
  const onPercentageChange = (
    id: string,
    rawValue: string,
    isOnBlur = false,
  ) => {
    if (isSyncingBoost) return

    let nextRawValue = rawValue.trim()

    // If the input is on blur, we need to validate the input
    if (isOnBlur) {
      if (nextRawValue === '') nextRawValue = '0'
      else {
        setEditBoosts(prevBoosts =>
          prevBoosts.map(boost =>
            boost.id === id ? { ...boost, displayValue: undefined } : boost,
          ),
        )
        return
      }
    }

    // If the input is empty, we need to set the display value to an empty string
    // This is used to clear the input
    if (nextRawValue === '') {
      setEditBoosts(prevBoosts =>
        prevBoosts.map(boost =>
          boost.id === id ? { ...boost, displayValue: '' } : boost,
        ),
      )
      return
    }

    // Validate the new percentage
    const newPercentage = Number(nextRawValue)
    if (
      !Number.isFinite(newPercentage) ||
      newPercentage < 0 ||
      newPercentage > 100
    ) {
      return
    }
    const normalizedNewPercentage = roundAllocationPercent(newPercentage)

    // Update the boosted projects, this is used to update the percentage of a boosted project
    // This is a side effect, so we need to use a function to update the state
    // We need to clone the boosts to avoid mutating the original state
    setEditBoosts(prevBoosts => {
      const tempBoosts = cloneBoosts(prevBoosts)
      let changedBoost: IEnhancedPowerBoosting | undefined
      const otherNonLockedBoosts: IEnhancedPowerBoosting[] = []
      let sumOfUnlocks = 0
      let sumOfLocks = 0

      for (const boost of tempBoosts) {
        boost.hasError = false
        boost.displayValue = undefined

        if (boost.id === id) {
          changedBoost = boost
          changedBoost.percentage = normalizedNewPercentage
          changedBoost.displayValue = nextRawValue
          sumOfUnlocks += normalizedNewPercentage
        } else if (!boost.isLocked) {
          otherNonLockedBoosts.push(boost)
          sumOfUnlocks += Number(boost.percentage)
        } else {
          sumOfLocks += Number(boost.percentage)
        }
      }

      if (!changedBoost) return tempBoosts

      const free = 100 - sumOfLocks
      if (normalizedNewPercentage > free) {
        changedBoost.hasError = true
        return tempBoosts
      }

      const diff = 100 - (sumOfLocks + sumOfUnlocks)
      const sumOfOtherUnlocks = sumOfUnlocks - normalizedNewPercentage
      const evenSplitRate =
        otherNonLockedBoosts.length > 0 ? 1 / otherNonLockedBoosts.length : 0
      for (const boost of otherNonLockedBoosts) {
        const rate =
          sumOfOtherUnlocks !== 0
            ? Number(boost.percentage) / sumOfOtherUnlocks
            : evenSplitRate
        boost.percentage = roundAllocationPercent(
          Number(boost.percentage) + rate * diff,
        )
      }

      // Keep editor math stable by assigning any post-rounding remainder
      // into one adjustable row so total stays exactly 100.
      const roundingRemainder = roundAllocationPercent(
        100 - calculateBoostSum(tempBoosts),
      )
      const remainderTarget = otherNonLockedBoosts[0] ?? changedBoost
      if (remainderTarget && roundingRemainder !== 0) {
        remainderTarget.percentage = roundAllocationPercent(
          Number(remainderTarget.percentage) + roundingRemainder,
        )
      }

      return tempBoosts
    })
  }

  // Handle the apply changes event, this is used to apply the changes to the boosted projects
  const handleApplyChanges = async () => {
    if (!canApplyChanges || !editBoosts.length) return

    setActionError(null)
    setActionWarning(null)

    try {
      const boostsToSave = cloneBoosts(editBoosts)
      const percentages = boostsToSave.map(boost => Number(boost.percentage))
      const projectIds = boostsToSave.map(boost => Number(boost.project.id))

      let indexOfMax = 0
      let sumOfPercentages = 0
      for (let i = 0; i < percentages.length; i++) {
        if (percentages[i] > percentages[indexOfMax]) indexOfMax = i
        sumOfPercentages += percentages[i]
      }

      const floatingError = 100 - sumOfPercentages
      if (Math.abs(floatingError) > 0.00001) {
        percentages[indexOfMax] += floatingError
      }

      await syncPowerBoostingTemp({
        projectIds,
        percentages,
      })

      setMode('VIEWING')
      setEditBoosts([])
      setInitialEditBoosts([])
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Failed to save allocations',
      )
    }
  }

  // Handle the remove boost event
  const handleRemoveBoost = async (projectId: number) => {
    if (isTableReadOnly || mode === 'EDITING') return

    setActionError(null)
    if (viewRows.length <= 1) {
      setActionWarning(
        "You can't remove your GIVpower from this project because it is the only boost you have. Please boost another project with GIVpower before continuing.",
      )
      return
    }
    setActionWarning(null)
    setPendingProjectId(projectId)

    try {
      await syncPowerBoostingTemp({
        projectIds: [projectId],
        percentages: [0],
      })
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Failed to remove boost',
      )
    } finally {
      setPendingProjectId(null)
    }
  }

  // Check if the wallet is connected
  if (!walletAddress) {
    return (
      <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
        <p className="text-center text-xl text-giv-neutral-700 font-medium">
          Connect your wallet to view boosted projects.
        </p>
      </div>
    )
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

  if (boostDataError) {
    return (
      <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
        <div className="rounded-xl border border-giv-error-400 bg-giv-error-100 p-4 text-giv-error-400">
          {boostDataError instanceof Error
            ? boostDataError.message
            : 'Failed to load boosted projects'}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-giv-neutral-900">
          GIVpower Summary
        </h2>

        {mode === 'EDITING' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetAll}
              disabled={isSyncingBoost}
              className={clsx(
                'w-auto py-3 px-4 rounded-md text-sm font-bold',
                'border border-giv-neutral-300 text-giv-neutral-700',
                isSyncingBoost
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:opacity-80 cursor-pointer',
              )}
            >
              Reset All
            </button>
            <button
              type="button"
              onClick={handleApplyChanges}
              disabled={!canApplyChanges}
              className={clsx(
                'w-auto py-3 px-4 rounded-md text-sm font-bold',
                'bg-giv-brand-300! text-white! border border-giv-brand-300!',
                canApplyChanges
                  ? 'hover:bg-giv-brand-400! cursor-pointer'
                  : 'opacity-60 cursor-not-allowed',
              )}
            >
              {isSyncingBoost ? 'Applying...' : 'Apply Changes'}
            </button>
            <button
              type="button"
              onClick={handleCancelEditing}
              disabled={isSyncingBoost}
              className={clsx(
                'w-auto py-3 px-4 rounded-md text-sm font-bold',
                'border border-giv-neutral-300 text-giv-neutral-700',
                isSyncingBoost
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:opacity-80 cursor-pointer',
              )}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartEditing}
            disabled={!canEnterEditMode}
            className={clsx(
              'w-auto py-3 px-8 bg-giv-brand-050! text-giv-brand-700! rounded-md text-sm font-bold',
              'border border-giv-brand-100! text-giv-brand-700!',
              'flex items-center justify-center gap-2',
              canEnterEditMode
                ? 'hover:opacity-80 cursor-pointer'
                : 'opacity-60 cursor-not-allowed',
            )}
          >
            Modify
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-giv-neutral-300 p-8 text-center">
          <p className="text-lg font-medium text-giv-neutral-700">
            You have no boosted projects yet.
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
              className={clsx(
                'w-full inline-flex items-center justify-start gap-2',
                mode === 'EDITING' ? 'cursor-default' : 'cursor-pointer',
              )}
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
              className={clsx(
                'w-full inline-flex items-center justify-start gap-2',
                mode === 'EDITING' ? 'cursor-default' : 'cursor-pointer',
              )}
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
            <div />
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
                {mode === 'EDITING' ? (
                  <div>
                    <div className="inline-flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        disabled={isSyncingBoost}
                        value={
                          row.displayValue ?? formatInputPercent(row.percent)
                        }
                        onChange={event =>
                          onPercentageChange(row.id, event.target.value)
                        }
                        onBlur={event =>
                          onPercentageChange(row.id, event.target.value, true)
                        }
                        className={clsx(
                          'w-20 rounded-md border px-2 py-1 text-left text-base tabular-nums',
                          row.hasError
                            ? 'border-giv-error-400 bg-giv-error-100 text-giv-error-400'
                            : 'border-giv-neutral-300 text-giv-neutral-800',
                          isSyncingBoost && 'opacity-60 cursor-not-allowed',
                        )}
                        aria-label={`Allocation percentage for ${row.title}`}
                      />
                      <span>%</span>
                      <button
                        type="button"
                        onClick={() => toggleLockPower(row.id)}
                        disabled={
                          isSyncingBoost || (!row.isLocked && !row.isLockable)
                        }
                        className={clsx(
                          'inline-flex items-center justify-center rounded-md border p-1 transition-colors',
                          row.isLocked
                            ? 'border-giv-brand-300 text-giv-brand-500 bg-giv-brand-050'
                            : 'border-giv-neutral-300 text-giv-neutral-700',
                          (isSyncingBoost ||
                            (!row.isLocked && !row.isLockable)) &&
                            'opacity-50 cursor-not-allowed',
                          !isSyncingBoost &&
                            (row.isLocked || row.isLockable) &&
                            'hover:opacity-80',
                        )}
                        aria-label={
                          row.isLocked
                            ? `Unlock ${row.title} percentage`
                            : `Lock ${row.title} percentage`
                        }
                        title={
                          row.isLocked ? 'Unlock percentage' : 'Lock percentage'
                        }
                      >
                        {row.isLocked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <LockOpen className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {row.hasError && (
                      <p className="mt-1 text-xs text-giv-error-400">
                        Exceeds available allocation budget.
                      </p>
                    )}
                  </div>
                ) : (
                  formatPercent(row.percent)
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveBoost(row.projectId)}
                disabled={mode === 'EDITING' || isTableReadOnly}
                className={clsx(
                  'inline-flex items-center justify-center rounded-xl border px-3 py-2 transition-colors',
                  'border-giv-brand-100 text-giv-brand-500',
                  mode === 'EDITING' || isTableReadOnly
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:opacity-80 cursor-pointer',
                )}
                aria-label={`Remove boost for ${row.title}`}
                title="Remove boost"
              >
                <Trash2 className="w-5 h-5" />
              </button>
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
            <div />
          </div>
        </div>
      )}

      {showAllocationWarning && (
        <div className="mt-4 rounded-xl border border-giv-warning-400 bg-giv-warning-100 p-4 text-giv-warning-800">
          Total allocation must stay at 100% before applying changes.
        </div>
      )}

      {actionWarning && (
        <div className="mt-4 rounded-xl border border-giv-warning-400 bg-giv-warning-100 p-4 text-giv-warning-800">
          {actionWarning}
        </div>
      )}

      {(actionError || totalGivpowerError) && (
        <div className="mt-4 rounded-xl border border-giv-error-400 bg-giv-error-100 p-4 text-giv-error-400">
          {actionError ||
            (totalGivpowerError instanceof Error
              ? totalGivpowerError.message
              : 'Failed to load total GIVpower')}
        </div>
      )}

      {isFetchingBoostData && (
        <p className="mt-4 text-sm text-giv-neutral-600">Updating list...</p>
      )}
    </div>
  )
}
