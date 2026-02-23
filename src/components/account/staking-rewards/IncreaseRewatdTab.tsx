'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import clsx from 'clsx'
import { LockKeyhole } from 'lucide-react'
import ReactCanvasConfetti from 'react-canvas-confetti'
import { useActiveAccount } from 'thirdweb/react'
import { formatUnits, parseUnits, type Address } from 'viem'
import LockedDetailsModal from '@/components/account/staking-rewards/LockedDetailsModal'
import { ChainIcon } from '@/components/ChainIcon'
import { HelpTooltip } from '@/components/HelpTooltip'
import { IconReload } from '@/components/icons/IconReload'
import { IconStars } from '@/components/icons/IconStars'
import { IconWarning } from '@/components/icons/IconWarning'
import { TokenIcon } from '@/components/TokenIcon'
import { STAKING_POOLS } from '@/lib/constants/staking-power-constants'
import {
  formatNumber,
  getTokenPriceInUSDByCoingeckoId,
} from '@/lib/helpers/cartHelper'
import { getChainName } from '@/lib/helpers/chainHelper'
import {
  LOCK_CONSTANTS,
  calculateBoostedAPR,
  calculateGIVpower,
  calculateMultiplier,
  calculateUnlockDate,
  fetchAvailableToLock,
  fetchStaking,
  getCurrentRoundInfo,
  lockGIVpower,
  formatToken,
} from '@/lib/helpers/stakeHelper'

// Confetti colors
const confettiColors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1']

// Confetti canvas styles
const confettiCanvasStyles: CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  width: '100vw',
  height: '100vh',
  inset: 0,
  zIndex: 40,
}

type ConfettiInstance = (options: Record<string, unknown>) => void

