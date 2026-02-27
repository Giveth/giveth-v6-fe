'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { useActiveAccount } from 'thirdweb/react'
import { type Address } from 'viem'
import LockedDetailsModal from '@/components/account/staking-rewards/LockedDetailsModal'
import { ChainIcon } from '@/components/ChainIcon'
import { HelpTooltip } from '@/components/HelpTooltip'
import { IconGIVPower } from '@/components/icons/IconGIVPower'
import { IconStars } from '@/components/icons/IconStars'
import { IconStarsSecond } from '@/components/icons/IconStarsSecond'
import { TokenIcon } from '@/components/TokenIcon'
import {
  STAKING_CHAINS,
  STAKING_POOLS,
} from '@/lib/constants/staking-power-constants'
import {
  calculateMultiplier,
  fetchAvailableToLock,
  fetchGIVpowerAPRRange,
  fetchStaking,
  fetchWalletBalance,
  formatToken,
  LOCK_CONSTANTS,
} from '@/lib/helpers/stakeHelper'

type StakeSectionProps = {
  selectedChain: number
  onSelectChain: (chainId: number) => void
}

type ChainStakeInfo = {
  staked: bigint
  apr: number
  locked: bigint
  wallet: bigint
  availableToLock: bigint
  boostedAPR: number
  baseAPR: number
  boostMultiplier: number
}

