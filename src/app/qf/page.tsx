import { ActiveRounds } from '@/components/hub/ActiveRounds'
import { ClosedRounds } from '@/components/hub/ClosedRounds'
import { HubHero } from '@/components/hub/HubHero'
import { PassportBanner } from '@/components/PassportBanner'

export default function HubPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f9]">
      {/* Matching Banner */}
      <PassportBanner />

      <HubHero />

      <main className="max-w-7xl mx-auto mt-1 pb-16">
        <ActiveRounds />
        <ClosedRounds />
      </main>
    </div>
  )
}