export function IncreaseRewardTab({ id }: { id: string }) {
  // Get pools data
  const pool = STAKING_POOLS[Number(id)]

  const account = useActiveAccount()

  const [isLockedDetailsModalOpen, setIsLockedDetailsModalOpen] =
    useState(false)

  const [_stakedAmount, setStakedAmount] = useState<bigint>(0n)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [amountToLock, setAmountToLock] = useState<string>('0')
  const [roundsToLock, setRoundsToLock] = useState<number>(0)
  const [lockedAmount, setLockedAmount] = useState<bigint>(0n)
  const [availableToLock, setAvailableToLock] = useState<bigint>(0n)
  const [baseApr, setBaseApr] = useState<number>(0)
  const [tokenPriceInUSD, setTokenPriceInUSD] = useState<number>(0)
  const [roundInfo, setRoundInfo] = useState<{
    currentRound: number
    nextRoundDate: Date
    roundDuration: number
  } | null>(null)
  const [flowStep, setFlowStep] = useState<
    'input' | 'review' | 'locking' | 'locked'
  >('input')
  const confettiRef = useRef<ConfettiInstance | null>(null)
  const hasFiredRef = useRef(false)
  const roundsRangeRef = useRef<HTMLInputElement | null>(null)

  // Initialize confetti, only initialize once
  const handleConfettiInit = useCallback(
    ({ confetti }: { confetti: ConfettiInstance }) => {
      confettiRef.current = confetti
    },
    [],
  )

  // Fire side cannons, only fire if the staking is successful
  const fireSideCannons = useCallback(() => {
    const end = Date.now() + 3 * 1000

    const frame = () => {
      if (!confettiRef.current) return
      if (Date.now() > end) return

      confettiRef.current({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: confettiColors,
      })
      confettiRef.current({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: confettiColors,
      })

      requestAnimationFrame(frame)
    }

    frame()
  }, [])

  // Normalize stake input, remove non-numeric characters and ensure decimal point is always present
  const normalizeStakeInput = (value: string) => {
    const sanitized = value.replace(/,/g, '.')
    const hasDot = sanitized.includes('.')
    const digitsAndDots = sanitized.replace(/[^\d.]/g, '')
    const parts = digitsAndDots.split('.')
    const whole = parts[0].replace(/\D/g, '')
    const fraction = parts.slice(1).join('').replace(/\D/g, '').slice(0, 6)

    if (whole === '' && fraction) return `0.${fraction}`
    if (whole === '' && hasDot) return '0.'
    if (whole === '' && !hasDot) return ''

    if (whole === '0' && !hasDot && fraction === '') {
      return sanitized.length > 1 ? `0.${sanitized.slice(1)}` : '0'
    }

    if (whole.startsWith('0') && !hasDot) {
      return `0.${whole.slice(1)}`
    }

    if (hasDot && fraction === '') {
      return `${whole}.`
    }

    return fraction ? `${whole}.${fraction}` : whole
  }

  const formatAmountToSixDecimals = (value: number) => {
    const fixed = value.toFixed(6)
    return fixed.replace(/\.?0+$/, '')
  }

  const updateRange = (el: HTMLInputElement | null) => {
    if (!el) return
    const min = Number(el.min) || 0
    const max = Number(el.max) || 100
    const val = Number(el.value)
    const percent = ((val - min) / (max - min)) * 100
    el.style.setProperty('--percent', `${percent}%`)
  }

  // Convert amount to stake to base units
  const amountInBaseUnits = useMemo(() => {
    const decimals = pool?.GIVPOWER?.decimals ?? 18
    if (!amountToLock || Number(amountToLock) <= 0) return 0n
    try {
      return parseUnits(amountToLock, decimals)
    } catch {
      return 0n
    }
  }, [amountToLock, pool?.GIVPOWER?.decimals])

  const isAmountValid = amountInBaseUnits > 0n
  const amountLabel = amountToLock || '0'
  const amountToLockValue = Number(amountToLock)
  const amountUsdValue = Number.isFinite(amountToLockValue)
    ? tokenPriceInUSD * amountToLockValue
    : 0
  const isRoundsValid = roundsToLock >= LOCK_CONSTANTS.MIN_ROUNDS
  const hasEnoughToLock = amountInBaseUnits <= availableToLock
  const isLockValid = isAmountValid && isRoundsValid && hasEnoughToLock

  const handleReview = () => {
    if (!isAmountValid) return
    if (!isRoundsValid) {
      setErrorMessage('Please select at least 1 round')
      return
    }
    if (!hasEnoughToLock) {
      setErrorMessage('Not enough staked balance to lock')
      return
    }
    setErrorMessage(null)
    setFlowStep('review')
  }

  const handleLock = async () => {
    if (!account || !pool?.GIVPOWER?.network || !isLockValid) return
    setFlowStep('locking')
    try {
      await lockGIVpower(
        account,
        pool.GIVPOWER.network,
        amountInBaseUnits,
        roundsToLock,
      )
      setFlowStep('locked')
    } catch (error) {
      console.error('Lock failed:', error)
      setFlowStep('review')
    }
  }

  const handleReset = () => {
    setFlowStep('input')
    setAmountToLock('0')
    setRoundsToLock(0)
    setErrorMessage(null)
  }

  // Fetch staking data, only fetch if the account and pool are valid
  useEffect(() => {
    if (!account?.address || !pool?.GIVPOWER?.network) return
    let cancelled = false

    const fetchData = async () => {
      try {
        const [staking, available, roundData] = await Promise.all([
          fetchStaking(account.address as Address, pool.GIVPOWER.network),
          fetchAvailableToLock(
            account.address as Address,
            pool.GIVPOWER.network,
          ),
          getCurrentRoundInfo(pool.GIVPOWER.network),
        ])
        if (!cancelled) {
          setStakedAmount(staking.staked)
          setBaseApr(staking.baseAPR ?? staking.apr ?? 0)
          setLockedAmount(available.alreadyLocked)
          setAvailableToLock(available.availableToLock)
          setRoundInfo(roundData)
        }
      } catch (error) {
        console.error('Failed to fetch staking data:', error)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [account?.address, pool?.GIVPOWER?.network])

  // Fetch token price
  useEffect(() => {
    const coingeckoId = pool?.GIVPOWER?.coingeckoId
    if (!coingeckoId) {
      setTokenPriceInUSD(0)
      return
    }
    let cancelled = false

    const fetchPrice = async () => {
      const price = await getTokenPriceInUSDByCoingeckoId(coingeckoId)
      if (!cancelled) {
        setTokenPriceInUSD(price || 0)
      }
    }

    fetchPrice()
    return () => {
      cancelled = true
    }
  }, [pool?.GIVPOWER?.coingeckoId])

  // Fire side cannons, only fire if the lock is successful
  useEffect(() => {
    if (flowStep !== 'locked') {
      hasFiredRef.current = false
      return
    }

    if (hasFiredRef.current) return
    hasFiredRef.current = true

    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    fireSideCannons()
  }, [fireSideCannons, flowStep])

  useEffect(() => {
    updateRange(roundsRangeRef.current)
  }, [roundsToLock])

  // Format APR value
  const aprLabel = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(baseApr)

  // Format total locked amount
  const totalLockedAmountLabel = formatToken(
    lockedAmount,
    pool?.GIVPOWER?.decimals as number,
  )

  const tokenDecimals = pool?.GIVPOWER?.decimals ?? 18

  // Format available to lock amount
  const availableToLockLabel = formatToken(
    availableToLock,
    pool?.GIVPOWER?.decimals as number,
  )

  // Format available to lock value
  const availableToLockValue = parseFloat(
    formatUnits(availableToLock, tokenDecimals),
  )

  const multiplier = roundsToLock >= 1 ? calculateMultiplier(roundsToLock) : 1
  const boostedApr = calculateBoostedAPR(baseApr, roundsToLock)
  const givpower = calculateGIVpower(amountInBaseUnits, roundsToLock)
  const unlockDate = roundInfo
    ? calculateUnlockDate(
        roundInfo.nextRoundDate,
        roundInfo.roundDuration,
        roundsToLock,
      )
    : null
  const unlockDateLabel = unlockDate
    ? new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(unlockDate)
    : '-'

  // Refresh available to lock
  const handleRefreshAvailable = async () => {
    if (!account?.address || !pool?.GIVPOWER?.network) return
    try {
      const available = await fetchAvailableToLock(
        account.address as Address,
        pool.GIVPOWER.network,
      )
      setLockedAmount(available.alreadyLocked)
      setAvailableToLock(available.availableToLock)
    } catch (error) {
      console.error('Failed to refresh lock data:', error)
    }
  }

  return (
    <>
      <div className="bg-white rounded-tl-2xl rounded-b-xl p-8 overflow-hidden">
        <ReactCanvasConfetti
          onInit={handleConfettiInit}
          style={confettiCanvasStyles}
        />
        <h1 className="text-2xl font-bold text-giv-neutral-900 mb-4">
          Multiply your rewards
        </h1>

        <div className="flex flex-row flex-wrap lg:no-wrap gap-5">
          <div className="order-2 lg:order-1 w-full lg:w-[420px] shrink-0 space-y-4">
            <div className="rounded-2xl border border-giv-brand-100 p-5 pr-16">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10">
                    <TokenIcon
                      width={40}
                      height={40}
                      tokenSymbol={pool?.GIVPOWER.title}
                      networkId={pool?.GIVPOWER?.network as number}
                    />
                    <div className="absolute right-2 bottom-2 w-[9px] h-[10px] bg-white rounded-md">
                      <ChainIcon
                        networkId={pool?.GIVPOWER?.network as number}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 ml-1 text-sm font-medium text-giv-neutral-900">
                    <div>{pool?.GIVPOWER.title} Staking</div>
                    <div className="font-bold">
                      On {getChainName(pool?.GIVPOWER?.network as number)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm font-medium text-giv-neutral-900">
                  <div className="flex items-center gap-2">
                    <IconStars width={24} height={24} />
                    <span className="text-lg font-bold text-giv-neutral-900">
                      APR
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <span className="text-lg font-bold text-giv-neutral-900">
                      {aprLabel}%
                    </span>
                    <HelpTooltip text="This is the weighted average APR for your staked (and locked) GIV. The full range of APRs for staking and/or locking is 5.26%-27.34%. Lock your GIV for longer to earn greater rewards." />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-giv-neutral-200 bg-white p-5">
              <div className="flex flex-col justify-between p-5">
                <div className="text-lg text-giv-neutral-700 font-medium flex items-center gap-2">
                  <LockKeyhole width={24} height={24} />
                  <span>Locked</span>
                </div>
                <div className="flex items-center gap-2 text-lg font-bold text-giv-neutral-900 mt-3">
                  <span>{totalLockedAmountLabel}</span>
                  <span className="text-lg font-medium text-giv-neutral-800">
                    {pool?.GIVPOWER.title}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={clsx(
                  'flex items-center justify-center gap-2',
                  'mt-2 w-full rounded-xl border px-4 py-3',
                  'text-sm font-bold transition-colors',
                  'border border-giv-brand-100 bg-giv-brand-050 text-giv-brand-700 hover:opacity-80 cursor-pointer',
                )}
                disabled={Number(lockedAmount) === 0}
                onClick={() => setIsLockedDetailsModalOpen(true)}
              >
                Locked GIV details
              </button>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex-1 min-w-0">
            <div className="rounded-2xl border border-giv-brand-100 bg-white p-6">
              {flowStep === 'input' && (
                <>
                  <div className="text-lg font-bold text-giv-neutral-900">
                    Amount to Lock
                  </div>
                  <div className="mt-4 rounded-xl border border-giv-neutral-300 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="w-[160px] flex items-center gap-2 text-sm font-semibold text-giv-neutral-900 border-r border-giv-neutral-300 px-4 py-3">
                        <TokenIcon
                          width={24}
                          height={24}
                          tokenSymbol={pool?.GIVPOWER.title}
                          networkId={pool?.GIVPOWER?.network as number}
                        />
                        <div>{pool?.GIVPOWER.title}</div>
                      </div>
                      <input
                        type="text"
                        value={amountToLock}
                        placeholder="0"
                        onChange={e => {
                          setErrorMessage(null)
                          const normalized = normalizeStakeInput(e.target.value)
                          setAmountToLock(normalized)
                        }}
                        autoComplete="off"
                        className={clsx(
                          'w-full px-4',
                          'text-base p-0',
                          'font-medium text-left text-giv-neutral-900 focus:outline-none',
                        )}
                      />
                      <div className="flex-inline items-center px-2 py-1 bg-giv-neutral-300 rounded-lg text-xs font-semibold text-giv-neutral-700 mr-2">
                        <span>$</span>
                        <span>
                          {formatNumber(amountUsdValue, {
                            minDecimals: 2,
                            maxDecimals: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                      {['5%', '10%', '15%', '20%'].map(label => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            const percentage = Number(label.replace('%', ''))
                            setAmountToLock(
                              formatAmountToSixDecimals(
                                availableToLockValue * (percentage / 100),
                              ),
                            )
                          }}
                          className={clsx(
                            'rounded-xl px-3 py-2 text-xs font-medium',
                            'bg-giv-brand-050 text-giv-brand-700 hover:bg-giv-brand-200 transition-colors cursor-pointer',
                            'border border-giv-brand-100',
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-giv-neutral-800 font-bold">
                      <span>Available to lock:</span>
                      <span className="ml-1">
                        {availableToLockLabel} {pool?.GIVPOWER.title}
                      </span>
                      <button
                        type="button"
                        onClick={handleRefreshAvailable}
                        className="ml-1 cursor-pointer"
                      >
                        <IconReload
                          width={24}
                          height={24}
                          fill="var(--giv-brand-500)"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-between">
                    <span className="text-lg font-bold text-giv-neutral-800">
                      Rounds to Lock: {roundsToLock}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRoundsToLock(LOCK_CONSTANTS.MAX_ROUNDS)}
                      className="text-sm font-bold text-giv-brand-500 hover:text-giv-brand-800 cursor-pointer"
                    >
                      Max Rounds
                    </button>
                  </div>
                  <input
                    ref={roundsRangeRef}
                    type="range"
                    min={0}
                    max={LOCK_CONSTANTS.MAX_ROUNDS}
                    value={roundsToLock}
                    onInput={e =>
                      updateRange(e.currentTarget as HTMLInputElement)
                    }
                    onChange={e => setRoundsToLock(Number(e.target.value))}
                    className="mt-3 w-full giv-range"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-giv-neutral-700">
                    <div className="flex items-center gap-2 text-giv-warning-700">
                      <IconWarning width={18} height={18} />
                      <span>Min 1 round</span>
                    </div>
                    <span>
                      {unlockDateLabel === '-'
                        ? '-'
                        : `Lock until ${unlockDateLabel}`}
                    </span>
                  </div>

                  <div className="mt-8 rounded-xl border border-giv-brand-200 bg-giv-neutral-200 p-4 text-base text-giv-neutral-700">
                    <div className="font-bold text-giv-neutral-700">
                      Mid-round lock
                    </div>
                    <div className="mt-1">
                      When you lock your tokens mid-round, they will be locked
                      for the remainder of the current round + the numbers of
                      rounds you select: {roundsToLock}.
                    </div>
                  </div>

                  <button
                    type="button"
                    className={clsx(
                      'w-full py-4 bg-giv-brand-300! text-white! mt-8',
                      'rounded-md text-sm font-bold flex items-center justify-center gap-2',
                      'hover:bg-giv-brand-400! transition-colors cursor-pointer',
                      !isLockValid && 'opacity-60 cursor-not-allowed',
                    )}
                    disabled={!isLockValid}
                    onClick={handleReview}
                  >
                    Lock To Increase Your Multiplier
                  </button>

                  {errorMessage && (
                    <div className="mt-4 text-sm text-red-500 text-center">
                      {errorMessage}
                    </div>
                  )}

                  <RewardCard
                    multiplier={multiplier}
                    boostedApr={boostedApr}
                    givpower={givpower}
                    tokenDecimals={tokenDecimals}
                  />
                </>
              )}

              {flowStep === 'review' && (
                <>
                  <div className="rounded-xl border border-giv-neutral-200 bg-white p-8 text-center">
                    <div className="text-base font-semibold text-giv-neutral-900">
                      You are locking
                    </div>
                    <div className="mt-2 text-3xl font-bold text-giv-neutral-900">
                      {amountLabel} {pool?.GIVPOWER.title}
                    </div>
                    <div className="mt-2 text-base text-giv-neutral-700">
                      until {unlockDate?.toLocaleDateString() ?? '-'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setFlowStep('input')}
                      className="mt-6 rounded-md border border-giv-brand-100 bg-giv-brand-050 px-4 py-3 text-sm font-bold text-giv-brand-700 hover:bg-giv-brand-100 transition-colors"
                    >
                      Edit lock duration
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleLock}
                    className={clsx(
                      'w-full mt-6 py-4 bg-giv-brand-300! text-white! rounded-md text-sm font-bold',
                      'hover:bg-giv-brand-400! transition-colors cursor-pointer',
                    )}
                  >
                    Lock your tokens
                  </button>

                  <RewardCard
                    multiplier={multiplier}
                    boostedApr={boostedApr}
                    givpower={givpower}
                    tokenDecimals={tokenDecimals}
                  />
                </>
              )}

              {flowStep === 'locking' && (
                <div className="rounded-xl border border-giv-neutral-200 bg-white p-8 text-center">
                  <div className="text-base font-semibold text-giv-neutral-900">
                    Locking your tokens
                  </div>
                  <div className="mt-4 flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-giv-brand-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              )}

              {flowStep === 'locked' && (
                <>
                  <div className="rounded-xl border border-giv-neutral-200 bg-white p-8 text-center">
                    <div className="text-base font-semibold text-giv-neutral-900">
                      You locked
                    </div>
                    <div className="mt-2 text-3xl font-bold text-giv-neutral-900">
                      {amountLabel} {pool?.GIVPOWER.title}
                    </div>
                    <div className="mt-2 text-base text-giv-neutral-700">
                      until {unlockDate?.toLocaleDateString() ?? '-'}
                    </div>
                  </div>
                  <div className="mt-6 rounded-xl border border-giv-neutral-200 bg-giv-neutral-100 p-5 text-center">
                    <div className="text-sm text-giv-neutral-600">You have</div>
                    <div className="mt-2 text-2xl font-bold text-giv-neutral-900">
                      {formatUnits(givpower, tokenDecimals)} GIVpower
                    </div>
                    <div className="mt-3 text-sm text-giv-neutral-600">
                      Use your GIVpower to boost verified projects on Giveth
                      while earning rewards.
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full mt-6 py-4 bg-giv-brand-300! text-white! rounded-md text-sm font-bold hover:bg-giv-brand-400! transition-colors"
                  >
                    Boost Projects
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full mt-3 py-4 bg-giv-brand-050! text-giv-brand-700! rounded-md text-sm font-bold border border-giv-brand-100 hover:bg-giv-brand-100 transition-colors"
                  >
                    Lock more GIV
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <LockedDetailsModal
        open={isLockedDetailsModalOpen}
        onOpenChange={setIsLockedDetailsModalOpen}
        chainId={Number(id)}
        tokenSymbol={pool?.GIVPOWER.title}
      />
    </>
  )
}

type RewardCardProps = {
  multiplier: number
  boostedApr: number
  givpower: bigint
  tokenDecimals: number
}

const RewardCard = ({
  multiplier,
  boostedApr,
  givpower,
  tokenDecimals,
}: RewardCardProps) => {
  return (
    <div className="mt-8 rounded-xl bg-giv-neutral-200 py-4 px-6">
      <div className="flex items-center gap-2 text-lg font-bold text-giv-neutral-800 border-b border-giv-neutral-400 pb-3">
        <IconStars width={24} height={24} fill="var(--giv-neutral-800)" />
        <span>Rewards</span>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 text-base font-medium text-giv-neutral-700">
        <div>
          <div className="flex items-center gap-2">
            <span>Your multiplier</span>
            <HelpTooltip text="The longer you lock your GIV, the greater your APR & GIVpower." />
          </div>
          <div className="mt-4 text-2xl font-bold text-giv-neutral-900">
            {multiplier.toFixed(2)}x
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span>APR</span>
            <HelpTooltip text="This is your rate of return for this set of GIV tokens." />
          </div>
          <div className="mt-4 text-2xl font-bold text-giv-neutral-900">
            {new Intl.NumberFormat(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(boostedApr)}
            %
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span>GIVpower</span>
            <HelpTooltip text="GIVpower allows you to support verified projects on Giveth while earning rewards." />
          </div>
          <div className="mt-4 text-2xl font-bold text-giv-neutral-900">
            {formatNumber(formatUnits(givpower, tokenDecimals), {
              minDecimals: 2,
              maxDecimals: 2,
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
