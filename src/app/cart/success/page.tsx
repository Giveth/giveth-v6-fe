import { ShareSection } from '@/components/cart/pending/share-section'
import { SuccessDonationSummary } from '@/components/cart/success/SuccessDonationSummary'
import { SuccessHero } from '@/components/cart/success/SuccessHero'

export default function SuccessPage() {
  return (
    <div className="bg-giv-gray-200 flex flex-col">
      <main className="flex-1 pb-8">
        <SuccessHero />
        <div className="max-w-7xl mx-auto px-4 space-y-6 mt-6">
          <SuccessDonationSummary />
          <ShareSection />
        </div>
      </main>
    </div>
  )
}
