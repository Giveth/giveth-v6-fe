'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  DollarSign,
  HandHeart, // using HandHeart as proxy for hand icon
  RefreshCw,
  Rocket,
  TrendingUp,
} from 'lucide-react'
import { ProjectSortField } from '@/lib/graphql/generated/graphql'

export interface SortOption {
  label: string
  field: ProjectSortField
  direction: 'ASC' | 'DESC'
  icon: React.ReactNode
}

const SORT_OPTIONS: SortOption[] = [
  {
    label: 'Highest GIVpower',
    field: ProjectSortField.QualityScore,
    direction: 'DESC',
    icon: <Rocket className="w-4 h-4" />,
  },
  {
    label: 'Highest GIVbacks %',
    field: ProjectSortField.Relevance, // Mapping to Relevance as proxy or placeholder
    direction: 'DESC',
    icon: <HandHeart className="w-4 h-4" />,
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
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    label: 'Amount raised in QF',
    field: ProjectSortField.TotalDonations, // Placeholder, requires backend support
    direction: 'DESC',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    label: 'Recently updated',
    field: ProjectSortField.UpdatedAt,
    direction: 'DESC',
    icon: <RefreshCw className="w-4 h-4" />,
  },
]

interface QFSortingProps {
  currentField: ProjectSortField
  currentDirection: 'ASC' | 'DESC'
  onSortChange: (field: ProjectSortField, direction: 'ASC' | 'DESC') => void
}

export function QFSorting({
  currentField,
  currentDirection,
  onSortChange,
}: QFSortingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selectedOption =
    SORT_OPTIONS.find(
      opt => opt.field === currentField && opt.direction === currentDirection,
    ) || SORT_OPTIONS[0]

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
        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#ebecf2] rounded-lg text-sm font-bold text-[#1f2333] hover:border-[#5326ec] min-w-[200px] justify-between transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#5326ec]">{selectedOption.icon}</span>
          <span>{selectedOption.label}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#82899a] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-white border border-[#ebecf2] rounded-xl shadow-xl z-30 py-2">
          {SORT_OPTIONS.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSortChange(option.field, option.direction)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#f7f7f9] transition-colors ${
                option.label === selectedOption.label
                  ? 'bg-[#f0effb] text-[#5326ec] font-semibold'
                  : 'text-[#1f2333]'
              }`}
            >
              <span
                className={
                  option.label === selectedOption.label
                    ? 'text-[#5326ec]'
                    : 'text-[#82899a]'
                }
              >
                {option.icon}
              </span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
