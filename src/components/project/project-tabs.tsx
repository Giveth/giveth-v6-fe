'use client'

interface ProjectTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  updatesCount?: number | null
  donationsCount?: number | null
  givpowerCount?: number | null
}

export function ProjectTabs({
  activeTab,
  onTabChange,
  updatesCount = null,
  donationsCount = null,
  givpowerCount = null,
}: ProjectTabsProps) {
  const tabs = [
    { id: 'about', label: 'About', count: null },
    { id: 'updates', label: 'Updates', count: updatesCount },
    {
      id: 'donations',
      label: 'Donations',
      count: donationsCount,
      highlight: true,
    },
    { id: 'givpower', label: 'GIVpower', count: givpowerCount },
  ]

  return (
    <div className="bg-white rounded-xl border border-[#ebecf2]">
      {/* Tabs */}
      <div className="flex items-center gap-6 px-6 py-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[#1f2333]'
                : 'text-[#82899a] hover:text-[#5326ec]'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  tab.highlight && activeTab === tab.id
                    ? 'bg-[#e1458d] text-white'
                    : 'bg-[#f7f7f9] text-[#82899a]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
