'use client'

import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Check, SlidersHorizontal } from 'lucide-react'
import { NETWROKS_FILTERS } from '@/lib/constants/round-constants'

// Define the filter state interface
export interface QFFiltersState {
  isGivbacksEligible: boolean
  eligibleForMatching: boolean // vouched
  networks: string[]
}

interface QFProjectFiltersProps {
  currentFilters: QFFiltersState
  onFilterChange: (filters: QFFiltersState) => void
}

export function QFProjectFilters({
  currentFilters,
  onFilterChange,
}: QFProjectFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCheckboxChange = (
    key: keyof QFFiltersState,
    value: boolean | string,
  ) => {
    if (key === 'networks') {
      const net = value as string
      const newNetworks = currentFilters.networks.includes(net)
        ? currentFilters.networks.filter(n => n !== net)
        : [...currentFilters.networks, net]
      onFilterChange({ ...currentFilters, networks: newNetworks })
    } else {
      onFilterChange({ ...currentFilters, [key]: value })
    }
  }

  const activeCount =
    (currentFilters.isGivbacksEligible ? 1 : 0) +
    (currentFilters.eligibleForMatching ? 1 : 0) +
    currentFilters.networks.length

  return (
    <div className="relative w-full sm:w-auto" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full sm:w-auto min-w-[200px]',
          'flex items-center justify-between sm:justify-start gap-2 px-4 py-2',
          'rounded-sm text-base font-medium bg-white transition-colors cursor-pointer',
        )}
      >
        <div className="flex items-center gap-2">
          Filters
          {activeCount > 0 && (
            <span className="bg-giv-brand-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[18px] text-center">
              {activeCount}
            </span>
          )}
        </div>
        <SlidersHorizontal className="w-4 h-4 ml-8" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[320px] bg-white rounded-md z-30 p-6">
          {/* Project features */}
          <div className="mb-3">
            <h4 className="text-giv-neutral-900 font-medium text-sm mb-5">
              Project features
            </h4>
            <div className="space-y-3 border-b border-giv-neutral-200 pb-5">
              <label className="flex items-center gap-3 cursor-pointer group mb-5">
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentFilters.isGivbacksEligible ? 'bg-giv-brand-50 border-giv-brand-500' : 'border-giv-neutral-400 bg-white group-hover:border-giv-brand-500'}`}
                >
                  {currentFilters.isGivbacksEligible && (
                    <Check className="w-3.5 h-3.5 text-giv-brand-500" />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={currentFilters.isGivbacksEligible}
                  onChange={e =>
                    handleCheckboxChange('isGivbacksEligible', e.target.checked)
                  }
                />
                <span className="text-giv-neutral-800 text-sm font-medium">
                  GIVbacks Eligible
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentFilters.eligibleForMatching ? 'bg-giv-brand-50 border-giv-brand-500' : 'border-giv-neutral-400 bg-white group-hover:border-giv-brand-500'}`}
                >
                  {currentFilters.eligibleForMatching && (
                    <Check className="w-3.5 h-3.5 text-giv-brand-500" />
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={currentFilters.eligibleForMatching}
                  onChange={e =>
                    handleCheckboxChange(
                      'eligibleForMatching',
                      e.target.checked,
                    )
                  }
                />
                <span className="text-giv-neutral-800 text-sm font-medium">
                  Eligible for Matching
                </span>
              </label>
            </div>
          </div>

          {/* Accepts funds on */}
          <div>
            <h4 className="text-giv-neutral-900 font-medium text-sm mb-5">
              Accepts funds on
            </h4>
            <div className="space-y-3 overflow-y-auto custom-scrollbar">
              {NETWROKS_FILTERS.map(network => (
                <label
                  key={network}
                  className="flex items-center gap-3 cursor-pointer group mb-5 last:mb-0"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentFilters.networks.includes(network) ? 'bg-giv-brand-50 border-giv-brand-500' : 'border-giv-neutral-400 bg-white group-hover:border-giv-brand-500'}`}
                  >
                    {currentFilters.networks.includes(network) && (
                      <Check className="w-3.5 h-3.5 text-giv-brand-500" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={currentFilters.networks.includes(network)}
                    onChange={() => handleCheckboxChange('networks', network)}
                  />
                  <span className="text-giv-neutral-800 text-sm font-medium">
                    {network}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
