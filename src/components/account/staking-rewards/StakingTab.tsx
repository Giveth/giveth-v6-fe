import { ChainIcon } from '@/components/ChainIcon'
import { HelpTooltip } from '@/components/HelpTooltip'
import { IconStars } from '@/components/icons/IconStars'
import { TokenIcon } from '@/components/TokenIcon'

export function StakingTab({ id }: { id: string }) {
  // Get pools data
  const pool = STAKING_POOLS[id]

  return (
    <div className="bg-white rounded-tl-2xl rounded-b-xl p-8 overflow-hidden">
      <h1 className="text-2xl font-bold text-giv-neutral-900 mb-4">
        Stake GIV
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-giv-brand-100 p-5 pr-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10">
                  <TokenIcon
                    width={40}
                    height={40}
                    tokenSymbol="GIV"
                    networkId={10}
                  />
                  <div className="absolute right-2 bottom-2 w-[9px] h-[10px] bg-white rounded-md">
                    <ChainIcon networkId={10} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-1 text-sm font-medium text-giv-neutral-900">
                  <div>GIV Staking</div>
                  <div className="font-bold">On Gnosis</div>
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
                    16.6%
                  </span>
                  <HelpTooltip text="This is the weighted average APR for your staked (and locked) GIV. The full range of APRs for staking and/or locking is 5.26%-27.34%. Lock your GIV for longer to earn greater rewards." />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-giv-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-giv-neutral-200 pb-4">
              <div className="text-sm text-giv-neutral-600">Staked</div>
              <div className="text-lg font-bold text-giv-neutral-900">
                26,695.36 <span className="text-sm font-medium">GIV</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-giv-neutral-600">Locked</div>
              <div className="text-lg font-bold text-giv-neutral-900">
                4,576.76 <span className="text-sm font-medium">GIV</span>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-xl border border-giv-brand-100 bg-giv-brand-050 px-4 py-2 text-sm font-semibold text-giv-brand-700"
            >
              Locked GIV details
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-giv-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-giv-neutral-900">
              Amount to stake
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-giv-brand-700 hover:text-giv-brand-800"
            >
              Buy / Bridge your GIV →
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-giv-neutral-200 bg-giv-neutral-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-giv-neutral-900">
                <div className="h-8 w-8 rounded-full bg-giv-brand-050" />
                GIV
              </div>
              <div className="text-sm text-giv-neutral-500">$ 0.00</div>
            </div>
            <input
              type="text"
              placeholder="0"
              className="mt-3 w-full bg-transparent text-2xl font-semibold text-giv-neutral-900 outline-none"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {['5%', '10%', '15%', '20%'].map(label => (
                <button
                  key={label}
                  type="button"
                  className="rounded-full border border-giv-brand-100 bg-giv-brand-050 px-3 py-1 text-xs font-semibold text-giv-brand-700"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="text-sm text-giv-neutral-600">
              Available: <span className="font-semibold">24,500 GIV</span>
            </div>
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-giv-brand-100 px-4 py-3 text-sm font-semibold text-giv-neutral-500"
            disabled
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  )
}
