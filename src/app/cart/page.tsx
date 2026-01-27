'use client'

import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { DonationRound } from '@/components/cart/DonationRound'
import { DonationSidebar } from '@/components/cart/DonationSidebar'
import { useCart } from '@/context/CartContext'
import { useActiveQfRounds } from '@/hooks/useActiveQfRounds'
import { DisplaySize } from '@/lib/graphql/generated/graphql'
import { groupCartItemsByRound } from '@/lib/helpers/cartHelper'

export default function CartPage() {
  const { data: activeRoundsData, isLoading, error } = useActiveQfRounds()
  const { cartItems, givethPercentage } = useCart()

  // Group cart items by round
  const { qfRoundGroups, nonQfProjects } = useMemo(
    () => groupCartItemsByRound(cartItems),
    [cartItems],
  )

  return (
    <div className="min-h-screen bg-giv-gray-200">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-giv-primary-500" />
        </div>
      )}
      {error && (
        <div className="text-center py-12 text-giv-gray-700">
          Failed to load active rounds. Please try again later. {error.message}
        </div>
      )}
      <main className="max-w-7xl mx-auto py-8">
        <div className="flex flex-wrap gap-6">
          {/* Left Column - Donation Rounds */}
          <div className="flex-1 space-y-5 w-12/12 lg:w-8/12">
            {cartItems.length > 0 &&
              qfRoundGroups.map(group => {
                const roundId = group.roundId
                const round =
                  roundId != null
                    ? activeRoundsData?.activeQfRounds?.find(
                        r => r.id === String(roundId),
                      )
                    : undefined

                if (!round) return null

                return (
                  <DonationRound
                    key={round.id}
                    roundData={round}
                    cartRoundData={group}
                    projects={group.projects}
                  />
                )
              })}
            {nonQfProjects.length > 0 && (
              <DonationRound
                key="0"
                roundData={{
                  id: '0',
                  name: 'Non-QF',
                  isActive: true,
                  slug: '',
                  beginDate: new Date(),
                  endDate: new Date(),
                  eligibleNetworks: [],
                  displaySize: DisplaySize.Standard,
                  description: '',
                  allocatedFund: 0,
                  minimumValidUsdValue: 0,
                  maximumReward: 0,
                }}
                cartRoundData={{
                  roundId: 0,
                  roundName: 'Non-QF',
                  selectedChainId: 0,
                  selectedToken: undefined,
                  tokenSymbol: '',
                  tokenDecimals: 18,
                  tokenAddress: '',
                  projects: [],
                  totalAmount: '0',
                  totalUsdValue: '0',
                }}
                projects={nonQfProjects}
              />
            )}
            {cartItems.length === 0 && (
              <div className="text-center py-12 text-giv-gray-700">
                Your cart is empty. Add projects to your cart to get started.
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <DonationSidebar
            qfRoundGroups={qfRoundGroups}
            nonQfProjects={nonQfProjects}
            givethPercentage={givethPercentage}
          />
        </div>
      </main>
    </div>
  )
}
