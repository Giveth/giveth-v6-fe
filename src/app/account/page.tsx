'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { CtaSection } from '@/components/account/cta-section'
import { DashboardTabs } from '@/components/account/DashboardTabs'
import { DonationsTable } from '@/components/account/DonationsTable'
import { ProfileSection } from '@/components/account/ProfileSection'
// import { RaffleCard } from '@/components/account/raffle-card'
import { Button } from '@/components/ui/button'
import ConnectWalletButton from '@/components/wallet/ConnectWalletButton'
import { useSiweAuth } from '@/context/AuthContext'

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, error, signIn, isConnected } =
    useSiweAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcff] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#5326ec] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#82899a]">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Step 1: User needs to connect wallet
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#fcfcff] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#ebecf2] p-8 max-w-md w-full mx-4 text-center space-y-6">
          <div className="w-16 h-16 bg-[#f6f3ff] rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-[#5326ec]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1f2333] mb-2">
              Connect Your Wallet
            </h1>
            <p className="text-[#82899a]">
              Connect your wallet to access your account dashboard
            </p>
          </div>
          <ConnectWalletButton />
        </div>
      </div>
    )
  }

  // Step 2: User needs to sign in with SIWE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fcfcff] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#ebecf2] p-8 max-w-md w-full mx-4 text-center space-y-6">
          <div className="w-16 h-16 bg-[#f6f3ff] rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-[#5326ec]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1f2333] mb-2">
              Sign In Required
            </h1>
            <p className="text-[#82899a]">
              Please sign a message with your wallet to verify ownership and
              access your account
            </p>
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <Button
            onClick={signIn}
            className="w-full bg-[#5326ec] hover:bg-[#4520c9] text-white py-3"
          >
            Sign Message
          </Button>
          <p className="text-xs text-[#82899a]">
            This signature is free and does not trigger a blockchain transaction
          </p>
        </div>
      </div>
    )
  }

  // User is authenticated, show the protected content
  return <>{children}</>
}

export default function AccountPage() {
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
      <div className="min-h-screen bg-giv-gray-200">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <ProfileSection />
          <DashboardTabs activeTab={activeTab} />
          {/* <RaffleCard /> */}

          {activeTab === 'donations' && <DonationsTable />}
          {activeTab === 'staking' && <DonationsTable />}
          {activeTab === 'boosted' && <DonationsTable />}
          {activeTab === 'projects' && <DonationsTable />}
        </main>
        <CtaSection />
      </div>
    </AuthGate>
  )
}
