'use client'

import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'
import { formatUnits } from 'viem'
import { GIVStreamHistoryModal } from '@/components/account/GIVStreamHistoryModal'
import { DropdownStakeNetworks } from '@/components/account/staking-rewards/DropdownStakeNetworks'
import { IconFlash } from '@/components/icons/IconFlash'
import {
  STAKING_CHAINS,
  STAKING_POOLS,
} from '@/lib/constants/staking-power-constants'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { fetchGIVstream } from '@/lib/helpers/stakeHelper'

const formatTimeRemaining = (ms: number, length = 3) => {
  if (!ms || ms <= 0) return '0 s'

  const baseTime = new Date(0)
  const duration = new Date(ms)

  const years = duration.getUTCFullYear() - baseTime.getUTCFullYear()
  const months = duration.getUTCMonth() - baseTime.getUTCMonth()
  const days = duration.getUTCDate() - baseTime.getUTCDate()
  const hours = duration.getUTCHours() - baseTime.getUTCHours()
  const minutes = duration.getUTCMinutes() - baseTime.getUTCMinutes()
  const seconds = duration.getUTCSeconds() - baseTime.getUTCSeconds()

  const parts: string[] = []
  if (years) parts.push(`${years} y`)
  if (months) parts.push(`${months} m`)
  if (days) parts.push(`${days} d`)
  if (hours) parts.push(`${hours} h`)
  if (minutes) parts.push(`${minutes} min`)
  if (seconds) parts.push(`${seconds} s`)

  return parts.slice(0, length).join(' ') || '0 s'
}

export const GIVStreamSection = ({
  selectedChain,
  onSelectChain,
}: {
  selectedChain?: number
  onSelectChain?: (chainId: number) => void
}) => {
  const account = useActiveAccount()
  const [localChain, setLocalChain] = useState(STAKING_CHAINS[0]?.id ?? 0)
  const [isLoading, setIsLoading] = useState(false)
  const [streamData, setStreamData] = useState({
    flowRatePerWeek: 0n,
    percentComplete: 0,
    timeRemaining: 0,
  })

  const [isGIVStreamHistoryModalOpen, setIsGIVStreamHistoryModalOpen] =
    useState(false)

  const activeChain = selectedChain ?? localChain
  const handleSelectChain = onSelectChain ?? setLocalChain

  useEffect(() => {
    if (!account?.address || !activeChain) {
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
          activeChain as number,
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
  }, [account?.address, activeChain])

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

  const tokenSymbol = STAKING_POOLS[selectedChain]?.GIVPOWER?.unit ?? 'GIV'

  return (
    <>
      <div className="mt-8 rounded-2xl border border-giv-brand-100 px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2 text-lg text-giv-neutral-900 font-bold">
            <IconFlash className="h-5 w-5" fill="var(--giv-brand-900)" />
            <span>GIVstream</span>
          </div>
          <DropdownStakeNetworks
          selectedChain={activeChain}
            chains={STAKING_CHAINS}
          onSelectChain={handleSelectChain}
          />
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex justify-between items-center gap-1 text-giv-neutral-900">
            <div className="text-base">Your Flowrate</div>
            <span className="ml-3 text-2xl font-bold">{flowRateLabel}</span>
            <span className="text-sm font-regular">{tokenSymbol}/week</span>
          </div>
          <div className="flex justify-between items-center gap-1 text-giv-neutral-900 font-medium">
            <div className="text-sm">Time remaining</div>
            <div className="ml-2 text-lg">{timeRemainingLabel}</div>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 rounded-full bg-giv-neutral-200">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${percent}%`,
                background: 'linear-gradient(90deg, #8668FC 0%, #211985 100%)',
              }}
            />
          </div>
          <div className="mt-2 flex justify-between text-sm text-giv-neutral-900">
            <span>{percentLabel}</span>
            <span>100%</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => setIsGIVStreamHistoryModalOpen(true)}
          className={clsx(
            'flex items-center gap-2 text-sm font-bold',
            'text-giv-brand-700 hover:opacity-80 transition-opacity',
            'cursor-pointer',
          )}
        >
          GIVstream history
          <ArrowRight className="h-6 w-6" />
        </button>
      </div>
      <GIVStreamHistoryModal
        open={isGIVStreamHistoryModalOpen}
        onOpenChange={setIsGIVStreamHistoryModalOpen}
        chainId={selectedChain}
      />
    </>
  )
}
