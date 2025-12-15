import { CtaSection } from '@/components/account/cta-section'
import { DashboardTabs } from '@/components/account/dashboard-tabs'
import { DonationTabs } from '@/components/account/donation-tabs'
import { DonationsTable } from '@/components/account/donations-table'
import { ProfileSection } from '@/components/account/profile-section'
import { RaffleCard } from '@/components/account/raffle-card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fcfcff]">
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <ProfileSection />
        <DashboardTabs />
        <RaffleCard />
        <DonationTabs />
        <DonationsTable />
      </main>
      <CtaSection />
    </div>
  )
}
