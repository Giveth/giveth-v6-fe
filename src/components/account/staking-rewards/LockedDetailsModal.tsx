import { useEffect, useMemo, useState } from 'react'
import { Dialog } from '@radix-ui/themes'
import clsx from 'clsx'
import { LockKeyhole, LockKeyholeOpen, X } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'
import { type Address } from 'viem'
import { HelpTooltip } from '@/components/HelpTooltip'
import { STAKING_POOLS } from '@/lib/constants/staking-power-constants'
import {
  fetchAvailableToLock,
  fetchStaking,
  fetchTokenLocks,
  formatToken,
  type TokenLock,
} from '@/lib/helpers/stakeHelper'

type RewardsClaimModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  chainId: number
  tokenSymbol: string
}

export default function LockedDetailsModal({
  open,
  onOpenChange,
  chainId,
  tokenSymbol,
}: RewardsClaimModalProps) {
  const account = useActiveAccount()
  const [locks, setLocks] = useState<TokenLock[]>([])
  const [availableToUnstake, setAvailableToUnstake] = useState<bigint>(0n)
  const [baseApr, setBaseApr] = useState<number>(0)
  const [totalStaked, setTotalStaked] = useState<bigint>(0n)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setLocks([])
      setAvailableToUnstake(0n)
      setBaseApr(0)
      setTotalStaked(0n)
      setIsLoading(false)
    }
  }, [open])
  const tokenDecimals = useMemo(() => {
    if (!chainId) return 18
    return STAKING_POOLS[chainId]?.GIVPOWER?.decimals ?? 18
  }, [chainId])

  useEffect(() => {
    if (!open || !account?.address || !chainId) return
    let cancelled = false
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [locksData, availableData, stakingData] = await Promise.all([
          fetchTokenLocks(account.address as Address, chainId),
          fetchAvailableToLock(account.address as Address, chainId),
          fetchStaking(account.address as Address, chainId),
        ])

        if (!cancelled) {
          setLocks(locksData)
          setAvailableToUnstake(availableData.availableToLock)
          setTotalStaked(availableData.totalDeposited)
          setBaseApr(stakingData.baseAPR ?? stakingData.apr ?? 0)
        }
      } catch (error) {
        console.error('Failed to load locked details:', error)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [account?.address, chainId, open])

  const availableToUnstakeLabel = formatToken(availableToUnstake, tokenDecimals)
  const totalStakedLabel = formatToken(totalStaked, tokenDecimals)
  const aprLabel = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(baseApr)
  const formatUnlockDate = (timestamp?: number) => {
    if (!timestamp) return '-'
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(timestamp * 1000))
  }

  const rows = locks.map(lock => {
    const rounds = lock.rounds ?? 0
    const multiplier = Math.sqrt(1 + rounds)
    const boostedApr = baseApr * multiplier
    return {
      id: lock.id ?? `${lock.amount}-${lock.unlockableAt}`,
      amount: formatToken(lock.amount, tokenDecimals),
      roundsLabel: rounds === 1 ? '1 Round' : `${rounds} Rounds`,
      multiplier: multiplier.toFixed(2),
      boostedApr: new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(boostedApr),
      unlockDate: formatUnlockDate(lock.unlockableAt),
    }
  })

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          left: 'auto',
          transform: 'none',
        }}
        className={clsx(
          'z-50 h-screen w-[90vw]! md:w-[800px]! md:max-w-[800px]!',
          'bg-white py-10! px-8!',
          'rounded-none! md:rounded-l-2xl! rounded-r-none!',
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <Dialog.Title className="text-2xl font-bold text-giv-neutral-900 m-0!">
            Locked {tokenSymbol} Details
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            className="text-giv-neutral-900 transition cursor-pointer hover:text-giv-neutral-700"
          >
            <X className="h-6 w-6" />
          </Dialog.Close>
        </div>

        <div className="mt-8 flex h-[calc(100%-48px)] flex-col">
          <div className="rounded-xl bg-giv-neutral-200 border border-giv-brand-200 p-6 text-base text-giv-neutral-700">
            Review your staked {tokenSymbol}, lockup periods, multipliers &
            earnings.
          </div>

          <div className="mt-6 rounded-xl border border-giv-neutral-100 p-6">
            <div className="mb-6 text-xl font-bold text-giv-neutral-900">
              <div className="inline-flex items-center gap-2">
                <span>Available to unstake</span>
                <LockKeyholeOpen width={24} height={24} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="mt-1 text-2xl font-bold text-giv-neutral-900">
                {availableToUnstakeLabel} {tokenSymbol}
              </div>
              <span className="inline-flex items-center gap-2 text-lg font-medium text-giv-neutral-900">
                <span className="font-bold">{aprLabel}%</span>
                <span className="ml-1">APR</span>
                <HelpTooltip
                  text="The minimum APR for staked (not locked) GIV. Lock your GIV to increase your rewards."
                  className="py-0.5! px-1.5! bg-giv-neutral-700!"
                  width={1}
                  height={1}
                  fontSize="text-[9px]"
                />
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-giv-neutral-100 bg-white p-6">
            <div className="flex items-center justify-between text-xl font-bold text-giv-neutral-900">
              <div className="inline-flex items-center gap-2">
                <span>Locked {tokenSymbol}</span>
                <LockKeyhole width={24} height={24} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-5 gap-2 text-lg font-bold text-giv-neutral-800 bg-giv-neutral-300 py-2 px-3 rounded-xl">
              <div>Amount</div>
              <div>Locked for</div>
              <div>Multiplier</div>
              <div>APR</div>
              <div>Unlock Date</div>
            </div>

            <div className="mt-1 max-h-[260px] overflow-y-auto">
              {isLoading ? (
                <div className="py-6 text-sm text-giv-neutral-600">
                  Loading locks...
                </div>
              ) : rows.length === 0 ? (
                <div className="py-6 text-sm text-giv-neutral-600">
                  No locked positions found.
                </div>
              ) : (
                rows.map(row => (
                  <div
                    key={row.id}
                    className="grid grid-cols-5 gap-2 py-4 px-3 text-lg font-medium text-giv-neutral-800 even:bg-giv-neutral-200 rounded-xl"
                  >
                    <div className="text-giv-neutral-900">{row.amount}</div>
                    <div>{row.roundsLabel}</div>
                    <div>{row.multiplier}</div>
                    <div>{row.boostedApr}%</div>
                    <div>{row.unlockDate}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-giv-neutral-100 bg-white p-6">
            <div className="flex items-center justify-between text-xl font-bold text-giv-neutral-900">
              <div className="inline-flex items-center gap-2">
                <span>Total Staked {tokenSymbol}</span>
                <HelpTooltip
                  text={`All your staked ${tokenSymbol}, including ${tokenSymbol} that is locked.`}
                  className="py-0.5! px-1.5! bg-giv-neutral-700!"
                  width={1}
                  height={1}
                  fontSize="text-[9px]"
                />
              </div>
            </div>
            <div className="mt-5 text-2xl font-bold text-giv-neutral-900">
              <div className="inline-flex items-center gap-2">
                <span>{totalStakedLabel}</span>
                <span className="text-lg">{tokenSymbol}</span>
              </div>
            </div>
          </div>

          <Dialog.Close>
            <button
              type="button"
              className={clsx(
                'w-full mt-6 py-3 px-8 bg-giv-brand-050! text-giv-brand-700! rounded-md text-sm font-bold',
                'border border-giv-brand-100! text-giv-brand-700!',
                'flex items-center justify-center gap-2 hover:bg-giv-brand-400! transition-colors cursor-pointer',
              )}
            >
              Close
            </button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
