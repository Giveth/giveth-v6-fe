'use client'

import { type UrlObject } from 'url'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { ArrowRightIcon, LockKeyhole } from 'lucide-react'
import ReactCanvasConfetti from 'react-canvas-confetti'
import { defineChain } from 'thirdweb'
import {
  useActiveAccount,
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from 'thirdweb/react'
import { formatUnits, parseUnits, type Address } from 'viem'
import LockedDetailsModal from '@/components/account/staking-rewards/LockedDetailsModal'
import { ChainIcon } from '@/components/ChainIcon'
import { HelpTooltip } from '@/components/HelpTooltip'
import { IconReload } from '@/components/icons/IconReload'
import { IconStakeNumber } from '@/components/icons/IconStakeNumber'
import { IconStars } from '@/components/icons/IconStars'
import { TokenIcon } from '@/components/TokenIcon'
import { BuyBridgeGIVLink } from '@/lib/constants/menu-links'
import { STAKING_POOLS } from '@/lib/constants/staking-power-constants'
import {
  formatNumber,
  getTokenPriceInUSDByCoingeckoId,
} from '@/lib/helpers/cartHelper'
import { getChainName } from '@/lib/helpers/chainHelper'
import {
  fetchAvailableToLock,
  approveGIVpowerStake,
  calculateMultiplier,
  fetchWalletBalance,
  fetchStaking,
  fetchGIVpowerAPRRange,
  formatToken,
  LOCK_CONSTANTS,
  stakeGIVpower,
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

export function StakingTab({ id }: { id: string }) {
  // Get pools data
  const pool = STAKING_POOLS[Number(id)]

  const router = useRouter()

  const account = useActiveAccount()
  const activeChain = useActiveWalletChain()
  const switchChain = useSwitchActiveWalletChain()

  const [isLockedDetailsModalOpen, setIsLockedDetailsModalOpen] =
    useState(false)

  const [_stakedAmount, setStakedAmount] = useState<bigint>(0n)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [amountToStake, setAmountToStake] = useState<string>('0')
  const [lockedAmount, setLockedAmount] = useState<bigint>(0n)
  const [availableToLock, setAvailableToLock] = useState<bigint>(0n)
  const [walletBalance, setWalletBalance] = useState<bigint>(0n)
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [aprValue, setAprValue] = useState<number>(0)
  const [aprRange, setAprRange] = useState<{
    baseApr: number
    maxApr: number
  } | null>(null)
  const [tokenPriceInUSD, setTokenPriceInUSD] = useState<number>(0)
  const [flowStep, setFlowStep] = useState<
    'input' | 'approving' | 'approved' | 'staking' | 'staked'
  >('input')
  const confettiRef = useRef<ConfettiInstance | null>(null)
  const hasFiredRef = useRef(false)

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
    const fraction = parts.slice(1).join('').replace(/\D/g, '')

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

  // Convert amount to stake to base units
  const amountInBaseUnits = useMemo(() => {
    const decimals = pool?.GIVPOWER?.decimals ?? 18
    if (!amountToStake || Number(amountToStake) <= 0) return 0n
    try {
      return parseUnits(amountToStake, decimals)
    } catch {
      return 0n
    }
  }, [amountToStake, pool?.GIVPOWER?.decimals])

  const isAmountValid = amountInBaseUnits > 0n
  const amountLabel = amountToStake || '0'
  const amountToStakeValue = Number(amountToStake)
  const amountUsdValue = Number.isFinite(amountToStakeValue)
    ? tokenPriceInUSD * amountToStakeValue
    : 0
  const isControlsDisabled =
    isLoadingData || isRefreshingBalance || !account?.address

  // Handle approve, only approve if the amount is valid
  const handleApprove = async () => {
    // Check user has enough balance
    const hasEnoughBalance = walletBalance >= amountInBaseUnits
    if (!hasEnoughBalance) {
      setErrorMessage('Not enough balance')
      console.error('Not enough balance')
      return
    }

    if (!account || !pool?.GIVPOWER?.network || !isAmountValid) return
    setFlowStep('approving')
    try {
      // Change user network to the chainId
      if (activeChain?.id !== pool.GIVPOWER.network) {
        await switchChain(defineChain(pool.GIVPOWER.network))
      }
      await approveGIVpowerStake(
        account,
        pool.GIVPOWER.network,
        amountInBaseUnits,
      )
      setFlowStep('approved')
    } catch (error) {
      console.error('Approve failed:', error)
      setFlowStep('input')
    }
  }

  // Handle stake, only stake if the amount is valid
  const handleStake = async () => {
    // Check user has enough balance
    const hasEnoughBalance = walletBalance >= amountInBaseUnits
    if (!hasEnoughBalance) {
      setErrorMessage('Not enough balance')
      console.error('Not enough balance')
      return
    }
    if (!account || !pool?.GIVPOWER?.network || !isAmountValid) return
    setFlowStep('staking')
    try {
      // Change user network to the chainId
      if (activeChain?.id !== pool.GIVPOWER.network) {
        await switchChain(defineChain(pool.GIVPOWER.network))
      }
      await stakeGIVpower(account, pool.GIVPOWER.network, amountInBaseUnits)
      setFlowStep('staked')
    } catch (error) {
      console.error('Stake failed:', error)
      setFlowStep('approved')
    }
  }

  const handleCancel = () => {
    setFlowStep('input')
  }

  // Fetch staking data, only fetch if the account and pool are valid
  useEffect(() => {
    if (!account?.address || !pool?.GIVPOWER?.network) {
      setIsLoadingData(false)
      return
    }
    let cancelled = false

    const fetchData = async () => {
      setIsLoadingData(true)
      try {
        const [staking, available, wallet] = await Promise.all([
          fetchStaking(account.address as Address, pool.GIVPOWER.network),
          fetchAvailableToLock(
            account.address as Address,
            pool.GIVPOWER.network,
          ),
          fetchWalletBalance(account.address as Address, pool.GIVPOWER.network),
        ])
        if (!cancelled) {
          setStakedAmount(staking.staked)
          setAprValue(staking.boostedAPR ?? staking.apr ?? 0)
          setLockedAmount(available.alreadyLocked)
          setAvailableToLock(available.availableToLock)
          setWalletBalance(wallet)
        }
      } catch (error) {
        console.error('Failed to fetch staking data:', error)
      } finally {
        if (!cancelled) {
          setIsLoadingData(false)
        }
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [account?.address, pool?.GIVPOWER?.network])

  useEffect(() => {
    if (!pool?.GIVPOWER?.network) return
    let cancelled = false

    const fetchRange = async () => {
      try {
        const range = await fetchGIVpowerAPRRange(pool.GIVPOWER.network)
        if (!cancelled) {
          setAprRange(range)
        }
      } catch (error) {
        console.error('Failed to fetch APR range:', error)
      }
    }

    fetchRange()
    return () => {
      cancelled = true
    }
  }, [pool?.GIVPOWER?.network])

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

  // Fire side cannons, only fire if the staking is successful
  useEffect(() => {
    if (flowStep !== 'staked') {
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

  const hasStake = availableToLock + lockedAmount > 0n
  const aprNumberLabel = `${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(aprValue)}%`
  const aprRangeBase =
    aprRange?.baseApr ?? (Number.isFinite(aprValue) ? aprValue : 0)
  const aprRangeMax =
    aprRange?.maxApr ??
    aprRangeBase * calculateMultiplier(LOCK_CONSTANTS.MAX_ROUNDS)
  const aprRangeLabel =
    aprRangeBase > 0
      ? `${aprRangeBase.toFixed(2)}%-${aprRangeMax.toFixed(2)}%`
      : null
  const aprLabel =
    (!account?.address ||
      !hasStake ||
      !Number.isFinite(aprValue) ||
      aprValue <= 0) &&
    aprRangeLabel
      ? aprRangeLabel
      : aprNumberLabel

  // Total staked amount
  const totalStakedAmountLabel = formatToken(
    availableToLock + lockedAmount,
    pool?.GIVPOWER?.decimals as number,
  )

  // Format total locked amount
  const totalLockedAmountLabel = formatToken(
    lockedAmount,
    pool?.GIVPOWER?.decimals as number,
  )

  // Format available to stake amount
  const availableToStakeLabel = formatToken(
    walletBalance,
    pool?.GIVPOWER?.decimals as number,
  )

  const tokenDecimals = pool?.GIVPOWER?.decimals ?? 18

  // Format available to stake value
  const availableToStakeValue = parseFloat(
    formatUnits(walletBalance, tokenDecimals),
  )

  // Refresh wallet balance, only refresh if the account and pool are valid
  const handleRefreshBalance = async () => {
    if (!account?.address || !pool?.GIVPOWER?.network) return
    setIsRefreshingBalance(true)
    setIsLoadingData(true)
    try {
      const balance = await fetchWalletBalance(
        account.address as Address,
        pool.GIVPOWER.network,
      )
      setWalletBalance(balance)
    } catch (error) {
      console.error('Failed to refresh wallet balance:', error)
    } finally {
      setIsRefreshingBalance(false)
      setIsLoadingData(false)
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
          Stake GIV
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
                      {aprLabel}
                    </span>
                    <HelpTooltip
                      text="This is the weighted average APR for your staked (and locked) GIV. The full range of APRs for staking and/or locking is 5.26%-27.34%. Lock your GIV for longer to earn greater rewards."
                      className="py-0.5! px-1.5! bg-giv-neutral-700!"
                      width={1}
                      height={1}
                      fontSize="text-[9px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-giv-neutral-200 bg-white p-5">
              <div className="flex flex-col justify-between border-b border-giv-neutral-200 p-4">
                <div className="text-lg text-giv-neutral-700 font-medium flex items-center gap-2">
                  <IconStakeNumber width={24} height={24} />
                  <span>Staked</span>
                </div>
                <div className="flex items-center gap-2 text-lg font-bold text-giv-neutral-900 mt-3">
                  <span>{totalStakedAmountLabel}</span>
                  <span className="text-lg font-medium text-giv-neutral-800">
                    {pool?.GIVPOWER.title}
                  </span>
                </div>
              </div>

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
                disabled={Number(lockedAmount) === 0 || isControlsDisabled}
                onClick={() => setIsLockedDetailsModalOpen(true)}
              >
                Locked GIV details
              </button>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex-1 min-w-0">
            <div className="rounded-2xl border border-giv-brand-100 bg-white p-6">
              <div className="flex flex-wrap md:flex-nowrap items-center justify-between">
                <div className="w-full md:w-auto mb-3 md:mb-0 text-lg font-bold text-giv-neutral-900">
                  Amount to stake
                </div>
                <Link
                  href={BuyBridgeGIVLink.href as unknown as UrlObject}
                  target={BuyBridgeGIVLink.target}
                  className={clsx(
                    'flex w-full md:w-auto items-center gap-2 text-sm font-bold text-giv-brand-500! hover:text-giv-brand-800!',
                    flowStep !== 'input' &&
                      'pointer-events-none opacity-40 hover:text-giv-brand-500!',
                  )}
                >
                  <span>{BuyBridgeGIVLink.label}</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </div>

              {flowStep === 'input' || flowStep === 'approving' ? (
                <>
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
                        value={amountToStake}
                        placeholder="0"
                        onChange={e => {
                          setErrorMessage(null)
                          const normalized = normalizeStakeInput(e.target.value)
                          setAmountToStake(normalized)
                        }}
                        autoComplete="off"
                        disabled={flowStep === 'approving'}
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
                      {['25%', '50%', '75%'].map(label => (
                        <button
                          key={label}
                          type="button"
                          disabled={
                            flowStep === 'approving' || isControlsDisabled
                          }
                          onClick={() => {
                            const percentage = Number(label.replace('%', ''))
                            setAmountToStake(
                              String(
                                availableToStakeValue * (percentage / 100),
                              ),
                            )
                          }}
                          className={clsx(
                            'rounded-xl px-3 py-2 text-xs font-medium',
                            'bg-giv-brand-050 text-giv-brand-700 transition-colors',
                            'border border-giv-brand-100',
                            !isControlsDisabled &&
                              flowStep !== 'approving' &&
                              'hover:bg-giv-brand-200 cursor-pointer',
                            (flowStep === 'approving' || isControlsDisabled) &&
                              'cursor-not-allowed opacity-50',
                          )}
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={isControlsDisabled}
                        onClick={() =>
                          setAmountToStake(availableToStakeValue.toString())
                        }
                        className={clsx(
                          'rounded-xl px-3 py-2 text-xs font-medium',
                          'bg-giv-brand-050 text-giv-brand-700 transition-colors',
                          'border border-giv-brand-100',
                          !isControlsDisabled &&
                            'hover:bg-giv-brand-200 cursor-pointer',
                          isControlsDisabled && 'cursor-not-allowed opacity-50',
                        )}
                      >
                        Max
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-sm text-giv-neutral-800 font-bold">
                      <span>Available:</span>
                      <button
                        type="button"
                        disabled={isControlsDisabled}
                        className={clsx(
                          'ml-1',
                          !isControlsDisabled &&
                            'cursor-pointer hover:underline',
                          isControlsDisabled && 'cursor-not-allowed opacity-50',
                        )}
                        onClick={() =>
                          setAmountToStake(availableToStakeValue.toString())
                        }
                        title="Stake max"
                      >
                        {availableToStakeLabel} {pool?.GIVPOWER.title}
                      </button>
                      <button
                        type="button"
                        onClick={handleRefreshBalance}
                        className={clsx(
                          'ml-1',
                          isControlsDisabled
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer group',
                        )}
                        disabled={isControlsDisabled}
                        title="Refresh balance"
                      >
                        <IconReload
                          width={24}
                          height={24}
                          fill="var(--giv-brand-500)"
                          className={clsx(
                            'transition-transform duration-200',
                            isRefreshingBalance ? 'animate-spin' : null,
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={clsx(
                      'w-full py-4 bg-giv-brand-300! text-white! mt-8',
                      'rounded-md text-sm font-bold flex items-center justify-center gap-2',
                      !isControlsDisabled &&
                        'hover:bg-giv-brand-400! transition-colors cursor-pointer',
                      (!isAmountValid ||
                        flowStep === 'approving' ||
                        isControlsDisabled) &&
                        'opacity-60 cursor-not-allowed',
                    )}
                    disabled={
                      !isAmountValid ||
                      flowStep === 'approving' ||
                      isControlsDisabled
                    }
                    onClick={handleApprove}
                  >
                    {flowStep === 'approving' ? (
                      <>
                        Approve Pending
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </>
                    ) : (
                      'Approve'
                    )}
                  </button>
                  {errorMessage && (
                    <div className="mt-4 text-sm text-red-500 text-center">
                      {errorMessage}
                    </div>
                  )}
                </>
              ) : flowStep === 'approved' || flowStep === 'staking' ? (
                <>
                  <div className="mt-6 rounded-xl border border-giv-neutral-300 bg-white p-6 py-8 text-center">
                    <div className="text-2xl font-medium text-giv-neutral-900">
                      You are staking
                    </div>
                    <div className="mt-2 text-3xl font-bold text-giv-neutral-900">
                      {amountLabel} {pool?.GIVPOWER.title}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={clsx(
                      'mt-6 w-full py-4 bg-giv-brand-300! text-white!',
                      'rounded-md text-sm font-bold flex items-center justify-center gap-2',
                      'hover:bg-giv-brand-400! transition-colors cursor-pointer',
                      flowStep === 'staking' && 'opacity-60 cursor-not-allowed',
                    )}
                    disabled={flowStep === 'staking'}
                    onClick={handleStake}
                  >
                    {flowStep === 'staking' ? (
                      <>
                        Staking
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </>
                    ) : (
                      'Stake'
                    )}
                  </button>
                  {errorMessage && (
                    <div className="mt-4 text-sm text-red-500 text-center">
                      {errorMessage}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={clsx(
                      'mt-3 w-full rounded-md border border-giv-brand-100 bg-giv-brand-050',
                      'px-4 py-4 text-sm font-bold text-giv-brand-700 cursor-pointer',
                      'hover:bg-giv-brand-100 transition-colors',
                    )}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <div className="mt-6 rounded-xl border border-giv-neutral-300 bg-white p-6 text-center">
                    <div className="text-base font-semibold text-giv-neutral-900">
                      You have staked
                    </div>
                    <div className="mt-2 text-3xl font-bold text-giv-neutral-900">
                      {amountLabel} {pool?.GIVPOWER.title}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      router.push(
                        `/account/stake/${id}?tab=multiple-rewards` as never,
                      )
                    }}
                    className={clsx(
                      'flex items-center justify-center gap-2',
                      'mt-6 w-full rounded-md bg-giv-brand-300 px-4 py-4 text-sm font-bold text-white',
                      'hover:bg-giv-brand-400 transition-colors cursor-pointer',
                    )}
                  >
                    <span>Increase Your Rewards Multiplier</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={clsx(
                      'mt-3 w-full rounded-md border border-giv-brand-100 bg-giv-brand-050 px-4 py-4',
                      'text-xs font-bold text-giv-brand-700',
                      'hover:bg-giv-brand-100 transition-colors cursor-pointer',
                    )}
                  >
                    Stake More
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
