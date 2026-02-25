'use client'

import { useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { AuthGate } from '@/components/account/AuthGate'
import { CtaSection } from '@/components/account/CtaGivBacks'
import { IncreaseRewardTab } from '@/components/account/staking-rewards/IncreaseRewatdTab'
import { StakingTab } from '@/components/account/staking-rewards/StakingTab'
import { StakingTabs } from '@/components/account/staking-rewards/StakingTabs'
import { UnstakeTab } from '@/components/account/staking-rewards/UnstakeTab'

export default function StakePageClient({ id }: { id: string }) {
  const params = useParams()
  const routeId =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : id

  if (!routeId) {
    return <div>Invalid pool ID</div>
  }

  const searchParams = useSearchParams()

  const allowedTabs = useMemo(
    () => ['stake', 'multiple-rewards', 'unstake'] as const,
    [],
  )
  type AllowedTab = (typeof allowedTabs)[number]

  const tabFromUrl = searchParams.get('tab')
  const activeTab: AllowedTab = (allowedTabs as readonly string[]).includes(
    tabFromUrl ?? '',
  )
    ? (tabFromUrl as AllowedTab)
    : 'stake'

  return (
    <AuthGate>
      <div className="min-h-screen bg-giv-neutral-200">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <StakingTabs activeTab={activeTab} />

          {activeTab === 'stake' && <StakingTab id={routeId} />}
          {activeTab === 'multiple-rewards' && (
            <IncreaseRewardTab id={routeId} />
          )}
          {activeTab === 'unstake' && <UnstakeTab id={routeId} />}
        </main>
        <CtaSection />
      </div>
    </AuthGate>
  )
}
