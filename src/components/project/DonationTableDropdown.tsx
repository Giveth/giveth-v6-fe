'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import clsx from 'clsx'
import { Check, ChevronDown } from 'lucide-react'

interface QfRound {
  id: string
  name: string
  isActive: boolean
  beginDate?: string | null
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
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="w-auto flex items-center justify-between px-4 py-3 border border-giv-neutral-400 rounded-xl mb-4 hover:border-giv-brand-500 transition-colors cursor-pointer">
          <span className="text-base font-medium text-giv-neutral-900">
            {selectedFilter.type === 'all' && 'Showing all donations'}
            {selectedFilter.type === 'recurring' && 'Recurring Donations'}
            {selectedFilter.type === 'round' && selectedFilter.name}
          </span>
          <ChevronDown className="w-4 h-4 text-giv-neutral-900 ml-12" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="start"
          className="z-50 w-64 bg-white rounded-xl shadow-xl border border-giv-neutral-300 overflow-hidden py-2 max-h-[400px] overflow-y-auto"
        >
          {/* All Donations */}
          <DropdownMenu.Item
            onSelect={() => onSelect({ type: 'all' })}
            className="w-full text-left px-4 py-2.5 hover:bg-giv-neutral-200 text-sm font-medium text-giv-neutral-900 flex items-center justify-between outline-none cursor-pointer"
          >
            All Donations
            {selectedFilter.type === 'all' && (
              <Check className="w-4 h-4 text-giv-brand-500" />
            )}
          </DropdownMenu.Item>

          {/* Recurring Donations */}
          <DropdownMenu.Item
            onSelect={() => onSelect({ type: 'recurring' })}
            className="w-full text-left px-4 py-2.5 hover:bg-giv-neutral-200 text-sm text-giv-neutral-900 flex items-center justify-between outline-none cursor-pointer"
          >
            Recurring Donations
            {selectedFilter.type === 'recurring' && (
              <Check className="w-4 h-4 text-giv-brand-500" />
            )}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-2 h-px bg-giv-neutral-300" />

          {/* QF Rounds */}
          {qfRounds.map(round => (
            <DropdownMenu.Item
              key={round.id}
              onSelect={() =>
                onSelect({ type: 'round', id: round.id, name: round.name })
              }
              className={clsx(
                'w-full text-left px-4 py-2.5 hover:bg-giv-neutral-200',
                'text-sm text-giv-neutral-900',
                'flex items-center justify-between outline-none cursor-pointer',
              )}
            >
              <div className="flex items-center gap-2">
                <span className="truncate max-w-[140px]">{round.name}</span>
                {round.isActive &&
                  round.beginDate &&
                  new Date(round.beginDate) <= new Date() && (
                    <span className="bg-giv-success-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Open
                    </span>
                  )}
              </div>
              {selectedFilter.type === 'round' &&
                selectedFilter.id === round.id && (
                  <Check className="w-4 h-4 text-giv-brand-500" />
                )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
