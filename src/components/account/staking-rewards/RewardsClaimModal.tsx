import { Dialog, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { X } from 'lucide-react'

type RewardsClaimModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalGiv?: string
  totalUsd?: string
  streamRate?: string
  givstreamAmount?: string
  givstreamRate?: string
  givbacksAmount?: string
  givfarmAmount?: string
  givfarmRate?: string
  totalRate?: string
}

export default function RewardsClaimModal({
  open,
  onOpenChange,
  totalGiv = '0.00',
  totalUsd = '$0.00',
  streamRate = '0.00 GIV/week',
  givstreamAmount = '0.00 GIV',
  givstreamRate = '0.00 GIV/week',
  givbacksAmount = '0.00 GIV',
  givfarmAmount = '0.00 GIV',
  givfarmRate = '+0.00 GIV/week',
  totalRate = '0.00 GIV/week',
}: RewardsClaimModalProps) {
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
          'overflow-y-auto bg-white py-10! px-8!',
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

        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-giv-brand-100 p-6">
            <Text as="div" className="text-2xl font-bold text-giv-neutral-900">
              {totalGiv} GIV
            </Text>
            <Text
              as="div"
              className="mt-1 text-base text-giv-neutral-900 font-medium"
            >
              ~ {totalUsd}
            </Text>
            <div className="mt-6 flex items-center justify-between text-lg text-giv-neutral-700">
              <span>Your new GIVstream flowrate</span>
              <span className="font-medium text-giv-neutral-900">
                {streamRate}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-giv-brand-200 bg-giv-neutral-200 p-6 text-base text-giv-neutral-700">
            When you claim GIV, all liquid GIV allocated to you on that chain is
            sent to your wallet. Your GIVstream flowrate may also increase.
            Below is the breakdown of rewards you will get when you claim.
          </div>

          <div className="grid grid-cols-[1fr_1.5fr_2fr] gap-y-4 gap-x-6 rounded-2xl border border-giv-brand-100 p-6 text-lg text-giv-neutral-900 font-medium">
            {/* GIVstream */}
            <span>GIVstream</span>
            <span className="text-right">{givstreamAmount}</span>
            <span className="text-giv-neutral-700 text-right">
              {givstreamRate}
            </span>

            {/* GIVbacks */}
            <span>GIVbacks</span>
            <span className="text-right">{givbacksAmount}</span>
            <span></span>

            {/* GIVfarm */}
            <span>GIVfarm</span>
            <span className="text-right">{givfarmAmount}</span>
            <span className="text-giv-neutral-700 text-right">
              {givfarmRate}
            </span>

            {/* Divider */}
            <div className="col-span-3 border-t border-giv-neutral-300 my-2" />

            {/* Total */}
            <span></span>
            <span className="text-right">{totalGiv} GIV</span>
            <span className="text-giv-neutral-700 text-right">{totalRate}</span>
          </div>

          <button
            type="button"
            className={clsx(
              'w-full mt-30 py-3 px-8 bg-giv-brand-300! text-white! rounded-md text-sm font-bold',
              'border-none! focus:outline-none!',
              'flex items-center justify-center gap-2 hover:bg-giv-brand-400! transition-colors cursor-pointer',
            )}
          >
            Claim Rewards
          </button>

          <Dialog.Close>
            <button
              type="button"
              className={clsx(
                'w-full mt-1.5 py-3 px-8 bg-giv-brand-050! text-giv-brand-700! rounded-md text-sm font-bold',
                'border border-giv-brand-100! text-giv-neutral-900!',
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
