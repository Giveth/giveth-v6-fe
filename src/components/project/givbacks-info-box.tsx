'use client'

import { ChevronRight } from 'lucide-react'

export function GivbacksInfoBox() {
  return (
    <div className="bg-white rounded-xl border border-[#ebecf2] p-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#f7f7f9] flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4 h-4 text-[#82899a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm text-[#4f576a]">
            Donations of $5 or more are eligible for GIVbacks. Boost this
            project to increase its rewards percentage and visibility on the
            projects page!
          </p>
          <button className="flex items-center gap-1 text-sm text-[#5326ec] hover:underline mt-1">
            Learn more
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
