'use client'

import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { AmountInput } from '@/components/cart/AmountInput'
import { ChainDropdown } from '@/components/cart/ChainDropdown'
import { ProjectCartCard } from '@/components/cart/ProjectCartCard'
import { TokenDropdown } from '@/components/cart/TokenDropdown'
import { MatchingEligible } from '@/components/icons/MatchingEligible'
import type { ProjectCartItem } from '@/context/CartContext'
import { type ActiveQfRoundsQuery } from '@/lib/graphql/generated/graphql'
import {
  calculateRoundTotalMatchingValue,
  calculateTotalDonationValueForRoundInUSD,
  formatNumber,
} from '@/lib/helpers/cartHelper'
import type { GroupedProjects } from '@/lib/types/cart'
import { type WalletTokenWithBalance } from '@/lib/types/chain'

interface DonationRoundProps {
  roundData: ActiveQfRoundsQuery['activeQfRounds'][0]
  cartRoundData: GroupedProjects
  projects: ProjectCartItem[]
  showMissingAmountErrors: boolean
}

export function DonationRound({
  roundData,
  cartRoundData,
  projects,
  showMissingAmountErrors,
}: DonationRoundProps) {
  const [roundSelectedToken, setRoundSelectedToken] = useState<
    WalletTokenWithBalance | undefined
  >(undefined)
  const hasMissingAmount = projects.some(
    project => Number(project.donationAmount) <= 0,
  )
  const shouldShowMissingAmount = showMissingAmountErrors && hasMissingAmount

  // Value to show in the amount input (0 for amount, 1 for dollars)
  // If user clicks on the arrow button, the value will be toggled between entering amount or the selected token's price in USD
  const [selectedAmountVsDollars, setSelectedAmountVsDollars] =
    useState<number>(0)

  return (
    <div className="bg-white p-4 rounded-2xl border-4 border-giv-gray-500 overflow-hidden">
      {/* Round Header */}
      <div className="flex justify-between items-center bg-giv-gray-300 px-5 py-3 rounded-xl text-base font-medium">
        <div className=" text-giv-gray-800">{roundData.name}</div>
        {shouldShowMissingAmount && (
          <div className="text-giv-error-400 mt-1 inline-flex items-center gap-2">
            <TriangleAlert className="w-4 h-4" />
            Please enter the amount for the missing field
          </div>
        )}
      </div>

      {/* Token Selection Row */}
      <div className="py-6 flex max-[480px]:flex-wrap items-center justify-between">
        <div className="max-[480px]:w-full max-[480px]:mb-3 md:w-auto">
          <ChainDropdown
            roundId={cartRoundData.roundId}
            selectedChainId={cartRoundData.selectedChainId}
            eligibleNetworks={roundData.eligibleNetworks}
          />
        </div>

        {/* Right Side - Token, Amount, Apply */}
        <div className="flex-wrap max-[480px]:justify-between flex items-center gap-3 xs:w-full md:w-auto md:ml-auto">
          <TokenDropdown
            selectedChainId={cartRoundData.selectedChainId}
            setRoundSelectedToken={setRoundSelectedToken}
            roundId={Number(roundData.id) ?? 0}
          />

          <AmountInput
            roundId={cartRoundData.roundId}
            selectedToken={roundSelectedToken}
            cartItems={cartRoundData.projects}
            setSelectedAmountVsDollars={setSelectedAmountVsDollars}
          />
        </div>
      </div>

      {/* Projects List */}
      <div>
        {projects.map(project => (
          <ProjectCartCard
            key={project.id}
            roundData={roundData}
            project={project}
            selectedAmountVsDollars={selectedAmountVsDollars}
            showMissingAmountErrors={showMissingAmountErrors}
          />
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
              $
              {formatNumber(
                calculateRoundTotalMatchingValue(
                  cartRoundData.roundId,
                  cartRoundData.projects,
                ),
              )}
            </span>
          </span>
          <span className="text-giv-gray-500 text-lg font-normal">|</span>
          <span className="text-giv-gray-800 text-base font-medium">
            Total donation{' '}
            <span>
              ${' '}
              {formatNumber(
                calculateTotalDonationValueForRoundInUSD(
                  cartRoundData.roundId,
                  cartRoundData.projects,
                ),
              )}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}
