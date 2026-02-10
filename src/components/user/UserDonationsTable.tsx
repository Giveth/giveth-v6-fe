'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { type Route } from 'next'
import { UserDonationTableOneTime } from '@/components/user/UserDonationTableOneTime'
import { UserDonationTabs } from '@/components/user/UserDonationTabs'
import { myRecurringDonationsLink } from '@/lib/constants/menu-links'

export function UserDonationsTable({ userId }: { userId?: number }) {
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
      <UserDonationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="relative">
        {isLoading && (
          <div
            className={clsx(
              'absolute inset-0 z-10 flex items-center justify-center',
              'bg-white/70 backdrop-blur-[1px] text-giv-neutral-700',
            )}
          >
            Loading donations...
          </div>
        )}

        {activeTab === 'one-time' && (
          <UserDonationTableOneTime
            userId={userId ?? 0}
            setIsLoading={setIsLoading}
          />
        )}
      </div>
    </div>
  )
}
