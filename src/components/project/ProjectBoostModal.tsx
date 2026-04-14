'use client'

import { type CSSProperties, useEffect, useState } from 'react'
import Link from 'next/link'
import { Dialog } from '@radix-ui/themes'
import clsx from 'clsx'
import { X } from 'lucide-react'
import { type Route } from 'next'
import { defineChain } from 'thirdweb'
import {
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from 'thirdweb/react'
import { HelpTooltip } from '@/components/HelpTooltip'
import { IconBoost } from '@/components/icons/IconBoost'
import { useSiweAuth } from '@/context/AuthContext'
import {
  useBoostModalData,
  useSetPowerBoosting,
  useTotalGivpowerAcrossBoostNetworks,
} from '@/hooks/projectHooks'
import { useUserByAddress } from '@/hooks/useAccount'
import {
  getGIVpowerLink,
  givpowerDocLink,
  myGIVPowerLink,
} from '@/lib/constants/menu-links'
import { formatNumber } from '@/lib/helpers/cartHelper'

// Chain IDs with active GIVpower staking support for boost modal gating
const BOOST_ENABLED_NETWORKS = [10, 100] as const
// Default network to switch to when the user is not on a supported network
const DEFAULT_BOOST_NETWORK = 10

const formatGivpowerDisplay = (value?: string | null): string => {
  if (!value) return '-'

  const normalizedValue = value.replaceAll(',', '').trim()
  if (!normalizedValue || normalizedValue === '-') return '-'

  return formatNumber(normalizedValue, {
    minDecimals: 2,
    maxDecimals: 2,
    locale: 'en-US',
  })
}

const parseGivpowerValue = (value?: string | null): number | null => {
  if (!value) return null

  const normalizedValue = value.replaceAll(',', '').trim()
  if (!normalizedValue || normalizedValue === '-') return null

  const parsed = Number(normalizedValue)
  return Number.isFinite(parsed) ? parsed : null
}

const getBoostSubmitErrorMessage = (error: unknown): string => {
  const rawMessage =
    error instanceof Error ? error.message : 'Failed to submit boost'

  if (
    rawMessage.includes('First boosted project percentage must be exactly 100')
  ) {
    return 'For your first (or only) boosted project, allocation must be exactly 100%.'
  }

  return rawMessage
}

type ProjectBoostModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: number
  totalGivpower?: string
  boostedProjects?: number
}

