'use client'

import { AmountInput } from '@/components/cart/AmountInput'
import { ChainDropdown } from '@/components/cart/ChainDropdown'
import { ProjectCartCard } from '@/components/cart/ProjectCartCard'
import { TokenDropdown } from '@/components/cart/TokenDropdown'

interface ProjectBadge {
  type: 'givbacks' | 'matching'
  color: 'green' | 'gray'
  amountPrefix?: string
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
      <div className="py-6 flex items-center justify-between">
        <ChainDropdown chainId={chainId} />

        {/* Right Side - Token, Amount, Apply */}
        <div className="flex items-center gap-3">
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
      <div className="px-5 py-4 flex items-center justify-between bg-[#fafafa]">
        <span className="text-sm text-[#82899a]">
          {projects.length} projects
        </span>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            Total match
            <span className="w-5 h-5 rounded-full bg-[#e7e1ff] flex items-center justify-center">
              <svg
                viewBox="0 0 16 16"
                className="w-3 h-3 text-[#5326ec]"
                fill="currentColor"
              >
                <path d="M8 2L10 6L14 7L11 10L12 14L8 12L4 14L5 10L2 7L6 6L8 2Z" />
              </svg>
            </span>
            <span className="text-[#37b4a9] font-medium">$ {totalMatch}</span>
          </span>
          <span className="text-[#82899a]">|</span>
          <span>
            Total donation{' '}
            <span className="font-semibold text-[#1f2333]">
              $ {totalDonation}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
