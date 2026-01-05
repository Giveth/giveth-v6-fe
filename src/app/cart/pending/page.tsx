'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DonationSummary } from '@/components/cart/pending/DonationSummary'
import { PendingHero } from '@/components/cart/pending/PendingHero'

export default function PendingPage() {
  const router = useRouter()
  useEffect(() => {
    setTimeout(() => {
      router.push('/cart/success' as never)
    }, 2000)
  }, [])
  return (
    <div className="bg-giv-gray-200 flex flex-col">
      <main className="flex-1 pb-8">
        <PendingHero />
        <div className="max-w-7xl mx-auto px-4 space-y-6 mt-6">
          <DonationSummary />
        </div>
      </main>
    </div>
  )
}
