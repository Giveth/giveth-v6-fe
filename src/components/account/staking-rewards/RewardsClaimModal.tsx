import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Dialog, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { ExternalLink, X } from 'lucide-react'
import { type Route } from 'next'
import { defineChain } from 'thirdweb'
import {
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from 'thirdweb/react'
import { type Account } from 'thirdweb/wallets'
import { type Address } from 'viem'
import { getTransactionUrl } from '@/lib/helpers/chainHelper'
import { harvestRewards } from '@/lib/helpers/stakeHelper'

type RewardsClaimModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: Account | null
  chainId?: number
  tokenDistroAddress?: Address
  givpowerLmAddress?: Address
  stakedAmount?: bigint
  totalGiv?: string
  totalUsd?: string
  streamRate?: string
  givstreamAmount?: string
  givstreamRate?: string
  givbacksAmount?: string
  givbacksRate?: string
  givfarmAmount?: string
  givfarmRate?: string
  totalRate?: string
}

export default function RewardsClaimModal({
  open,
  onOpenChange,
  account,
  chainId,
  tokenDistroAddress,
  givpowerLmAddress,
  stakedAmount = 0n,
  totalGiv = '0.00',
  totalUsd = '$0.00',
  streamRate = '0.00 GIV/week',
  givstreamAmount = '0.00 GIV',
  givstreamRate = '0.00 GIV/week',
  givbacksAmount = '0.00 GIV',
  givbacksRate = '0.00 GIV/week',
  givfarmAmount = '0.00 GIV',
  givfarmRate = '+0.00 GIV/week',
  totalRate = '0.00 GIV/week',
}: RewardsClaimModalProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null)
  const activeChain = useActiveWalletChain()
  const switchChain = useSwitchActiveWalletChain()

  useEffect(() => {
    if (!open) {
      setIsClaiming(false)
      setClaimTxHash(null)
    }
  }, [open])

  const handleClaim = async () => {
    if (
      !account ||
      !chainId ||
      !tokenDistroAddress ||
      !givpowerLmAddress ||
      isClaiming
    )
      return
    setIsClaiming(true)
    setClaimTxHash(null)
    try {
      // Change user network to the chainId
      if (activeChain?.id !== chainId) {
        await switchChain(defineChain(chainId))
      }
      const txHash = await harvestRewards(
        account,
        chainId,
        givpowerLmAddress,
        tokenDistroAddress,
        stakedAmount,
      )
      setClaimTxHash(txHash)
    } catch (error) {
      console.error(error)
    } finally {
      setIsClaiming(false)
    }
  }

  const isClaimDisabled =
    isClaiming ||
    !account ||
    !chainId ||
    !tokenDistroAddress ||
    !givpowerLmAddress
  const txUrl = claimTxHash
    ? getTransactionUrl(chainId ?? 0, claimTxHash)
    : undefined
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
          'z-50 h-screen w-[90vw]! md:w-[750px]! md:max-w-[750px]!',
          'bg-white py-10! px-8!',
          'rounded-none! md:rounded-l-2xl! rounded-r-none!',
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <Dialog.Title className="text-2xl font-bold text-giv-neutral-900 m-0!">
            Claim Rewards
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            className="text-giv-neutral-900 transition cursor-pointer hover:text-giv-neutral-700"
          >
            <X className="h-6 w-6" />
          </Dialog.Close>
        </div>

        <div className="mt-6 flex h-[calc(100%-48px)] flex-col">
          {!claimTxHash && (
            <>
              <div className="rounded-xl border border-giv-brand-100 p-6 mb-6">
                <Text
                  as="div"
                  className="text-2xl font-bold text-giv-neutral-900"
                >
                  {totalGiv} GIV
                </Text>
                <Text
                  as="div"
                  className="mt-1 text-base text-giv-neutral-900 font-medium"
                >
                  ~ {totalUsd}
                </Text>
                <div className="mt-6 flex flex-col md:flex-row items-center justify-between text-lg text-giv-neutral-700">
                  <span>Your new GIVstream flowrate</span>
                  <span className="font-medium text-giv-neutral-900">
                    {streamRate}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-giv-brand-200 bg-giv-neutral-200 p-6 text-base text-giv-neutral-700 mb-6">
                When you claim GIV, all liquid GIV allocated to you on that
                chain is sent to your wallet. Your GIVstream flowrate may also
                increase. Below is the breakdown of rewards you will get when
                you claim.
              </div>

              <div
                className={clsx(
                  'flex flex-wrap flex-col md:grid md:grid-cols-[1fr_1.5fr_2fr] gap-y-4 gap-x-6 mb-6',
                  'rounded-2xl border border-giv-brand-100 p-6 text-lg text-giv-neutral-900 font-medium',
                )}
              >
                {/* GIVstream */}
                <span>GIVstream</span>

                <div className="flex justify-center md:justify-end gap-2 md:contents">
                  <div className="flex flex-col gap-1 md:contents">
                    <span className="font-semibold md:text-right text-base md:text-lg">
                      {givstreamAmount}
                    </span>
                    {Number(givbacksRate) > 0 && (
                      <span className="text-giv-neutral-600 md:text-right text-xs md:text-sm">
                        Received from GIVbacks
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 md:contents">
                    <span className="text-giv-neutral-700 md:text-right text-base md:text-lg">
                      {givstreamRate}
                    </span>
                    {Number(givbacksRate) > 0 && (
                      <span className="text-giv-neutral-600 md:text-right text-xs md:text-sm">
                        {givbacksRate}
                      </span>
                    )}
                  </div>
                </div>

                {/* GIVbacks */}
                <span>GIVbacks</span>
                <div className="flex justify-center md:justify-end gap-2 md:contents">
                  <span className="font-semibold md:text-right text-base md:text-lg">
                    {givbacksAmount}
                  </span>
                  <span />
                </div>

                {/* GIVpower */}
                <span>GIVpower</span>

                <div className="flex justify-center md:justify-end gap-2 md:contents">
                  <span className="font-semibold md:text-right text-base md:text-lg">
                    {givfarmAmount}
                  </span>
                  <span className="text-giv-neutral-700 md:text-right text-base md:text-lg">
                    {givfarmRate}
                  </span>
                </div>

                {/* Divider */}
                <div className="col-span-2 md:col-span-3 border-t border-giv-neutral-300 my-2" />

                {/* Total */}
                <span />

                <div className="flex justify-center md:justify-end gap-2 md:contents">
                  <span className="font-semibold md:text-right text-base md:text-lg">
                    {totalGiv} GIV
                  </span>
                  <span className="text-giv-neutral-700 md:text-right text-base md:text-lg">
                    {totalRate}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClaim}
                disabled={isClaimDisabled}
                className={clsx(
                  'w-full mt-auto py-3 px-8 bg-giv-brand-300! text-white! rounded-md text-sm font-bold',
                  'border-none! focus:outline-none!',
                  'flex items-center justify-center gap-2 transition-colors cursor-pointer',
                  !isClaimDisabled && 'hover:bg-giv-brand-400!',
                  isClaimDisabled && 'opacity-60 cursor-not-allowed',
                )}
              >
                {isClaiming ? 'Claiming...' : 'Claim Rewards'}
              </button>
            </>
          )}

          {isClaiming && (
            <div className="mt-2 text-center text-xs text-giv-neutral-600">
              Check your wallet to confirm the network switch and claim.
            </div>
          )}
          {!isClaiming && claimTxHash && (
            <div className="text-center rounded-xl border border-giv-brand-200 bg-giv-neutral-200 p-6 text-base text-giv-neutral-700 mt-4">
              <div className="text-base font-semibold">
                Transaction confirmed!
              </div>
              <div className="mt-1 text-base">
                It may take a few minutes for the UI to update.
              </div>
              {txUrl && (
                <Link
                  href={txUrl as Route}
                  target="_blank"
                  rel="noreferrer"
                  className={clsx(
                    'mt-4 inline-flex items-center justify-center gap-1 underline underline-offset-2',
                    'text-xs font-semibold text-giv-brand-600! hover:text-giv-brand-700! transition-colors',
                  )}
                >
                  View on Blockscout
                  <ExternalLink className="w-3.5 h-3.5 text-giv-brand-600! hover:text-giv-brand-700! transition-colors" />
                </Link>
              )}
            </div>
          )}
          <Dialog.Close>
            <button
              type="button"
              className={clsx(
                'w-full mt-4 py-3 px-8 bg-giv-brand-050! text-giv-brand-700! rounded-md text-sm font-bold',
                'border border-giv-brand-100! text-giv-brand-700!',
                'flex items-center justify-center gap-2 hover:bg-giv-brand-400! transition-colors cursor-pointer',
              )}
            >
              Cancel
            </button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
