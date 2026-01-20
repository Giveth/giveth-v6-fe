'use client'

import { cloneElement, isValidElement } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type Route } from 'next'
import { IconPraiseHandBold } from '@/components/icons/IconPraiseHandBold'

interface DashboardTabsProps {
  activeTab: string
  onTabChange?: (tab: string) => void
}

export const UserDashboardTabs = ({
  activeTab,
  onTabChange,
}: DashboardTabsProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tabs = [
    {
      id: 'donations',
      label: 'Donations',
      icon: <IconPraiseHandBold width={24} height={24} />,
      href: null,
    },
  ]

  const handleTabClick = (tabId: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', tabId)
    router.push(`${pathname}?${next.toString()}` as never, { scroll: false })
    onTabChange?.(tabId)
  }

  // Need this to match tab active color
  const renderTabIcon = (icon: unknown) => {
    if (!icon) return null
    if (!isValidElement(icon)) return icon as never

    const existingClassName = (icon.props as { className?: string }).className
    return cloneElement(icon as never, {
      // Our custom SVG icons use `fill` prop for their path color.
      // Setting to `currentColor` makes them inherit the button text color.
      fill: 'currentColor',
      className: ['shrink-0', existingClassName].filter(Boolean).join(' '),
      'aria-hidden': true,
      focusable: false,
    })
  }

  return (
    <div className="mt-8 [font-family:var(--font-inter)]">
      {/* Tabs */}
      <div className="relative flex flex-wrap items-end gap-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() =>
              tab.href
                ? router.push(tab.href as unknown as Route, { scroll: false })
                : handleTabClick(tab.id)
            }
            style={
              activeTab === tab.id
                ? {
                    clipPath:
                      index === 0 ? firstTabClipPath : middleTabClipPath,
                  }
                : undefined
            }
            className={`relative flex items-center gap-2 cursor-pointer ${activeTab && index === 0 ? 'px-6 pr-8' : 'px-6'} py-4 text-lg font-semibold transition-colors ${
              activeTab === tab.id
                ? 'z-10 bg-white text-giv-gray-900'
                : 'text-giv-gray-800'
            }`}
          >
            {tab.label}
            {renderTabIcon(tab.icon)}
          </button>
        ))}
      </div>
    </div>
  )
}

const firstTabClipPath = `shape(
  from bottom left,
  vline to 10px,
  curve to 10px 0 with 1px 0,
  hline to calc(100% - 20px),
  curve to calc(100% - 10px) 10px with calc(100% - 10px) 0,
  vline to calc(100% - 10px),
  curve to 100% 100% with calc(100% - 10px) 100%
)`

const middleTabClipPath = `shape(
  from bottom left,
  curve to 10px calc(100% - 10px) with 10px 100%,
  vline to 10px,
  curve to 20px 0 with 10px 0,
  hline to calc(100% - 20px),
  curve to calc(100% - 10px) 10px with calc(100% - 10px) 0,
  vline to calc(100% - 10px),
  curve to 100% 100% with calc(100% - 10px) 100%
)`
