import { Cross2Icon } from '@radix-ui/react-icons'
import { Dialog, Flex, Text } from '@radix-ui/themes'
import clsx from 'clsx'

type RewardsClaimModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalGiv?: string
  totalUsd?: string
  streamRate?: string
  givstreamAmount?: string
  givstreamRate?: string
  givfarmAmount?: string
  givfarmRate?: string
}

export default function RewardsClaimModal({
  open,
  onOpenChange,
  totalGiv = '11,958.50',
  totalUsd = '$36.75',
  streamRate = '5,718.50 GIV/week',
  givstreamAmount = '10,645.50 GIV',
  givstreamRate = '5,711.50 GIV/week',
  givfarmAmount = '1,312.50 GIV',
  givfarmRate = '+6.68 GIV/week',
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
          'z-50 h-screen w-[90vw] md:w-[600px]',
          'overflow-y-auto bg-white p-8',
          'rounded-none md:rounded-l-3xl',
        )}
      >
        <Flex align="start" justify="between" gap="3">
          <Dialog.Title className="text-xl font-semibold text-giv-neutral-900">
            Claim Rewards
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            className="rounded-full p-2 text-giv-neutral-700 transition hover:bg-giv-neutral-100"
          >
            <Cross2Icon className="h-5 w-5" />
          </Dialog.Close>
        </Flex>

        <div className="mt-6 space-y-6">
          <div className="rounded-2xl border border-giv-neutral-200 p-6">
            <Text
              as="div"
              className="text-2xl font-semibold text-giv-neutral-900"
            >
              {totalGiv} GIV
            </Text>
            <Text as="div" className="mt-1 text-sm text-giv-neutral-600">
              ~ {totalUsd}
            </Text>
            <div className="mt-6 flex items-center justify-between text-sm text-giv-neutral-700">
              <span>Your new GIVstream flowrate</span>
              <span className="font-medium text-giv-neutral-900">
                {streamRate}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-giv-neutral-200 bg-giv-neutral-50 p-6 text-sm text-giv-neutral-700">
            When you claim GIV, all liquid GIV allocated to you on that chain is
            sent to your wallet. Your GIVstream flowrate may also increase.
            Below is the breakdown of rewards you will get when you claim.
          </div>

          <div className="rounded-2xl border border-giv-neutral-200 p-6 text-sm text-giv-neutral-900">
            <div className="flex items-center justify-between">
              <span className="font-medium">GIVstream</span>
              <span className="font-semibold">{givstreamAmount}</span>
              <span className="text-giv-neutral-600">{givstreamRate}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-medium">GIVpower</span>
              <span className="font-semibold">{givfarmAmount}</span>
              <span className="text-giv-neutral-600">{givfarmRate}</span>
            </div>
            <div className="mt-6 border-t border-giv-neutral-200 pt-4 text-right font-semibold">
              {totalGiv} GIV
            </div>
          </div>

          <button
            type="button"
            className="w-full rounded-2xl bg-giv-brand-300 py-3 text-sm font-semibold text-white transition hover:bg-giv-brand-400"
          >
            Claim Rewards
          </button>

          <Dialog.Close>
            <button
              type="button"
              className="text-sm font-medium text-giv-neutral-700 hover:text-giv-neutral-900 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
