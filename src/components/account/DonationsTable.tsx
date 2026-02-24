'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type Route } from 'next'
import { DonationTableOneTime } from '@/components/account/DonationTableOneTime'
import { DonationTabs } from '@/components/account/DonationTabs'
import { EligibilityBanner } from '@/components/eligibility/EligibilityBanner'
import { UserGivbacksBanner } from '@/components/user/UserGivbacksBanner'
import { myRecurringDonationsLink } from '@/lib/constants/menu-links'

export function DonationsTable() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('one-time')

  useEffect(() => {
    if (activeTab === 'recurring') {
      router.push(myRecurringDonationsLink.href as unknown as Route)
    }
  }, [activeTab, router])
  return (
    <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
      <div className="mb-12">
        <UserGivbacksBanner />
      </div>
      <div className="mb-12">
        <EligibilityBanner />
      </div>
      <DonationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px] text-giv-neutral-700">
            Loading donations...
          </div>
        )}

        {activeTab === 'one-time' && (
          <DonationTableOneTime setIsLoading={setIsLoading} />
        )}
      </div>
    </div>
  )
}
