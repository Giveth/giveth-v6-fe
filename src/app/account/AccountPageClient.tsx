'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { AuthGate } from '@/components/account/AuthGate'
import { CtaSection } from '@/components/account/CtaGivBacks'
import { DashboardTabs } from '@/components/account/DashboardTabs'
import { DonationsTable } from '@/components/account/DonationsTable'
import { ProfileSection } from '@/components/account/ProfileSection'
import { StakingRewards } from '@/components/account/staking-rewards/StakingRewards'
import { UserProjectsTab } from '@/components/account/UserProjectsTab'

export default function AccountPageClient() {
  const searchParams = useSearchParams()

  const allowedTabs = useMemo(
    () => ['donations', 'staking', 'boosted', 'projects'] as const,
    [],
  )
  type AllowedTab = (typeof allowedTabs)[number]

  const tabFromUrl = searchParams.get('tab')
  const activeTab: AllowedTab = (allowedTabs as readonly string[]).includes(
    tabFromUrl ?? '',
  )
    ? (tabFromUrl as AllowedTab)
    : 'donations'

  return (
    <AuthGate>
      <div className="min-h-screen bg-giv-neutral-200">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <ProfileSection />
          <DashboardTabs activeTab={activeTab} />

          {activeTab === 'staking' && <StakingRewards />}
          {activeTab === 'donations' && <DonationsTable />}
          {activeTab === 'boosted' && <DonationsTable />}
          {activeTab === 'projects' && <UserProjectsTab />}
        </main>
        <CtaSection />
      </div>
    </AuthGate>
  )
}
