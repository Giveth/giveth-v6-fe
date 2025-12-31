'use client'

import * as Switch from '@radix-ui/react-switch'
import { useCart } from '@/context/CartContext'
import { HelpTooltip } from '../HelpTooltip'

export function DonateToGiveth() {
  const { givethPercentage, setGivethPercentage } = useCart()

  const handleToggleGiveth = () => {
    setGivethPercentage(givethPercentage === 0 ? 5 : 0)
  }

  const handleSetGivethPercentage = (percentage: number) => {
    if (percentage >= 100) {
      setGivethPercentage(99)
    } else {
      setGivethPercentage(percentage)
    }
  }

  return (
    <div className="p-3 rounded-lg border border-giv-gray-300 mt-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Switch.Root
          className="
            relative h-5 w-8 shrink-0 cursor-pointer rounded-full
            bg-[#e6e8f0] transition-colors
            data-[state=checked]:bg-[#5326ec]
          "
          checked={givethPercentage > 0}
          onCheckedChange={handleToggleGiveth}
        >
          <Switch.Thumb
            className="
              block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow
              transition-transform
              data-[state=checked]:translate-x-[13px]
            "
          />
        </Switch.Root>

        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-giv-gray-900">
            Donate to Giveth
          </span>
          <HelpTooltip text="This donation supports Giveth platform sustainability." />
        </div>
      </div>

      {/* Percentage buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {['5%', '10%', '15%', '20%'].map(value => (
          <button
            key={value}
            onClick={() =>
              handleSetGivethPercentage(Number(value.replace('%', '')))
            }
            className="
              rounded-full px-3 py-2 text-xs font-medium
              bg-giv-primary-50 text-giv-primary-500
              hover:bg-giv-primary-100
              transition-colors cursor-pointer
            "
          >
            {value}
          </button>
        ))}

        {/* Custom / 0% */}
        <div
          className="flex items-center gap-1 rounded-full px-2 py-2 text-sm font-medium ml-auto
              border border-giv-gray-300 
              hover:bg-giv-gray-200"
        >
          <input
            type="text"
            className="
              w-8
              text-xs
              text-giv-gray-900
              focus:outline-none transition-colors
              text-center
              "
            value={givethPercentage.toString().replace('%', '')}
            onChange={e => handleSetGivethPercentage(Number(e.target.value))}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSetGivethPercentage(Number(e.currentTarget.value))
              }
            }}
          />
          <span className="text-xs text-giv-gray-900">%</span>
        </div>
      </div>
    </div>
  )
}
