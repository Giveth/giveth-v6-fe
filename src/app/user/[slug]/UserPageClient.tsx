'use client'

import { useMemo } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { CtaSection } from '@/components/account/CtaGivBacks'
import { UserBoostedProjects } from '@/components/user/UserBoostTable'
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
  const primaryWalletAddress =
    user?.wallets?.find(wallet => wallet.isPrimary)?.address ||
    user?.wallets?.[0]?.address

  return (
    <div className="min-h-screen bg-giv-neutral-200">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {user && (
          <UserProfileSection user={user} isUserLoading={isUserLoading} />
        )}
        <UserDashboardTabs activeTab={activeTab} />

        {activeTab === 'donations' && (
          <UserDonationsTable userId={user?.id ? Number(user.id) : undefined} />
        )}
        {activeTab === 'boosted' && (
          <UserBoostedProjects
            userId={user?.id ? Number(user.id) : undefined}
            walletAddress={primaryWalletAddress || undefined}
            isUserLoading={isUserLoading}
          />
        )}
      </main>
      <CtaSection />
    </div>
  )
}
