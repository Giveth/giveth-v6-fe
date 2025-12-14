import { CtaSection } from '@/components/cta-section'
import { DashboardTabs } from '@/components/dashboard-tabs'
import { DonationTabs } from '@/components/donation-tabs'
import { DonationsTable } from '@/components/donations-table'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ProfileSection } from '@/components/profile-section'
import { RaffleCard } from '@/components/raffle-card'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fcfcff]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <ProfileSection />
        <DashboardTabs />
        <RaffleCard />
        <DonationTabs />
        <DonationsTable />
      </main>
      <CtaSection />
      <Footer />
    </div>
  )
}