export const StakeSection = ({
  selectedChain,
  onSelectChain,
}: StakeSectionProps) => {
  const router = useRouter()
  const account = useActiveAccount()
  const [stakingByChain, setStakingByChain] = useState<
    Record<number, ChainStakeInfo>
  >({})
  const [aprRangeByChain, setAprRangeByChain] = useState<
    Record<number, { baseApr: number; maxApr: number }>
  >({})

  const [isLockedDetailsModalOpen, setIsLockedDetailsModalOpen] =
    useState(false)

  const chains = useMemo(
    () =>
      STAKING_CHAINS.filter(chain =>
        Boolean(STAKING_POOLS[chain.id]?.GIVPOWER),
      ),
    [],
  )

  const tokenDecimals = useMemo(() => {
    return STAKING_POOLS[selectedChain]?.GIVPOWER?.decimals ?? 18
  }, [chains, selectedChain])

  useEffect(() => {
    if (!account?.address) return
    let cancelled = false

    const fetchAll = async () => {
      const results = await Promise.all(
        chains.map(async chain => {
          const [stakingResult, availableResult] = await Promise.allSettled([
            fetchStaking(account.address as Address, chain.id),
            fetchAvailableToLock(account.address as Address, chain.id),
          ])
          const walletResult = await fetchWalletBalance(
            account.address as Address,
            chain.id,
          ).catch(() => 0n)

          const fallbackStaked =
            availableResult.status === 'fulfilled'
              ? availableResult.value.totalDeposited
              : 0n
          const lockedAmount =
            availableResult.status === 'fulfilled'
              ? availableResult.value.alreadyLocked
              : 0n
          const availableAmount =
            availableResult.status === 'fulfilled'
              ? availableResult.value.availableToLock
              : 0n

          return {
            chainId: chain.id,
            staked:
              stakingResult.status === 'fulfilled'
                ? stakingResult.value.staked
                : fallbackStaked,
            apr:
              stakingResult.status === 'fulfilled'
                ? stakingResult.value.apr
                : 0,
            boostedAPR:
              stakingResult.status === 'fulfilled'
                ? (stakingResult.value.boostedAPR ?? stakingResult.value.apr)
                : 0,
            baseAPR:
              stakingResult.status === 'fulfilled'
                ? (stakingResult.value.baseAPR ?? stakingResult.value.apr)
                : 0,
            boostMultiplier:
              stakingResult.status === 'fulfilled'
                ? (stakingResult.value.boostMultiplier ?? 1)
                : 1,
            locked: lockedAmount,
            wallet: walletResult,
            availableToLock: availableAmount,
          }
        }),
      )

      const next: Record<number, ChainStakeInfo> = {}
      results.forEach(result => {
        next[result.chainId] = {
          staked: result.staked,
          apr: result.apr,
          boostedAPR: result.boostedAPR,
          baseAPR: result.baseAPR,
          boostMultiplier: result.boostMultiplier,
          locked: result.locked,
          wallet: result.wallet,
          availableToLock: result.availableToLock,
        }
      })

      if (!cancelled) {
        setStakingByChain(next)
      }
    }

    fetchAll()
    return () => {
      cancelled = true
    }
  }, [account?.address, chains])

  useEffect(() => {
    let cancelled = false

    const fetchRanges = async () => {
      const results = await Promise.allSettled(
        chains.map(async chain => ({
          chainId: chain.id,
          range: await fetchGIVpowerAPRRange(chain.id),
        })),
      )
      const next: Record<number, { baseApr: number; maxApr: number }> = {}
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          next[result.value.chainId] = result.value.range
        }
      })
      if (!cancelled) {
        setAprRangeByChain(next)
      }
    }

    fetchRanges()
    return () => {
      cancelled = true
    }
  }, [chains])

  const selectedStake = stakingByChain[selectedChain] ?? {
    staked: 0n,
    apr: 0,
    boostedAPR: 0,
    baseAPR: 0,
    boostMultiplier: 1,
    locked: 0n,
    wallet: 0n,
    availableToLock: 0n,
  }
  const availableToLock = selectedStake.availableToLock
  const canLock = availableToLock > 0n
  const canUnstake = selectedStake.availableToLock > 0n
  const canStake = selectedStake.wallet > 0n

  const formatApr = (value: number) =>
    `${new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}%`

  const getAprLabel = (chainId: number, chainInfo?: ChainStakeInfo) => {
    const info = chainInfo ?? {
      staked: 0n,
      apr: 0,
      boostedAPR: 0,
      baseAPR: 0,
      boostMultiplier: 1,
      locked: 0n,
      wallet: 0n,
      availableToLock: 0n,
    }
    const hasStake = info.availableToLock + info.locked > 0n
    const range = aprRangeByChain[chainId]
    const rangeBase =
      range?.baseApr ?? (Number.isFinite(info.baseAPR) ? info.baseAPR : 0)
    const rangeMax =
      range?.maxApr ??
      rangeBase * calculateMultiplier(LOCK_CONSTANTS.MAX_ROUNDS)
    const rangeLabel =
      rangeBase > 0 ? `${rangeBase.toFixed(2)}%-${rangeMax.toFixed(2)}%` : null
    if (
      (!account?.address ||
        !hasStake ||
        !Number.isFinite(info.boostedAPR) ||
        info.boostedAPR <= 0) &&
      rangeLabel
    ) {
      return rangeLabel
    }
    return formatApr(info.boostedAPR ?? info.apr ?? 0)
  }

  const availableToLockLabel = formatToken(availableToLock, tokenDecimals)
  const totalLockedAmountLabel = formatToken(
    selectedStake.locked + availableToLock,
    tokenDecimals,
  )
  const walletAmountLabel = formatToken(selectedStake.wallet, tokenDecimals)
  const walletDisplayLabel =
    walletAmountLabel === '0.00' && selectedStake.wallet > 0n
      ? '< 0.00'
      : walletAmountLabel

  return (
    <>
      <div className="mt-10">
        <h2 className="mb-6 flex w-full items-center">
          <IconGIVPower width={24} height={24} fill="var(--giv-neutral-900)" />
          <span className="ml-2 text-lg font-bold text-giv-neutral-900">
            Stake for GIVpower
          </span>
        </h2>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-3">
            <div className="flex max-h-[390px] flex-col gap-3 overflow-y-auto pr-3">
              {chains.map(chain => {
                const chainInfo = stakingByChain[chain.id]
                const isSelected = chain.id === selectedChain
                return (
                  <button
                    key={chain.id}
                    type="button"
                    onClick={() => onSelectChain(chain.id)}
                    className={clsx(
                      'relative flex items-center justify-between rounded-xl border px-4 py-6 text-left',
                      'transition-colors cursor-pointer',

                      // Default
                      !isSelected &&
                        'border border-giv-neutral-300 hover:bg-giv-neutral-100',

                      // Selected = bubble + arrow
                      isSelected &&
                        `border-2
                      border-giv-brand-200 bg-giv-brand-100
                  
                      after:absolute after:right-[-9px] after:top-1/2
                      after:h-4 after:w-4
                      after:-translate-y-1/2 after:rotate-45
                      after:bg-giv-brand-100
                      after:border-r-2 after:border-t-2 after:border-giv-brand-200
                    `,
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10">
                        <TokenIcon
                          width={40}
                          height={40}
                          tokenSymbol="GIV"
                          networkId={selectedChain}
                        />
                        <div className="absolute right-2 bottom-2 w-[9px] h-[10px] bg-white rounded-md">
                          <ChainIcon networkId={chain.id} />
                        </div>
                      </div>
                      <div className="text-sm font-bold text-giv-neutral-900">
                        On {chain.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-giv-neutral-900">
                      <span className="text-base font-medium text-giv-neutral-900">
                        APR
                      </span>
                      <span className="text-lg font-bold text-giv-neutral-900">
                        <IconStars width={24} height={24} />
                      </span>
                      <span>
                        <HelpTooltip
                          text="This is the weighted average APR for your staked (and locked) GIV. The full range of APRs for staking and/or locking is 5.26%-27.34%. Lock your GIV for longer to earn greater rewards."
                          className="py-0.5! px-1.5! bg-giv-neutral-700!"
                          width={1}
                          height={1}
                          fontSize="text-[9px]"
                        />
                      </span>
                      <span
                        className={clsx(
                          getAprLabel(chain.id, chainInfo).startsWith('<')
                            ? 'w-20'
                            : 'w-auto',
                          'text-lg font-bold text-giv-neutral-900',
                        )}
                      >
                        {getAprLabel(chain.id, chainInfo)}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border-2 border-giv-brand-200 bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10">
                  <TokenIcon
                    width={40}
                    height={40}
                    tokenSymbol="GIV"
                    networkId={selectedChain}
                  />
                  <div className="absolute right-2 bottom-2 w-[9px] h-[10px] bg-white rounded-md">
                    <ChainIcon networkId={selectedChain} />
                  </div>
                </div>
                <div className="text-sm font-bold text-giv-neutral-900">
                  On {chains.find(chain => chain.id === selectedChain)?.name}
                </div>
              </div>
              <div
                className={clsx(
                  'flex items-center gap-1',
                  'py-2 px-3 rounded-xl',
                  'bg-giv-neutral-300',
                  'text-sm font-semibold text-giv-neutral-900',
                )}
              >
                <span className="text-base font-neutral text-giv-neutral-900">
                  APR
                </span>
                <IconStars width={24} height={24} />
                <span className="ml-3 text-lg font-bold text-giv-neutral-900">
                  {getAprLabel(selectedChain, selectedStake)}
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

            <div className="mt-4 flex items-center justify-between py-3">
              <span className="flex items-center gap-2">
                <IconStarsSecond width={24} height={24} />
                <span className="ml-1 font-medium text-giv-neutral-900">
                  Available to lock
                </span>
              </span>
              <span className="font-medium text-giv-neutral-800">
                {availableToLockLabel}{' '}
                {STAKING_POOLS[selectedChain]?.GIVPOWER?.title}
              </span>
            </div>

            <button
              type="button"
              disabled={!canLock}
              onClick={() => {
                router.push(
                  `/account/stake/${selectedChain}?tab=multiple-rewards` as never,
                )
              }}
              className={clsx(
                'flex items-center justify-center gap-2',
                'mt-2 w-full rounded-xl border px-4 py-3',
                'text-sm font-bold transition-colors',
                canLock
                  ? 'border border-giv-brand-100 bg-giv-brand-050 text-giv-brand-700 hover:opacity-80 cursor-pointer'
                  : 'cursor-not-allowed border-giv-neutral-200 bg-giv-neutral-100 text-giv-neutral-400',
              )}
            >
              <span>Lock &amp; Increase Rewards</span>
              <IconStarsSecond
                width={24}
                height={24}
                fill="var(--giv-brand-700)"
              />
            </button>

            <div className="mt-6 flex justify-between gap-6">
              <div className="w-1/2 flex flex-col items-center gap-2">
                <button
                  type="button"
                  disabled={!canStake}
                  onClick={() => {
                    router.push(`/account/stake/${selectedChain}` as never)
                  }}
                  className={clsx(
                    'w-full px-4 py-3',
                    'rounded-xl border text-sm font-bold',
                    canStake
                      ? 'border-giv-brand-100 bg-white text-giv-brand-700 hover:opacity-80 cursor-pointer'
                      : 'cursor-not-allowed border-giv-neutral-200 bg-giv-neutral-100 text-giv-neutral-400',
                  )}
                >
                  Stake
                </button>
                <div className="font-medium text-giv-neutral-800">
                  {walletDisplayLabel}{' '}
                  {STAKING_POOLS[selectedChain]?.GIVPOWER?.title}
                </div>
              </div>
              <div className="w-1/2 flex flex-col items-center gap-2">
                <button
                  type="button"
                  disabled={!canUnstake}
                  onClick={() => {
                    router.push(
                      `/account/stake/${selectedChain}?tab=unstake` as never,
                    )
                  }}
                  className={clsx(
                    'w-full px-4 py-3',
                    'rounded-xl border text-sm font-bold',
                    canUnstake
                      ? 'border-giv-brand-100 bg-white text-giv-brand-700 hover:opacity-80 cursor-pointer'
                      : 'cursor-not-allowed border-giv-neutral-200 bg-giv-neutral-100 text-giv-neutral-400',
                  )}
                >
                  Unstake
                </button>
                <div className="inline-flex items-center gap-1 font-medium text-giv-neutral-800">
                  <span>
                    {totalLockedAmountLabel}{' '}
                    {STAKING_POOLS[selectedChain]?.GIVPOWER?.title}
                  </span>
                  <HelpTooltip
                    text="Total locked GIV for this pool."
                    className="py-0.5! px-1.5! bg-giv-neutral-700!"
                    width={1}
                    height={1}
                    fontSize="text-[9px]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLockedDetailsModalOpen(true)}
                className="text-center text-sm font-bold text-giv-brand-700! hover:text-giv-brand-800! cursor-pointer"
              >
                Locked GIV details
              </button>
            </div>
          </div>
        </div>
      </div>
      <LockedDetailsModal
        open={isLockedDetailsModalOpen}
        onOpenChange={setIsLockedDetailsModalOpen}
        chainId={Number(selectedChain)}
        tokenSymbol={STAKING_POOLS[selectedChain]?.GIVPOWER?.title}
      />
    </>
  )
}