export default function ProjectBoostModal({
  open,
  onOpenChange,
  projectId,
  totalGivpower,
  boostedProjects,
}: ProjectBoostModalProps) {
  const { user, token, walletAddress, isAuthenticated, signIn, isLoading } =
    useSiweAuth()
  const activeChain = useActiveWalletChain()
  const switchChain = useSwitchActiveWalletChain()
  const [showBoostSuccess, setShowBoostSuccess] = useState(false)
  const [confirmedAllocationPercent, setConfirmedAllocationPercent] =
    useState(0)
  const [submitBoostError, setSubmitBoostError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)
  const [switchNetworkError, setSwitchNetworkError] = useState<string | null>(
    null,
  )
  const { mutateAsync: setPowerBoosting, isPending: isSubmittingBoost } =
    useSetPowerBoosting({ token })
  const { data: userByAddressData } = useUserByAddress(
    open ? walletAddress : undefined,
  )
  const connectedUserId =
    Number(user?.id) ||
    Number(userByAddressData?.userByAddress?.id) ||
    undefined
  const {
    data: totalGivpowerData,
    isLoading: isLoadingTotalGivpower,
    isError: isTotalGivpowerError,
    error: totalGivpowerError,
    refetch: refetchTotalGivpower,
  } = useTotalGivpowerAcrossBoostNetworks({
    walletAddress,
    enabled: open && !totalGivpower,
  })

  // Get the data for the boost modal
  const { data: boostModalData } = useBoostModalData({
    userId: connectedUserId,
    currentProjectId: projectId,
    token,
    enabled: open,
  })

  // Get the allocation percentage for the current project
  const fetchedAllocationPercent = Math.max(
    0,
    Math.min(100, Number(boostModalData?.currentProjectAllocation ?? 0) || 0),
  )
  const normalizedProjectId = Number(projectId)
  const hasValidProjectId =
    Number.isFinite(normalizedProjectId) && normalizedProjectId > 0
  const activeBoostedProjects =
    boostModalData?.boostedProjects?.filter(
      boost => Number(boost.percentage || 0) > 0,
    ) ?? []
  const activeBoostedProjectsCount = activeBoostedProjects.length
  const hasLoadedBoostData = Boolean(boostModalData)
  const hasCurrentProjectActiveBoost =
    hasLoadedBoostData &&
    hasValidProjectId &&
    activeBoostedProjects.some(
      boost => Number(boost.projectId) === normalizedProjectId,
    )
  const hasOtherActiveBoosts = hasLoadedBoostData
    ? hasValidProjectId
      ? activeBoostedProjects.some(
          boost => Number(boost.projectId) !== normalizedProjectId,
        )
      : activeBoostedProjectsCount > 0
    : false
  const displayBoostedProjects =
    boostedProjects ?? (hasLoadedBoostData ? activeBoostedProjectsCount : 0)
  const isFirstBoostForUser =
    hasLoadedBoostData && activeBoostedProjectsCount === 0
  const isOnlyBoostedProjectCurrent =
    hasLoadedBoostData &&
    activeBoostedProjectsCount === 1 &&
    hasCurrentProjectActiveBoost
  const requiresHundredPercentAllocation =
    isFirstBoostForUser || isOnlyBoostedProjectCurrent

  const [allocationPercent, setAllocationPercent] = useState(0)
  const [hasUserAdjustedAllocation, setHasUserAdjustedAllocation] =
    useState(false)

  // Keep slider synced from backend until user starts changing it.
  useEffect(() => {
    if (!open) {
      setHasUserAdjustedAllocation(false)
      return
    }
    if (requiresHundredPercentAllocation) {
      setAllocationPercent(100)
      return
    }
    if (!hasUserAdjustedAllocation) {
      setAllocationPercent(fetchedAllocationPercent)
    }
  }, [
    open,
    fetchedAllocationPercent,
    hasUserAdjustedAllocation,
    requiresHundredPercentAllocation,
  ])

  // Handle the open change event
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setShowBoostSuccess(false)
      setConfirmedAllocationPercent(0)
      setSubmitBoostError(null)
      setHasUserAdjustedAllocation(false)
    }
    onOpenChange(nextOpen)
  }

  // Handle the confirm boost event
  const handleConfirmBoost = async () => {
    if (isSubmittingBoost) return
    if (!projectId || projectId <= 0) {
      setSubmitBoostError('Missing project id for boost submission')
      return
    }
    const percentageToSubmit = requiresHundredPercentAllocation
      ? 100
      : allocationPercent
    if (percentageToSubmit <= 0) return

    setSubmitBoostError(null)

    try {
      await setPowerBoosting({
        projectId,
        percentage: percentageToSubmit,
      })
      setConfirmedAllocationPercent(percentageToSubmit)
      setShowBoostSuccess(true)
    } catch (error) {
      console.error('[Boost][Modal] confirm failed', error)
      setSubmitBoostError(getBoostSubmitErrorMessage(error))
    }
  }

  // Handle the sign in event
  const handleSignIn = async () => {
    if (isSigningIn) return
    setSubmitBoostError(null)
    setIsSigningIn(true)
    try {
      await signIn()
    } catch (error) {
      console.error('[Boost][Modal] sign-in failed', error)
      setSubmitBoostError(
        error instanceof Error ? error.message : 'Authentication failed',
      )
    } finally {
      setIsSigningIn(false)
    }
  }

  // Check if the current network is supported for boosting
  const currentChainId = activeChain?.id
  const isBoostNetworkSupported =
    currentChainId != null
      ? BOOST_ENABLED_NETWORKS.includes(
          currentChainId as (typeof BOOST_ENABLED_NETWORKS)[number],
        )
      : false
  const needsNetworkSwitch =
    currentChainId != null && !isBoostNetworkSupported && open

  // Ensure the network is supported for boosting
  useEffect(() => {
    let cancelled = false

    const ensureBoostNetwork = async () => {
      if (!needsNetworkSwitch) return
      setSwitchNetworkError(null)
      setIsSwitchingNetwork(true)

      try {
        await switchChain(defineChain(DEFAULT_BOOST_NETWORK))
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : 'Network switch failed'
          setSwitchNetworkError(message)
        }
      } finally {
        if (!cancelled) setIsSwitchingNetwork(false)
      }
    }

    ensureBoostNetwork()

    return () => {
      cancelled = true
    }
  }, [needsNetworkSwitch, switchChain])

  const requiresAuth = Boolean(walletAddress) && !isAuthenticated
  const shouldResolveTotalGivpower = open && !requiresAuth && !totalGivpower
  const resolvedTotalGivpower = totalGivpower ?? totalGivpowerData?.totalBalance
  const hasTotalGivpowerQueryError =
    shouldResolveTotalGivpower &&
    !resolvedTotalGivpower &&
    !isLoadingTotalGivpower &&
    isTotalGivpowerError
  const isResolvingTotalGivpower =
    shouldResolveTotalGivpower &&
    !resolvedTotalGivpower &&
    !hasTotalGivpowerQueryError &&
    isLoadingTotalGivpower

  // Display the total GIVpower
  const displayTotalGivpower = formatGivpowerDisplay(resolvedTotalGivpower)

  // Parse the total GIVpower value
  const totalGivpowerValue = parseGivpowerValue(resolvedTotalGivpower)
  const hasNoGivpower =
    !requiresAuth &&
    !isResolvingTotalGivpower &&
    !isLoadingTotalGivpower &&
    totalGivpowerValue != null &&
    totalGivpowerValue <= 0

  // Check if the confirm button is disabled
  const effectiveAllocationPercent = requiresHundredPercentAllocation
    ? 100
    : allocationPercent
  const isConfirmDisabled =
    effectiveAllocationPercent <= 0 ||
    isResolvingTotalGivpower ||
    hasTotalGivpowerQueryError ||
    hasNoGivpower ||
    isSwitchingNetwork ||
    needsNetworkSwitch ||
    isSubmittingBoost ||
    !isAuthenticated
  const isFullAllocationWarning =
    effectiveAllocationPercent === 100 && hasOtherActiveBoosts

  // Calculate the allocated GIVpower value
  const allocatedGivpowerValue =
    totalGivpowerValue == null
      ? null
      : (totalGivpowerValue * effectiveAllocationPercent) / 100
  const displayAllocationLabel =
    effectiveAllocationPercent > 0 && allocatedGivpowerValue != null
      ? `~${formatNumber(allocatedGivpowerValue, {
          minDecimals: 2,
          maxDecimals: 2,
          locale: 'en-US',
        })} GIVpower`
      : 'Drag to allocate.'
  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          right: 0,
          left: 'auto',
          transform: 'none',
          height: '100dvh',
          paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
        }}
        className={clsx(
          'z-50 w-[95vw]! md:w-[480px]! md:max-w-[480px]!',
          'flex flex-col overflow-hidden',
          'bg-white px-4! md:px-6! pt-6!',
          'rounded-none! md:rounded-l-2xl! rounded-r-none!',
        )}
      >
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-giv-neutral-900">
            <IconBoost width={20} height={20} fill="var(--giv-neutral-900)" />
            <Dialog.Title className="m-0! text-3xl font-bold">
              Boost
            </Dialog.Title>
          </div>
          <Dialog.Close
            aria-label="Close"
            className="text-giv-neutral-900 transition cursor-pointer hover:text-giv-neutral-700"
          >
            <X className="h-6 w-6" />
          </Dialog.Close>
        </div>

        {showBoostSuccess ? (
          <>
            <div className="mt-10 overflow-y-auto text-center">
              <p className="text-4xl font-bold text-giv-neutral-900">
                Project boosted!
              </p>
              <p className="mt-8 text-2xl leading-relaxed text-giv-neutral-900">
                Nice, You boosted this project with{' '}
                <span className="font-bold text-giv-brand-500">{`${confirmedAllocationPercent}%`}</span>{' '}
                of your GIVpower.
              </p>
              <p
                className={clsx(
                  'rounded-xl border p-6 mt-6 text-base mb-6',
                  'border-giv-brand-200 bg-giv-neutral-200 text-giv-neutral-700',
                )}
              >
                Keep an eye on the projects page, its position in the default
                sort will change within 5 minutes or less.
              </p>
            </div>
            <div className="pt-10">
              <a
                href={givpowerDocLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  'w-full mt-auto py-3 px-8 bg-giv-brand-300! text-white! rounded-md text-sm font-bold',
                  'border-none! focus:outline-none!',
                  'flex items-center justify-center gap-2 transition-colors cursor-pointer',
                  'hover:bg-giv-brand-400!',
                  'hover:opacity-80!',
                )}
              >
                Get More GIVpower
              </a>
              <Link
                href={myGIVPowerLink.href as Route}
                className="mt-6 inline-flex w-full items-center justify-center text-giv-brand-500! text-sm font-bold hover:opacity-80!"
              >
                See Your GIVpower Allocations
              </Link>
            </div>
          </>
        ) : (
          <>
            {requiresAuth ? (
              <div className="mt-12 overflow-y-auto flex-1">
                <div className="rounded-xl border border-giv-brand-200 bg-giv-neutral-200 p-6 text-center">
                  <p className="text-xl font-bold text-giv-neutral-900">
                    Please sign in to boost
                  </p>
                  <p className="mt-2 text-base text-giv-neutral-700">
                    Sign with your wallet first, then you can allocate your
                    GIVpower to this project.
                  </p>
                </div>
                {submitBoostError && (
                  <div className="mt-6 rounded-xl border border-giv-error-400 bg-giv-error-100 p-4 text-sm text-giv-error-400">
                    {submitBoostError}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn || isLoading}
                  className={clsx(
                    'w-full mt-8 py-3 px-8 bg-giv-brand-300! text-white! rounded-md text-sm font-bold',
                    'border-none! focus:outline-none!',
                    'flex items-center justify-center gap-2 transition-colors cursor-pointer',
                    !(isSigningIn || isLoading) && 'hover:bg-giv-brand-400!',
                    (isSigningIn || isLoading) &&
                      'opacity-60 cursor-not-allowed',
                  )}
                >
                  {isSigningIn || isLoading ? 'Signing in...' : 'Sign wallet'}
                </button>
              </div>
            ) : isResolvingTotalGivpower ? (
              <div className="mt-12 overflow-y-auto flex-1">
                <div className="rounded-xl border border-giv-brand-200 bg-giv-neutral-200 p-6 text-center">
                  <p className="text-xl font-bold text-giv-neutral-900">
                    Checking your GIVpower...
                  </p>
                  <p className="mt-2 text-base text-giv-neutral-700">
                    We are loading your balance before enabling boost.
                  </p>
                </div>
              </div>
            ) : hasTotalGivpowerQueryError ? (
              <div className="mt-12 overflow-y-auto flex-1">
                <div className="rounded-xl border border-giv-error-400 bg-giv-error-100 p-6 text-center">
                  <p className="text-xl font-bold text-giv-neutral-900">
                    Couldn&apos;t load your GIVpower
                  </p>
                  <p className="mt-2 text-base text-giv-neutral-700">
                    {totalGivpowerError instanceof Error
                      ? totalGivpowerError.message
                      : 'Please try again.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void refetchTotalGivpower()}
                  className={clsx(
                    'w-full mt-8 py-3 px-8 bg-giv-brand-300! text-white! rounded-md text-sm font-bold',
                    'border-none! focus:outline-none!',
                    'flex items-center justify-center gap-2 transition-colors cursor-pointer',
                    'hover:bg-giv-brand-400!',
                    'hover:opacity-80!',
                  )}
                >
                  Try Again
                </button>
              </div>
            ) : hasNoGivpower ? (
              <div className="mt-10 overflow-y-auto flex-1 text-center">
                <p className="text-3xl font-bold text-giv-neutral-900">
                  You don&apos;t have any GIVpower!
                </p>
                <p className="mt-3 text-xl leading-relaxed text-giv-neutral-900">
                  Stake and lock your GIV to get GIVpower.
                </p>
                <div className="mt-10">
                  <a
                    href={getGIVpowerLink.href}
                    className={clsx(
                      'w-full mt-auto py-3 px-8 bg-giv-brand-300! text-white! rounded-md text-sm font-bold',
                      'border-none! focus:outline-none!',
                      'flex items-center justify-center gap-2 transition-colors cursor-pointer',
                      'hover:bg-giv-brand-400!',
                      'hover:opacity-80!',
                    )}
                  >
                    {getGIVpowerLink.label}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleOpenChange(false)}
                    className="mt-6 inline-flex w-full items-center justify-center text-giv-brand-300! text-sm font-bold hover:opacity-80 cursor-pointer"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 overflow-y-auto">
                {isSwitchingNetwork && (
                  <div className="rounded-xl border border-giv-brand-400 bg-giv-brand-100 p-4 text-sm text-giv-brand-700 mb-4">
                    Unsupported network detected. Switching to Optimism...
                  </div>
                )}
                {switchNetworkError && (
                  <div className="rounded-xl border border-giv-error-400 bg-giv-error-100 p-4 text-sm text-giv-error-400 mb-4">
                    Could not switch to Optimism automatically. Please switch
                    wallet network to Optimism, Gnosis, or Polygon zkEVM.
                  </div>
                )}

                <div className="rounded-xl border border-giv-neutral-300 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-giv-neutral-700 text-base">
                      Total GIVpower
                    </span>
                    <div className="inline-flex items-start gap-2 text-giv-neutral-700">
                      <span className="text-xl leading-none font-bold">
                        {displayTotalGivpower}
                      </span>
                      <HelpTooltip
                        text="Get more GIVpower by staking & locking more GIV tokens."
                        className="py-0.5! px-1.5! bg-giv-neutral-700!"
                        width={1}
                        height={1}
                        fontSize="text-[9px]"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-1.5 text-giv-neutral-900 text-base font-medium">
                      <span>Boosted Projects</span>
                      <HelpTooltip
                        text="This is the number of projects you have boosted before"
                        className="py-0.5! px-1.5! bg-giv-neutral-700!"
                        width={1}
                        height={1}
                        fontSize="text-[9px]"
                      />
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-giv-neutral-900">
                      <IconBoost
                        width={20}
                        height={20}
                        fill="var(--giv-brand-500)"
                      />
                      <span className="text-2xl font-semibold">
                        {displayBoostedProjects}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={clsx(
                    'rounded-xl border p-6 mt-6 text-base mb-6',
                    isFullAllocationWarning
                      ? 'border-giv-warning-400 bg-giv-warning-100 text-giv-warning-800'
                      : 'border-giv-brand-200 bg-giv-neutral-200 text-giv-neutral-700',
                  )}
                >
                  {isFullAllocationWarning ? (
                    <>
                      <p className="font-bold">Are you sure?</p>
                      <p className="mt-2">
                        If you boost this project with 100% of your GIVpower,
                        you will remove your GIVpower from all the other
                        projects you boosted.
                      </p>
                    </>
                  ) : (
                    <p>
                      When you allocate a percentage of your total GIVpower to
                      this project, the GIVpower you have on other projects will
                      decrease proportionally.
                    </p>
                  )}
                  <p className="mt-2">
                    You can review and manage your GIVpower allocations in{' '}
                    <Link
                      href={myGIVPowerLink.href as Route}
                      className="font-bold hover:underline"
                    >
                      My GIVpower
                    </Link>
                  </p>
                </div>

                <div className="mt-8">
                  {requiresHundredPercentAllocation && (
                    <p className="mb-3 text-sm font-medium text-giv-warning-800">
                      For your first (or only) boosted project, allocation must
                      be 100%.
                    </p>
                  )}
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={effectiveAllocationPercent}
                    disabled={requiresHundredPercentAllocation}
                    onChange={event => {
                      if (requiresHundredPercentAllocation) return
                      setHasUserAdjustedAllocation(true)
                      setAllocationPercent(Number(event.target.value))
                    }}
                    style={
                      {
                        '--percent': `${effectiveAllocationPercent}%`,
                      } as CSSProperties
                    }
                    className="mt-3 w-full giv-range"
                    aria-label="Boost allocation percentage"
                  />
                  <p className="mt-8 text-center text-xl font-bold text-giv-neutral-600">
                    {displayAllocationLabel}
                  </p>
                  {effectiveAllocationPercent > 0 && (
                    <p className="mt-2 text-center text-lg font-medium text-giv-neutral-600">
                      ({effectiveAllocationPercent}%)
                    </p>
                  )}
                </div>
              </div>
            )}

            {!requiresAuth &&
              !isResolvingTotalGivpower &&
              !hasTotalGivpowerQueryError &&
              !hasNoGivpower && (
                <div className="pt-10">
                  {submitBoostError && (
                    <div className="mb-4 rounded-xl border border-giv-error-400 bg-giv-error-100 p-4 text-sm text-giv-error-400">
                      {submitBoostError}
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={isConfirmDisabled}
                    onClick={handleConfirmBoost}
                    className={clsx(
                      'w-full mt-auto py-3 px-8 bg-giv-brand-300! text-white! rounded-md text-sm font-bold',
                      'border-none! focus:outline-none!',
                      'flex items-center justify-center gap-2 transition-colors cursor-pointer',
                      !isConfirmDisabled && 'hover:bg-giv-brand-400!',
                      isConfirmDisabled && 'opacity-60 cursor-not-allowed',
                    )}
                  >
                    {isSubmittingBoost ? 'Confirming...' : 'Confirm'}
                  </button>
                  <Link
                    href={myGIVPowerLink.href as Route}
                    className="mt-4 inline-flex w-full items-center justify-center text-giv-brand-500! text-sm font-bold hover:opacity-80!"
                  >
                    Manage your GIVpower
                  </Link>
                </div>
              )}
          </>
        )}
      </Dialog.Content>
    </Dialog.Root>
  )
}
