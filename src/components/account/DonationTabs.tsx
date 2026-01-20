'use client'

interface DonationTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function DonationTabs({ activeTab, onTabChange }: DonationTabsProps) {
  const handleTabClick = (tab: string) => {
    onTabChange(tab)
  }

  // For now we don't display other options, so we return null
  return null

  return (
    <div className="flex items-center gap-3 mb-8">
      <button
        onClick={() => handleTabClick('one-time')}
        className={`px-6 py-2.5 rounded-2xl text-base font-bold transition-colors border cursor-pointer hover:opacity-85 ${
          activeTab === 'one-time'
            ? 'text-giv-primary-400 border-giv-primary-300 bg-giv-primary-50'
            : 'text-giv-gray-700 border-giv-primary-100 bg-[#FCFCFF]'
        }`}
      >
        One-time donations
      </button>
      <button
        onClick={() => handleTabClick('recurring')}
        className={`px-6 py-2.5 rounded-2xl text-base font-bold transition-colors border cursor-pointer hover:opacity-85 ${
          activeTab === 'recurring'
            ? 'text-giv-primary-400 border-giv-primary-300 bg-giv-primary-50'
            : 'text-giv-gray-700 border-giv-primary-100 bg-[#FCFCFF]'
        }`}
      >
        Recurring donations
      </button>
    </div>
  )
}
