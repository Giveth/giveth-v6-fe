'use client'

import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { ArrowDown, ArrowUp, ChevronDown, Sparkles } from 'lucide-react'
import { IconAmountRaisedAllTime } from '@/components/icons/IconAmountRaisedAllTime'
import { IconAmountRaisedQF } from '@/components/icons/IconAmountRaisedQF'
import { IconGIVPower } from '@/components/icons/IconGIVPower'
import { IconRecentlyUpdated } from '@/components/icons/IconRecentlyUpdated'
import { ProjectSortField } from '@/lib/graphql/generated/graphql'

export interface SortOption {
  label: string
  field: ProjectSortField
  direction: 'ASC' | 'DESC'
  icon: React.ReactNode
}

const SORT_OPTIONS: SortOption[] = [
  {
    label: 'Best match',
    field: ProjectSortField.Relevance,
    direction: 'DESC',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    label: 'Highest GIVpower',
    field: ProjectSortField.TotalPower,
    direction: 'DESC',
    icon: <IconGIVPower className="w-4 h-4" />,
  },
  {
    label: 'Newest first',
    field: ProjectSortField.CreatedAt,
    direction: 'DESC',
    icon: <ArrowUp className="w-4 h-4" />,
  },
  {
    label: 'Oldest first',
    field: ProjectSortField.CreatedAt,
    direction: 'ASC',
    icon: <ArrowDown className="w-4 h-4" />,
  },
  {
    label: 'Amount raised all time',
    field: ProjectSortField.TotalDonations,
    direction: 'DESC',
    icon: <IconAmountRaisedAllTime className="w-4 h-4" />,
  },
  {
    label: 'Amount raised in QF',
    field: ProjectSortField.QfDonations,
    direction: 'DESC',
    icon: <IconAmountRaisedQF className="w-4 h-4" />,
  },
  {
    label: 'Recently updated',
    field: ProjectSortField.UpdatedAt,
    direction: 'DESC',
    icon: <IconRecentlyUpdated className="w-4 h-4" />,
  },
]

interface QFSortingProps {
  currentField: ProjectSortField
  currentDirection: 'ASC' | 'DESC'
  onSortChange: (field: ProjectSortField, direction: 'ASC' | 'DESC') => void
  isSearchActive?: boolean
}

export function QFSorting({
  currentField,
  currentDirection,
  onSortChange,
  isSearchActive = false,
}: QFSortingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const visibleOptions = isSearchActive
    ? SORT_OPTIONS
    : SORT_OPTIONS.filter(opt => opt.field !== ProjectSortField.Relevance)

  const selectedOption =
    visibleOptions.find(
      opt => opt.field === currentField && opt.direction === currentDirection,
    ) || visibleOptions[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-4 py-2 bg-white',
          'rounded-sm text-base font-medium text-giv-neutral-900 min-w-[200px]',
          'justify-between transition-colors cursor-pointer',
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-giv-brand-900">{selectedOption.icon}</span>
          <span>{selectedOption.label}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 ml-6 text-giv-neutral-900 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-white rounded-md shadow-xl z-30 py-2">
          {visibleOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSortChange(option.field, option.direction)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm hover:bg-giv-neutral-200 transition-colors cursor-pointer ${
                option.label === selectedOption.label
                  ? 'bg-giv-brand-050 text-giv-brand-500 font-semibold'
                  : 'text-giv-neutral-900'
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
