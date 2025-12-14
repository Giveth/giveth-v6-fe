'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, SlidersHorizontal } from 'lucide-react'

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

const NETWORKS = [
  'Mainnet',
  'Gnosis',
  'Polygon',
  'Celo',
  'Optimism',
  'Ethereum Classic',
  'Arbitrum',
  'Base',
]

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
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${
          activeCount > 0
            ? 'bg-[#f0effb] border-[#5326ec] text-[#5326ec]'
            : 'bg-white border-[#ebecf2] text-[#1f2333] hover:border-[#5326ec]'
        }`}
      >
        Filters
        <SlidersHorizontal className="w-4 h-4" />
        {activeCount > 0 && (
          <span className="bg-[#5326ec] text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[320px] bg-white border border-[#ebecf2] rounded-xl shadow-xl z-30 p-6">
          {/* Project features */}
          <div className="mb-6">
            <h4 className="text-[#1f2333] font-bold text-sm mb-3">
              Project features
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentFilters.isGivbacksEligible ? 'bg-[#5326ec] border-[#5326ec]' : 'border-[#cfd0d6] bg-white group-hover:border-[#5326ec]'}`}
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
                <span className="text-[#525c76] text-sm">
                  GIVbacks Eligible
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentFilters.eligibleForMatching ? 'bg-[#5326ec] border-[#5326ec]' : 'border-[#cfd0d6] bg-white group-hover:border-[#5326ec]'}`}
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
                <span className="text-[#525c76] text-sm">
                  Eligible for Matching
                </span>
              </label>
            </div>
          </div>

          {/* Accepts funds on */}
          <div>
            <h4 className="text-[#1f2333] font-bold text-sm mb-3">
              Accepts funds on
            </h4>
            <div className="space-y-3 max-h-[240px] overflow-y-auto custom-scrollbar">
              {NETWORKS.map(network => (
                <label
                  key={network}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentFilters.networks.includes(network) ? 'bg-[#5326ec] border-[#5326ec]' : 'border-[#cfd0d6] bg-white group-hover:border-[#5326ec]'}`}
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
                  <span className="text-[#525c76] text-sm">{network}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
