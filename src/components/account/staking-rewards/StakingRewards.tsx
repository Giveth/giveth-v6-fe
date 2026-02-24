import { useState } from 'react'
import { GIVStreamSection } from '@/components/account/GIVStreamSection'
import { ClaimRewardsBanner } from '@/components/account/staking-rewards/ClaimRewardsBanner'
import { DropdownStakeNetworks } from '@/components/account/staking-rewards/DropdownStakeNetworks'
import { StakeSection } from '@/components/account/staking-rewards/StakeSection'
import { UserGivbacksBanner } from '@/components/user/UserGivbacksBanner'
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
      <StakeSection
        selectedChain={selectedChain}
        onSelectChain={setSelectedChain}
      />
      <div className="mt-12">
        <GIVStreamSection />
      </div>
      <div className="mt-12">
        <UserGivbacksBanner />
      </div>
    </div>
  )
}
