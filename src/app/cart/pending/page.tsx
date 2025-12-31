'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DonationSummary } from '@/components/cart/pending/donation-summary'
import { PendingHero } from '@/components/cart/pending/PendingHero'
import { ShareSection } from '@/components/cart/pending/share-section'

export default function PendingPage() {
  const router = useRouter()
  useEffect(() => {
    setTimeout(() => {
      // router.push('/cart/success' as never)
    }, 2000)
  }, [])
  return (
    <div className="min-h-screen bg-[#f7f7f9] flex flex-col">
      <main className="flex-1 pb-8">
        <PendingHero />
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <DonationSummary />
          <ShareSection />
        </div>
      </main>
    </div>
  )
}
