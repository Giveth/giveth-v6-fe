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
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-0 py-4">
        {/* Tabs */}
        <div className="flex items-center gap-6 px-6 py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 text-sm transition-colors cursor-pointer rounded-md px-4 py-3 ${
                activeTab === tab.id
                  ? 'text-giv-primary-500 bg-giv-gray-200 font-semibold'
                  : 'text-giv-gray-800 hover:text-giv-primary-500 font-medium '
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-giv-primary-500 text-white'
                      : 'bg-giv-gray-800 text-white'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
