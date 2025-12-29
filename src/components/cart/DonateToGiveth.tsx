'use client'

import * as Switch from '@radix-ui/react-switch'
import { HelpTooltip } from '../HelpTooltip'

export function DonateToGiveth() {
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
        <input
          type="text"
          className="
            w-16
            rounded-full px-2 py-2 text-sm font-medium ml-auto
            border border-giv-gray-300 text-giv-gray-900
            hover:bg-giv-gray-200
            focus:outline-none transition-colors
            text-center
            "
          defaultValue="0 %"
        />
      </div>
    </div>
  )
}
