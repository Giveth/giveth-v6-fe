'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { CtaSection } from '@/components/account/CtaGivBacks'
import { DashboardTabs } from '@/components/account/DashboardTabs'
import { DonationsTable } from '@/components/account/DonationsTable'
import { ProfileSection } from '@/components/account/ProfileSection'

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
    <div className="min-h-screen bg-giv-gray-200">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ProfileSection />
        <DashboardTabs activeTab={activeTab} />

        {activeTab === 'donations' && <DonationsTable />}
        {activeTab === 'staking' && <DonationsTable />}
        {activeTab === 'boosted' && <DonationsTable />}
        {activeTab === 'projects' && <DonationsTable />}
      </main>
      <CtaSection />
    </div>
  )
}
