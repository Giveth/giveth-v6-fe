'use client'

import { useState } from 'react'
import { TrendingUp, Gift, Rocket, FolderOpen } from 'lucide-react'

const tabs = [
  { id: 'donations', label: 'My Donations', icon: TrendingUp },
  { id: 'staking', label: 'Staking & Rewards', icon: Gift },
  { id: 'boosted', label: 'Boosted Projects', icon: Rocket },
  { id: 'projects', label: 'My projects', icon: FolderOpen },
]

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState('donations')

  return (
    <div className="flex items-center gap-8 border-b border-[#ebecf2]">
      {tabs.map(tab => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              isActive
                ? 'border-[#5326ec] text-[#5326ec]'
                : 'border-transparent text-[#82899a] hover:text-[#5326ec]'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium text-sm">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
