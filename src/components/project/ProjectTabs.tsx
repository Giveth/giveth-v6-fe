
interface ProjectTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function ProjectTabs({ activeTab, onTabChange }: ProjectTabsProps) {
    const tabs = [
        { id: 'about', label: 'About' },
        { id: 'updates', label: 'Updates', count: 5 },
        { id: 'donations', label: 'Donations', count: 4092 },
    ];

    return (
        <div className="flex gap-8 border-b border-gray-100 pb-4">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === tab.id
                            ? 'border-b-2 border-[#fd67ac] pb-4 -mb-4.5 text-[#fd67ac] font-bold'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span
                            className={`flex h-5 w-auto min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${activeTab === tab.id
                                    ? 'bg-[#fd67ac] text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
