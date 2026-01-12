'use client'

import { useState } from 'react'
import { DonationTabs } from '@/components/account/donation-tabs'
import { DonationTableOneTime } from '@/components/account/DonationTableOneTime'

export function DonationsTable() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('one-time')

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
