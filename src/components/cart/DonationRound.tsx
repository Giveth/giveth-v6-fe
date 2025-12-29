'use client'

import type React from 'react'
import { useState } from 'react'
import { ArrowLeftRight, ChevronDown, X } from 'lucide-react'
import { getChainIcon, getChainName } from '@/lib/constants'

interface ProjectBadge {
  type: 'givbacks' | 'matching' | 'info'
  label: string
}

interface Project {
  id: number
  name: string
  image: string
  badges: ProjectBadge[]
  tokenAmount: string
  token: string
  usdValue: string
}

interface DonationRoundProps {
  roundName: string
  chainId: number
  token: string
  defaultAmount: string
  defaultUsdValue: string
  projects: Project[]
  totalMatch: string
  totalDonation: string
}

export function DonationRound({
  roundName,
  chainId,
  defaultAmount,
  defaultUsdValue,
  projects,
  totalMatch,
  totalDonation,
}: DonationRoundProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border-4 border-giv-gray-500 overflow-hidden">
      {/* Round Header */}
      <div className="bg-giv-gray-300 px-5 py-3 rounded-xl">
        <span className="text-base font-medium text-giv-gray-800">
          {roundName}
        </span>
      </div>

      {/* Token Selection Row */}
      <div className="py-6 flex max-[480px]:flex-wrap items-center justify-between">
        <div className="max-[480px]:w-full max-[480px]:mb-3 md:w-auto">
          <ChainDropdown chainId={chainId} />
        </div>

        {/* Right Side - Token, Amount, Apply */}
        <div className="max-[480px]:flex-wrap max-[480px]:justify-between flex items-center gap-3 xs:w-full md:w-auto">
          <TokenDropdown chainId={chainId} />

          <AmountInput
            defaultAmount={defaultAmount}
            defaultUsdValue={defaultUsdValue}
          />

          {/* Apply to all */}
          <button className="ml-1 text-base font-medium text-giv-primary-500 hover:text-giv-primary-700 transition-colors cursor-pointer">
            Apply to all
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div>
        {projects.map(project => (
          <ProjectCartCard key={project.id} project={project} />
        ))}
      </div>

      {/* Round Footer */}
      <div className="max-[480px]:flex-wrap flex justify-between bg-giv-gray-200 px-5 py-3 rounded-xl">
        <span className="text-base font-medium text-giv-gray-700">
          {projects.length} projects
        </span>
        <div className="flex justify-between items-center md:ml-auto gap-2 text-sm">
          <span className="flex items-center gap-1.5 text-base font-medium text-giv-gray-800">
            Total match
            <MatchingEligible
              width={20}
              height={20}
              fill="var(--giv-jade-500)"
            />
            <span className="text-giv-jade-500 text-base font-medium">
              $ {totalMatch}
            </span>
          </span>
          <span className="text-giv-gray-500 text-lg font-normal">|</span>
          <span className="text-giv-gray-800 text-base font-medium">
            Total donation <span>$ {totalDonation}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
