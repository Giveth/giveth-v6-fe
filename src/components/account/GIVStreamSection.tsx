'use client'

import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { ArrowRight, Zap } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'
import { formatUnits } from 'viem'
import { DropdownStakeNetworks } from '@/components/account/staking-rewards/DropdownStakeNetworks'
import { STAKING_CHAINS } from '@/lib/constants/staking-power-constants'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { fetchGIVstream } from '@/lib/helpers/stakeHelper'

// The number of milliseconds in a day
const MS_IN_DAY = 86_400_000

/**
 * Format the time remaining for a GIVstream
 *
 * @param ms - The time remaining in milliseconds
 * @returns The formatted time remaining
 */
const formatTimeRemaining = (ms: number) => {
  if (!ms || ms <= 0) return '0 days'

  const totalDays = Math.floor(ms / MS_IN_DAY)
  const years = Math.floor(totalDays / 365)
  const months = Math.floor((totalDays % 365) / 30)
  const days = totalDays % 30

  const parts: string[] = []
  if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`)
  if (months > 0) parts.push(`${months} month${months === 1 ? '' : 's'}`)
  if (days > 0 || parts.length === 0) {
    parts.push(`${days} day${days === 1 ? '' : 's'}`)
  }

  return parts.join(', ')
}

export const GIVStreamSection = () => {
  const account = useActiveAccount()
  const [selectedChain, setSelectedChain] = useState(STAKING_CHAINS[0]?.id ?? 0)
  const [isLoading, setIsLoading] = useState(false)
  const [streamData, setStreamData] = useState({
    flowRatePerWeek: 0n,
    percentComplete: 0,
    timeRemaining: 0,
  })

  useEffect(() => {
    if (!account?.address || !selectedChain) {
      setStreamData({
        flowRatePerWeek: 0n,
        percentComplete: 0,
        timeRemaining: 0,
      })
      return
    }
    let cancelled = false
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchGIVstream(
          account.address as `0x${string}`,
          selectedChain as number,
        )
        if (!cancelled) {
          setStreamData({
            flowRatePerWeek: data.flowRatePerWeek,
            percentComplete: data.percentComplete,
            timeRemaining: data.timeRemaining,
          })
        }
      } catch (error) {
        console.error('Failed to fetch GIVstream:', error)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchData()
    return () => {
      cancelled = true
    }
  }, [account?.address, selectedChain])

  const flowRateLabel = useMemo(() => {
    if (!account?.address || isLoading) return '0.00'
    return formatNumber(formatUnits(streamData.flowRatePerWeek, 18), {
      minDecimals: 2,
      maxDecimals: 2,
    })
  }, [account?.address, isLoading, streamData.flowRatePerWeek])

  const percent = Math.min(
    100,
    Math.max(0, Number(streamData.percentComplete) || 0),
  )

  // Format the percent complete
  const percentLabel = `${Math.round(percent)}%`
  const timeRemainingLabel = formatTimeRemaining(streamData.timeRemaining)

  return (
    <div className="mt-8 rounded-2xl border border-giv-neutral-200 bg-white px-6 py-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 text-giv-neutral-900 font-semibold">
          <Zap className="h-5 w-5 text-giv-neutral-900" />
          <span>GIVstream</span>
        </div>
        <DropdownStakeNetworks
          selectedChain={selectedChain}
          chains={STAKING_CHAINS}
          onSelectChain={setSelectedChain}
        />
      </div>

      <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm text-giv-neutral-700">Your Flowrate</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-giv-neutral-900">
              {flowRateLabel}
            </span>
            <span className="text-sm text-giv-neutral-700 pb-1">GIV/week</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-giv-neutral-700">Time remaining</div>
          <div className="text-base font-semibold text-giv-neutral-900">
            {timeRemainingLabel}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2 rounded-full bg-giv-neutral-200">
          <div
            className="h-2 rounded-full bg-giv-brand-400"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-giv-neutral-700">
          <span>{percentLabel}</span>
          <span>100%</span>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className={clsx(
            'flex items-center gap-2 text-sm font-semibold',
            'text-giv-brand-700 hover:opacity-80 transition-opacity',
          )}
        >
          GIVstream history
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
