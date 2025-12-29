'use client'

import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { DonationRound } from '@/components/cart/DonationRound'
import { DonationSidebar } from '@/components/cart/DonationSidebar'
import { useCart } from '@/context/CartContext'
import { useActiveQfRounds } from '@/hooks/useActiveQfRounds'
import { groupCartItemsByRound } from '@/lib/helpers/cart'

export default function CartPage() {
  const { data: activeRoundsData, isLoading, error } = useActiveQfRounds()
  const { cartItems } = useCart()

  // Group cart items by round
  const { qfRoundGroups } = useMemo(
    () => groupCartItemsByRound(cartItems),
    [cartItems],
  )

  console.log({ activeRoundsData })
  console.log({ cartItems })
  console.log({ qfRoundGroups })

  return (
    <div className="min-h-screen bg-[#f7f7f9]">
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
              qfRoundGroups.map((group, groupIndex) => {
                const roundId = group.roundId
                const round =
                  roundId != null
                    ? activeRoundsData?.activeQfRounds?.find(
                        r => r.id === String(roundId),
                      )
                    : undefined

                console.log(round, round)

                if (!round) return null

                const token =
                  group.projects[0]?.tokenSymbol ??
                  round.allocatedTokenSymbol ??
                  ''

                const totalAmountNum = group.projects.reduce((sum, p) => {
                  const a = Number.parseFloat(p.donationAmount ?? '0')
                  return sum + (Number.isFinite(a) ? a : 0)
                }, 0)
                const totalAmount = String(totalAmountNum)

                const projectsForUi = group.projects.map((p, projectIndex) => ({
                  id:
                    Number.parseInt(p.id, 10) ||
                    groupIndex * 1000 + projectIndex,
                  name: p.title,
                  image: p.image || '/placeholder.svg',
                  badges: [],
                  tokenAmount: p.donationAmount || '0',
                  token,
                  usdValue: p.donationAmount || '0',
                }))

                return (
                  <DonationRound
                    key={round.id}
                    roundData={round}
                    cartRoundData={group}
                    token={token}
                    defaultAmount={totalAmount}
                    defaultUsdValue={totalAmount}
                    projects={projectsForUi}
                    totalMatch={totalAmount}
                    totalDonation={totalAmount}
                  />
                )
              })}
            {cartItems.length === 0 && (
              <div className="text-center py-12 text-giv-gray-700">
                Your cart is empty. Add projects to your cart to get started.
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <DonationSidebar />
        </div>
      </main>
    </div>
  )
}
