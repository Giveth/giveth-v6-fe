'use client'

import { useState } from 'react'

export function DonationTabs() {
  const [activeTab, setActiveTab] = useState('one-time')

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setActiveTab('one-time')}
        className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          activeTab === 'one-time'
            ? 'bg-[#5326ec] text-white'
            : 'bg-white text-[#82899a] border border-[#ebecf2] hover:border-[#5326ec] hover:text-[#5326ec]'
        }`}
      >
        One-time donations
      </button>
      <button
        onClick={() => setActiveTab('recurring')}
        className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          activeTab === 'recurring'
            ? 'bg-[#5326ec] text-white'
            : 'bg-white text-[#82899a] border border-[#ebecf2] hover:border-[#5326ec] hover:text-[#5326ec]'
        }`}
      >
        Recurring donations
      </button>
    </div>
  )
}
