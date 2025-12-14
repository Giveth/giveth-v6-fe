'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

interface QfRound {
  id: string
  name: string
  isActive: boolean
}

export type FilterType =
  | { type: 'all' }
  | { type: 'recurring' }
  | { type: 'round'; id: string; name: string }

interface DonationTableDropdownProps {
  qfRounds: QfRound[]
  selectedFilter: FilterType
  onSelect: (filter: FilterType) => void
}

export function DonationTableDropdown({
  qfRounds,
  selectedFilter,
  onSelect,
}: DonationTableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-[#ebecf2] rounded-lg hover:border-[#5326ec] transition-colors bg-white"
      >
        <span className="text-sm font-medium text-[#1f2333]">
          {selectedFilter.type === 'all' && 'Showing all donations'}
          {selectedFilter.type === 'recurring' && 'Recurring Donations'}
          {selectedFilter.type === 'round' && selectedFilter.name}
        </span>
        <ChevronDown className="w-4 h-4 text-[#82899a]" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#ebecf2] z-50 overflow-hidden py-2 max-h-[400px] overflow-y-auto">
          {/* All Donations */}
          <button
            onClick={() => {
              onSelect({ type: 'all' })
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-[#f7f7f9] text-sm font-medium text-[#1f2333] flex items-center justify-between"
          >
            All Donations
            {selectedFilter.type === 'all' && (
              <Check className="w-4 h-4 text-[#5326ec]" />
            )}
          </button>

          {/* Recurring Donations */}
          <button
            onClick={() => {
              onSelect({ type: 'recurring' })
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-2.5 hover:bg-[#f7f7f9] text-sm text-[#1f2333] flex items-center justify-between"
          >
            Recurring Donations
            {selectedFilter.type === 'recurring' && (
              <Check className="w-4 h-4 text-[#5326ec]" />
            )}
          </button>

          <div className="my-2 border-t border-[#ebecf2]" />

          {/* QF Rounds */}
          {qfRounds.map(round => (
            <button
              key={round.id}
              onClick={() => {
                onSelect({ type: 'round', id: round.id, name: round.name })
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-[#f7f7f9] text-sm text-[#1f2333] flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="truncate max-w-[140px]">{round.name}</span>
                {round.isActive && (
                  <span className="bg-[#6dbfb8] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Open
                  </span>
                )}
              </div>
              {selectedFilter.type === 'round' &&
                selectedFilter.id === round.id && (
                  <Check className="w-4 h-4 text-[#5326ec]" />
                )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
