import { useState } from 'react'
import { defineChain } from 'thirdweb'
import {
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from 'thirdweb/react'
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
  const activeChain = useActiveWalletChain()
  const switchChain = useSwitchActiveWalletChain()

  const [claimChain, setClaimChain] = useState(CLAIM_REWARDS_CHAINS[0].id)
  const [stakingChain, setStakingChain] = useState(STAKING_CHAINS[0].id)
  const [givstreamChain, setGivstreamChain] = useState(STAKING_CHAINS[0].id)
  const chainLabel =
    CLAIM_REWARDS_CHAINS.find(chain => chain.id === claimChain)?.name ??
    'Select network'

  const isStakingChain = (chainId: number) => chainId === 10 || chainId === 100

  const handleClaimChainChange = (chainId: number) => {
    setClaimChain(chainId)
    if (isStakingChain(chainId)) {
      setStakingChain(chainId)
      setGivstreamChain(chainId)
    }
  }

  // Change user network to the chainId, if not already on the correct network
  const handleStakingChainChange = (chainId: number) => {
    if (activeChain?.id !== chainId) {
      switchChain(defineChain(chainId))
    }
    setStakingChain(chainId)
    setGivstreamChain(chainId)
    if (isStakingChain(chainId)) {
      setClaimChain(chainId)
    }
  }

  const handleGivstreamChainChange = (chainId: number) => {
    setGivstreamChain(chainId)
    setStakingChain(chainId)
    if (isStakingChain(chainId)) {
      setClaimChain(chainId)
    }
  }

  return (
    <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
      <div className="flex flex-col gap-6 items-end mb-8">
        <DropdownStakeNetworks
          selectedChain={claimChain}
          chains={CLAIM_REWARDS_CHAINS}
          onSelectChain={handleClaimChainChange}
        />
      </div>
      <ClaimRewardsBanner selectedChain={claimChain} chainLabel={chainLabel} />
      <StakeSection
        selectedChain={stakingChain}
        onSelectChain={handleStakingChainChange}
      />
      <div className="mt-12">
        <GIVStreamSection
          selectedChain={givstreamChain}
          onSelectChain={handleGivstreamChainChange}
        />
      </div>
      <div className="mt-12">
        <UserGivbacksBanner />
      </div>
    </div>
  )
}
