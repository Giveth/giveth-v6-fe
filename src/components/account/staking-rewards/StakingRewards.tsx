import { useState } from 'react'
import { ClaimRewardsBanner } from '@/components/account/staking-rewards/ClaimRewardsBanner'
import { DropdownStakeNetworks } from '@/components/account/staking-rewards/DropdownStakeNetworks'
import { STAKING_CHAINS } from '@/lib/constants/staking-power-constants'

export const StakingRewards = () => {
  const [selectedChain, setSelectedChain] = useState(STAKING_CHAINS[0].id)
  const chainLabel =
    STAKING_CHAINS.find(chain => chain.id === selectedChain)?.name ??
    'Select network'

  return (
    <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
      <div className="flex flex-col gap-6 items-end mb-8">
        <DropdownStakeNetworks
          selectedChain={selectedChain}
          chains={STAKING_CHAINS}
          onSelectChain={setSelectedChain}
        />
      </div>
      <ClaimRewardsBanner
        selectedChain={selectedChain}
        chainLabel={chainLabel}
      />
    </div>
  )
}
