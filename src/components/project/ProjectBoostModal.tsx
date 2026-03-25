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
  useSyncPowerBoostingTemp,
  useTotalGivpowerAcrossBoostNetworks,
} from '@/hooks/projectHooks'
import { useUserByAddress } from '@/hooks/useAccount'
import { givpowerDocLink, myGIVPowerLink } from '@/lib/constants/menu-links'
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
  const { mutateAsync: syncPowerBoostingTemp, isPending: isSubmittingBoost } =
    useSyncPowerBoostingTemp({ token })
  const { data: userByAddressData } = useUserByAddress(
    open ? walletAddress : undefined,
  )
  const connectedUserId =
    Number(user?.id) ||
    Number(userByAddressData?.userByAddress?.id) ||
    undefined
  const { data: totalGivpowerData } = useTotalGivpowerAcrossBoostNetworks({
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

  const [allocationPercent, setAllocationPercent] = useState(0)
  const [hasUserAdjustedAllocation, setHasUserAdjustedAllocation] =
    useState(false)

  // Keep slider synced from backend until user starts changing it.
  useEffect(() => {
    if (!open) {
      setHasUserAdjustedAllocation(false)
      return
    }
    if (!hasUserAdjustedAllocation) {
      setAllocationPercent(fetchedAllocationPercent)
    }
  }, [open, fetchedAllocationPercent, hasUserAdjustedAllocation])

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
    if (allocationPercent <= 0) return

    setSubmitBoostError(null)

    // Sync the power boosting temp
    try {
      await syncPowerBoostingTemp({
        projectId,
        percentage: allocationPercent,
      })
      setConfirmedAllocationPercent(allocationPercent)
      setShowBoostSuccess(true)
    } catch (error) {
      console.error('[Boost][Modal] confirm failed', error)
      setSubmitBoostError(
        error instanceof Error ? error.message : 'Failed to submit boost',
      )
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

  // Check if the confirm button is disabled
  const isConfirmDisabled =
    allocationPercent <= 0 ||
    isSwitchingNetwork ||
    needsNetworkSwitch ||
    isSubmittingBoost ||
    !isAuthenticated
  const isFullAllocationWarning = allocationPercent === 100
  const requiresAuth = Boolean(walletAddress) && !isAuthenticated

  // Display the total GIVpower
  const displayTotalGivpower = formatGivpowerDisplay(
    totalGivpower ?? totalGivpowerData?.totalBalance,
  )

  // Parse the total GIVpower value
  const totalGivpowerValue = parseGivpowerValue(
    totalGivpower ?? totalGivpowerData?.totalBalance,
  )

  // Calculate the allocated GIVpower value
  const allocatedGivpowerValue =
    totalGivpowerValue == null
      ? null
      : (totalGivpowerValue * allocationPercent) / 100
  const displayAllocationLabel =
    allocationPercent > 0 && allocatedGivpowerValue != null
      ? `~${formatNumber(allocatedGivpowerValue, {
          minDecimals: 2,
          maxDecimals: 2,
          locale: 'en-US',
        })} GIVpower`
      : 'Drag to allocate.'
  const displayBoostedProjects =
    boostedProjects ?? boostModalData?.boostedProjectsCount ?? 0

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
                target={myGIVPowerLink.target}
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
                      target={myGIVPowerLink.target}
                      className="font-bold hover:underline"
                    >
                      My GIVpower
                    </Link>
                  </p>
                </div>

                <div className="mt-8">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={allocationPercent}
                    onChange={event => {
                      setHasUserAdjustedAllocation(true)
                      setAllocationPercent(Number(event.target.value))
                    }}
                    style={
                      { '--percent': `${allocationPercent}%` } as CSSProperties
                    }
                    className="mt-3 w-full giv-range"
                    aria-label="Boost allocation percentage"
                  />
                  <p className="mt-8 text-center text-xl font-bold text-giv-neutral-600">
                    {displayAllocationLabel}
                  </p>
                  {allocationPercent > 0 && (
                    <p className="mt-2 text-center text-lg font-medium text-giv-neutral-600">
                      ({allocationPercent}%)
                    </p>
                  )}
                </div>
              </div>
            )}

            {!requiresAuth && (
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
                  target={myGIVPowerLink.target}
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
