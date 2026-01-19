'use client'

import { useEffect, useRef, useState } from 'react'
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
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-colors cursor-pointer ${
          activeCount > 0
            ? 'bg-giv-primary-050 border-giv-primary-500 text-giv-primary-500'
            : 'bg-white border-giv-gray-300 text-giv-gray-900 hover:border-giv-primary-500'
        }`}
      >
        Filters
        <SlidersHorizontal className="w-4 h-4" />
        {activeCount > 0 && (
          <span className="bg-giv-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[320px] bg-white border border-giv-gray-300 rounded-xl shadow-xl z-30 p-6">
          {/* Project features */}
          <div className="mb-6">
            <h4 className="text-giv-gray-900 font-bold text-sm mb-3">
              Project features
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentFilters.isGivbacksEligible ? 'bg-giv-primary-500 border-giv-primary-500' : 'border-giv-gray-300 bg-white group-hover:border-giv-primary-500'}`}
                >
                  {currentFilters.isGivbacksEligible && (
                    <Check className="w-3.5 h-3.5 text-white" />
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
                <span className="text-giv-gray-700 text-sm">
                  GIVbacks Eligible
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentFilters.eligibleForMatching ? 'bg-giv-primary-500 border-giv-primary-500' : 'border-giv-gray-300 bg-white group-hover:border-giv-primary-500'}`}
                >
                  {currentFilters.eligibleForMatching && (
                    <Check className="w-3.5 h-3.5 text-white" />
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
                <span className="text-giv-gray-700 text-sm">
                  Eligible for Matching
                </span>
              </label>
            </div>
          </div>

          {/* Accepts funds on */}
          <div>
            <h4 className="text-giv-gray-900 font-bold text-sm mb-3">
              Accepts funds on
            </h4>
            <div className="space-y-3 overflow-y-auto custom-scrollbar">
              {NETWROKS_FILTERS.map(network => (
                <label
                  key={network}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentFilters.networks.includes(network) ? 'bg-giv-primary-500 border-giv-primary-500' : 'border-giv-gray-300 bg-white group-hover:border-giv-primary-500'}`}
                  >
                    {currentFilters.networks.includes(network) && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={currentFilters.networks.includes(network)}
                    onChange={() => handleCheckboxChange('networks', network)}
                  />
                  <span className="text-giv-gray-700 text-sm">{network}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
