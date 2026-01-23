'use client'

import { useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { CtaSection } from '@/components/account/CtaGivBacks'
import { UserDashboardTabs } from '@/components/user/UserDashboardTabs'
import { UserDonationsTable } from '@/components/user/UserDonationsTable'
import { UserProfileSection } from '@/components/user/UserProfileSection'
import { useUserByAddress } from '@/hooks/useAccount'

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

  // Get user data by slug if exists
  const pathname = usePathname()
  const slug = pathname.split('/').pop()
  const { data: userData, isLoading: isUserLoading } = useUserByAddress(
    slug || undefined,
  )
  const user = userData?.userByAddress

  return (
    <div className="min-h-screen bg-giv-gray-200">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {user && (
          <UserProfileSection user={user} isUserLoading={isUserLoading} />
        )}
        <UserDashboardTabs activeTab={activeTab} />

        {activeTab === 'donations' && (
          <UserDonationsTable userId={user?.id ? Number(user.id) : undefined} />
        )}
      </main>
      <CtaSection />
    </div>
  )
}
