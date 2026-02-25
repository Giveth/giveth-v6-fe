import { useState } from 'react'
import { GIVStreamSection } from '@/components/account/GIVStreamSection'
import { ClaimRewardsBanner } from '@/components/account/staking-rewards/ClaimRewardsBanner'
import { DropdownStakeNetworks } from '@/components/account/staking-rewards/DropdownStakeNetworks'
import { StakeSection } from '@/components/account/staking-rewards/StakeSection'
import { UserGivbacksBanner } from '@/components/user/UserGivbacksBanner'
import {
  CLAIM_REWARDS_CHAINS,
  STAKING_CHAINS,
} from '@/lib/constants/staking-power-constants'

export const StakingRewards = () => {
  const [claimChain, setClaimChain] = useState(CLAIM_REWARDS_CHAINS[0].id)
  const [stakingChain, setStakingChain] = useState(STAKING_CHAINS[0].id)
  const chainLabel =
    CLAIM_REWARDS_CHAINS.find(chain => chain.id === claimChain)?.name ??
    'Select network'

  return (
    <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
      <div className="flex flex-col gap-6 items-end mb-8">
        <DropdownStakeNetworks
          selectedChain={claimChain}
          chains={CLAIM_REWARDS_CHAINS}
          onSelectChain={setClaimChain}
        />
      </div>
      <ClaimRewardsBanner selectedChain={claimChain} chainLabel={chainLabel} />
      <StakeSection
        selectedChain={stakingChain}
        onSelectChain={setStakingChain}
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
