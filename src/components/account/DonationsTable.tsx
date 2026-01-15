'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DonationTableOneTime } from '@/components/account/DonationTableOneTime'
import { DonationTabs } from '@/components/account/DonationTabs'
import { myRecurringDonationsLink } from '@/lib/constants/menu-links'

export function DonationsTable() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('one-time')

  useEffect(() => {
    if (activeTab === 'recurring') {
      router.push(myRecurringDonationsLink.href as never)
    }
  }, [activeTab, router])
  return (
    <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
      <DonationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px] text-[#82899a]">
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
