import { ShareSection } from '@/components/cart/pending/share-section'
import { SuccessDonationSummary } from '@/components/cart/success/success-donation-summary'
import { SuccessHero } from '@/components/cart/success/success-hero'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f9]">
      <main className="py-8">
        <SuccessHero />
        <div className="max-w-3xl mx-auto px-6 space-y-6 mt-8">
          <SuccessDonationSummary />
          <ShareSection />
        </div>
      </main>
    </div>
  )
}
