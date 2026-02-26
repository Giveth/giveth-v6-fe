'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { ArrowUpRight, LockKeyhole } from 'lucide-react'
import { type Route } from 'next'
import ReactCanvasConfetti from 'react-canvas-confetti'
import { defineChain } from 'thirdweb'
import {
  useActiveAccount,
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from 'thirdweb/react'
import { type Address, formatUnits, parseUnits } from 'viem'
import LockedDetailsModal from '@/components/account/staking-rewards/LockedDetailsModal'
import { ChainIcon } from '@/components/ChainIcon'
import { HelpTooltip } from '@/components/HelpTooltip'
import { IconReload } from '@/components/icons/IconReload'
import { IconStakeNumber } from '@/components/icons/IconStakeNumber'
import { IconStars } from '@/components/icons/IconStars'
import { TokenIcon } from '@/components/TokenIcon'
import { STAKING_POOLS } from '@/lib/constants/staking-power-constants'
import {
  formatNumber,
  getTokenPriceInUSDByCoingeckoId,
} from '@/lib/helpers/cartHelper'
import { getChainName, getTransactionUrl } from '@/lib/helpers/chainHelper'
import {
  fetchAvailableToLock,
  fetchStaking,
  formatToken,
  getAvailableToUnstake,
  unstakeGIV,
} from '@/lib/helpers/stakeHelper'

const confettiColors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1']
const confettiCanvasStyles: CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  width: '100vw',
  height: '100vh',
  inset: 0,
  zIndex: 40,
}

type ConfettiInstance = (options: Record<string, unknown>) => void

