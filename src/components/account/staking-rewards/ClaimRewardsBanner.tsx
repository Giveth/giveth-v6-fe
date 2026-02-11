import { useState } from 'react'
import { DropdownStakeNetworks } from '@/components/account/staking-rewards/DropdownStakeNetworks'
import { STAKING_CHAINS } from '@/lib/constants/staking-power-constants'

export const ClaimRewardsBanner = () => {
  const [selectedChain, setSelectedChain] = useState(STAKING_CHAINS[0].id)
  const chainLabel =
    STAKING_CHAINS.find(chain => chain.id === selectedChain)?.name ??
    'Select network'

  return (
    <div className="relative w-full rounded-2xl border border-giv-neutral-200 bg-white px-6 py-5 shadow-sm">
      <DropdownStakeNetworks
        selectedChain={selectedChain}
        chains={STAKING_CHAINS}
        onSelectChain={setSelectedChain}
      />

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
