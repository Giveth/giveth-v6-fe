import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const CHAINS = ['Optimism', 'Ethereum', 'Gnosis']

export const ClaimRewardsBanner = () => {
  const [selectedChain, setSelectedChain] = useState(CHAINS[0])
  const chainLabel = selectedChain ?? 'Select network'

  return (
    <div className="relative w-full rounded-2xl border border-giv-neutral-200 bg-white px-6 py-5 shadow-sm">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-xl border border-giv-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-giv-neutral-900 transition hover:bg-giv-neutral-100"
          >
            {chainLabel}
            <span className="text-xs text-giv-neutral-600">v</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={8}
            align="end"
            className="z-50 min-w-[160px] rounded-xl border border-giv-neutral-200 bg-white p-1 shadow-[0px_6px_24px_rgba(0,0,0,0.08)]"
          >
            {CHAINS.map(chain => (
              <DropdownMenu.Item
                key={chain}
                onSelect={() => setSelectedChain(chain)}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-giv-neutral-900 outline-none hover:bg-giv-neutral-100 focus:bg-giv-neutral-100"
              >
                {chain}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-giv-neutral-700">
          <div className="font-medium text-giv-neutral-900">
            Total GIV claimable
          </div>
          <div className="mt-1">on {chainLabel}</div>
        </div>

        <div className="text-center md:text-left">
          <div className="text-2xl font-semibold text-giv-neutral-900">
            274,901 GIV
          </div>
          <div className="mt-1 text-sm text-giv-neutral-600">~$970.60</div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-giv-brand-300 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-giv-brand-400"
        >
          Claim Rewards
        </button>
      </div>
    </div>
  )
}