export function UnstakeTab({ id }: { id: string }) {
  const pool = STAKING_POOLS[Number(id)]

  const account = useActiveAccount()
  const activeChain = useActiveWalletChain()
  const switchChain = useSwitchActiveWalletChain()

  const [isLockedDetailsModalOpen, setIsLockedDetailsModalOpen] =
    useState(false)
  const [amountToUnstake, setAmountToUnstake] = useState('0')
  const [availableToUnstake, setAvailableToUnstake] = useState<bigint>(0n)
  const [totalStaked, setTotalStaked] = useState<bigint>(0n)
  const [lockedAmount, setLockedAmount] = useState<bigint>(0n)
  const [baseApr, setBaseApr] = useState(0)
  const [tokenPriceInUSD, setTokenPriceInUSD] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [flowStep, setFlowStep] = useState<'input' | 'pending' | 'confirmed'>(
    'input',
  )
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isRefreshingAvailable, setIsRefreshingAvailable] = useState(false)
  const confettiRef = useRef<ConfettiInstance | null>(null)
  const hasFiredRef = useRef(false)

  const tokenDecimals = pool?.GIVPOWER?.decimals ?? 18

  // Convert amount to base units, used for the unstake amount
  const amountInBaseUnits = useMemo(() => {
    if (!amountToUnstake || Number(amountToUnstake) <= 0) return 0n
    try {
      return parseUnits(amountToUnstake, tokenDecimals)
    } catch {
      return 0n
    }
  }, [amountToUnstake, tokenDecimals])

  const amountUsdValue = Number.isFinite(Number(amountToUnstake))
    ? tokenPriceInUSD * Number(amountToUnstake)
    : 0

  const hasEnough = amountInBaseUnits <= availableToUnstake
  const isAmountValid = amountInBaseUnits > 0n
  const canSubmit = isAmountValid && hasEnough

  const availableLabel = formatToken(availableToUnstake, tokenDecimals)
  const totalStakedAmountLabel = formatToken(totalStaked, tokenDecimals)

  // Format total locked amount
  const totalLockedAmountLabel = formatToken(
    lockedAmount,
    pool?.GIVPOWER?.decimals as number,
  )

  const aprLabel = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(baseApr)

  // Initialize confetti, only initialize once
  const handleConfettiInit = useCallback(
    ({ confetti }: { confetti: ConfettiInstance }) => {
      confettiRef.current = confetti
    },
    [],
  )

  // Fire side cannons, only fire if the unstaking is successful, only fire once
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

  // Fire side cannons, only fire if the unstaking is successful, only fire once
  useEffect(() => {
    if (flowStep !== 'confirmed') {
      hasFiredRef.current = false
      return
    }
    if (hasFiredRef.current) return
    hasFiredRef.current = true
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    fireSideCannons()
  }, [fireSideCannons, flowStep])

  // Refresh the unstake data, used to refresh the unstake data when the user clicks the refresh button
  const handleRefresh = async () => {
    if (!account?.address || !pool?.GIVPOWER?.network) return
    setIsRefreshingAvailable(true)
    try {
      const [staking, available, lockInfo] = await Promise.all([
        fetchStaking(account.address as Address, pool.GIVPOWER.network),
        getAvailableToUnstake(
          account.address as Address,
          pool.GIVPOWER.network,
        ),
        fetchAvailableToLock(account.address as Address, pool.GIVPOWER.network),
      ])
      setBaseApr(staking.boostedAPR ?? staking.apr ?? 0)
      const totalStakedValue = available.totalStaked
      const lockedValue = lockInfo.alreadyLocked
      const availableValue =
        totalStakedValue > lockedValue ? totalStakedValue - lockedValue : 0n
      setTotalStaked(totalStakedValue)
      setLockedAmount(lockedValue)
      setAvailableToUnstake(availableValue)
    } catch (error) {
      console.error('Failed to refresh unstake data:', error)
    } finally {
      setIsRefreshingAvailable(false)
    }
  }

  // Format amount to six decimals, used for the unstake amount
  const formatAmountToSixDecimals = (value: number) => {
    const fixed = value.toFixed(6)
    return fixed.replace(/\.?0+$/, '')
  }

  // Handle unstake, used to unstake the GIV power
  const handleUnstake = async () => {
    if (!account || !pool?.GIVPOWER?.network || !canSubmit) return
    setErrorMessage(null)
    setFlowStep('pending')
    try {
      // Change user network to the chainId
      if (activeChain?.id !== pool.GIVPOWER.network) {
        await switchChain(defineChain(pool.GIVPOWER.network))
      }

      const tx = await unstakeGIV(
        account,
        pool.GIVPOWER.network,
        amountInBaseUnits,
      )
      setTxHash(tx)
      setFlowStep('confirmed')
      await handleRefresh()
    } catch (error) {
      console.error('Unstake failed:', error)
      const message =
        error instanceof Error ? error.message : 'Unstake failed. Try again.'
      setErrorMessage(message)
      setFlowStep('input')
      setTxHash(null)
    } finally {
    }
  }

  // Handle reset, used to reset the unstake data
  const handleReset = () => {
    setFlowStep('input')
    setAmountToUnstake('0')
    setErrorMessage(null)
    setTxHash(null)
  }

  // Fetch the unstake data, used to fetch the unstake data when the user clicks the refresh button
  useEffect(() => {
    if (!account?.address || !pool?.GIVPOWER?.network) return
    let cancelled = false

    const fetchData = async () => {
      try {
        const [staking, available, lockInfo] = await Promise.all([
          fetchStaking(account.address as Address, pool.GIVPOWER.network),
          getAvailableToUnstake(
            account.address as Address,
            pool.GIVPOWER.network,
          ),
          fetchAvailableToLock(
            account.address as Address,
            pool.GIVPOWER.network,
          ),
        ])
        if (!cancelled) {
          setBaseApr(staking.boostedAPR ?? staking.apr ?? 0)
          const totalStakedValue = available.totalStaked
          const lockedValue = lockInfo.alreadyLocked
          const availableValue =
            totalStakedValue > lockedValue ? totalStakedValue - lockedValue : 0n
          setTotalStaked(totalStakedValue)
          setLockedAmount(lockedValue)
          setAvailableToUnstake(availableValue)
        }
      } catch (error) {
        console.error('Failed to fetch unstake data:', error)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [account?.address, pool?.GIVPOWER?.network])

  // Fetch the token price, used to fetch the token price when the user clicks the refresh button
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

  return (
    <>
      <div className="bg-white rounded-tl-2xl rounded-b-xl p-8">
        <ReactCanvasConfetti
          onInit={handleConfettiInit}
          style={confettiCanvasStyles}
        />
        <h1 className="text-2xl font-bold text-giv-neutral-900 mb-6">
          Unstake {pool?.GIVPOWER?.title}
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
                    <IconStars width={20} height={20} />
                    <span className="text-lg font-bold text-giv-neutral-900">
                      APR
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <span className="text-lg font-bold text-giv-neutral-900">
                      {aprLabel}%
                    </span>
                    <HelpTooltip
                      text="This is the weighted average APR for your staked (and locked) GIV."
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
                    Amount to unstake
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
                        value={amountToUnstake}
                        placeholder="0"
                        onChange={e => {
                          setErrorMessage(null)
                          setAmountToUnstake(e.target.value.replace(/,/g, '.'))
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
                      {['25%', '50%', '75%'].map(label => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            const percentage = Number(label.replace('%', ''))
                            const availableValue = parseFloat(
                              formatUnits(availableToUnstake, tokenDecimals),
                            )
                            setAmountToUnstake(
                              formatAmountToSixDecimals(
                                availableValue * (percentage / 100),
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
                      <button
                        type="button"
                        onClick={() =>
                          setAmountToUnstake(
                            formatAmountToSixDecimals(
                              parseFloat(
                                formatUnits(availableToUnstake, tokenDecimals),
                              ),
                            ),
                          )
                        }
                        className={clsx(
                          'rounded-xl px-3 py-2 text-xs font-medium',
                          'bg-giv-brand-050 text-giv-brand-700 hover:bg-giv-brand-200 transition-colors cursor-pointer',
                          'border border-giv-brand-100',
                        )}
                      >
                        Max
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-sm text-giv-neutral-800 font-bold">
                      <span>Available to unstake:</span>
                      <button
                        type="button"
                        className="ml-1 cursor-pointer hover:underline"
                        onClick={() => setAmountToUnstake(availableLabel)}
                        title="Unstake max"
                      >
                        {availableLabel} {pool?.GIVPOWER.title}
                      </button>
                      <button
                        type="button"
                        onClick={handleRefresh}
                        className="ml-1 cursor-pointer"
                        disabled={isRefreshingAvailable}
                        title="Refresh available to unstake"
                      >
                        <IconReload
                          width={24}
                          height={24}
                          fill="var(--giv-brand-500)"
                          className={clsx(
                            'transition-transform duration-200',
                            isRefreshingAvailable ? 'animate-spin' : null,
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
                      'hover:bg-giv-brand-400! transition-colors cursor-pointer',
                      !canSubmit && 'opacity-60 cursor-not-allowed',
                    )}
                    disabled={!canSubmit}
                    onClick={handleUnstake}
                  >
                    Approve
                  </button>

                  {errorMessage && (
                    <div className="mt-4 text-sm text-red-500 text-center">
                      {errorMessage}
                    </div>
                  )}
                </>
              )}

              {flowStep === 'pending' && (
                <>
                  <div className="text-lg font-bold text-giv-neutral-900">
                    Amount to unstake
                  </div>
                  <div className="mt-6 rounded-xl border border-giv-neutral-300 bg-white p-10 text-center">
                    <div className="text-2xl font-medium text-giv-neutral-900">
                      You are unstaking
                    </div>
                    <div className="mt-3 text-3xl font-bold text-giv-neutral-900">
                      {amountToUnstake} {pool?.GIVPOWER.title}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled
                    className={clsx(
                      'w-full mt-6 py-4 bg-giv-brand-100! text-white! rounded-md text-sm font-bold',
                      'flex items-center justify-center gap-2 cursor-not-allowed',
                    )}
                  >
                    Approve Pending
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </button>
                  {txHash && (
                    <a
                      href={getTransactionUrl(
                        pool?.GIVPOWER?.network as number,
                        txHash,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center justify-center gap-2 w-full text-sm font-bold text-giv-brand-700 hover:opacity-80"
                    >
                      View on Blockscout
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </>
              )}

              {flowStep === 'confirmed' && (
                <>
                  <div className="text-lg font-bold text-giv-neutral-900">
                    Amount to unstake
                  </div>
                  <div className="mt-6 rounded-xl border border-giv-neutral-300 bg-white p-10 text-center">
                    <div className="text-2xl font-medium text-giv-neutral-900">
                      You have unstaked
                    </div>
                    <div className="mt-3 text-3xl font-bold text-giv-neutral-900">
                      {amountToUnstake} {pool?.GIVPOWER.title}
                    </div>
                  </div>
                  <div className="mt-6 rounded-xl border border-giv-brand-200 bg-giv-neutral-200 p-4 text-sm text-giv-neutral-700">
                    <div className="font-bold text-giv-neutral-700 mb-1.5">
                      Transaction confirmed!
                    </div>
                    It can take a few minutes for the changes to appear.
                  </div>
                  {txHash && (
                    <Link
                      href={
                        getTransactionUrl(
                          pool?.GIVPOWER?.network as number,
                          txHash,
                        ) as Route
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-10 inline-flex items-center justify-center gap-2 w-full text-sm! font-bold! text-giv-brand-700! hover:opacity-80"
                    >
                      View on Blockscout
                      <ArrowUpRight className="h-5 w-5" />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className={clsx(
                      'w-full mt-6 py-4 bg-giv-brand-050! rounded-md',
                      'flex items-center justify-center gap-2',
                      'text-sm font-bold text-giv-brand-700!',
                      'border border-giv-brand-100 hover:bg-giv-brand-100 transition-colors',
                      'cursor-pointer',
                    )}
                  >
                    Got it
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
