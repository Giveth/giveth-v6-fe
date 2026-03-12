'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, Loader2 } from 'lucide-react'
import { DonationRound } from '@/components/cart/DonationRound'
import { DonationSidebar } from '@/components/cart/DonationSidebar'
import { useSiweAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useActiveQfRounds } from '@/hooks/useActiveQfRounds'
import { DisplaySize } from '@/lib/graphql/generated/graphql'
import { groupCartItemsByRound } from '@/lib/helpers/cartHelper'
import { normalizeDecimalInput } from '@/lib/helpers/numbersHelper'
import { OPTIMISM_CHAIN_ID, OPTIMISM_USDC_ADDRESS } from '@/lib/thirdweb/client'
import { type WalletTokenWithBalance } from '@/lib/types/chain'

export default function CartPage() {
  const { data: activeRoundsData, isLoading, error } = useActiveQfRounds()
  const {
    cartItems,
    givethPercentage,
    showMissingAmountErrors,
    removeFromCart,
    updateProjectDonation,
    updateSelectedChainId,
    updateSelectedToken,
  } = useCart()
  const { isAAWallet } = useSiweAuth()
  const [aaAmountToDonate, setAaAmountToDonate] = useState('10')

  // Group cart items by round
  const { qfRoundGroups, nonQfProjects } = useMemo(
    () => groupCartItemsByRound(cartItems),
    [cartItems],
  )

  const aaUsdcToken = useMemo<WalletTokenWithBalance>(
    () => ({
      address: OPTIMISM_USDC_ADDRESS as `0x${string}`,
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin',
      chainId: OPTIMISM_CHAIN_ID,
      priceInUSD: 1,
      balance: '0',
      formattedBalance: '0',
      coingeckoId: 'usd-coin',
    }),
    [],
  )

  useEffect(() => {
    if (!isAAWallet || cartItems.length === 0) return

    qfRoundGroups.forEach(group => {
      if (group.selectedChainId !== OPTIMISM_CHAIN_ID) {
        updateSelectedChainId(group.roundId, OPTIMISM_CHAIN_ID)
      }

      const isOptimismUsdcSelected =
        group.tokenSymbol === aaUsdcToken.symbol &&
        group.tokenAddress?.toLowerCase() ===
          aaUsdcToken.address?.toLowerCase() &&
        group.selectedToken?.chainId === OPTIMISM_CHAIN_ID &&
        Number(group.selectedToken?.priceInUSD ?? 0) === 1

      if (!isOptimismUsdcSelected) {
        updateSelectedToken(
          group.roundId,
          aaUsdcToken,
          aaUsdcToken.symbol,
          aaUsdcToken.address as `0x${string}`,
          aaUsdcToken.decimals,
          group.selectedToken?.isGivbackEligible,
        )
      }
    })

    if (nonQfProjects.length === 0) return

    const hasNonQfChainMismatch = nonQfProjects.some(
      project => project.chainId !== OPTIMISM_CHAIN_ID,
    )
    if (hasNonQfChainMismatch) {
      updateSelectedChainId(0, OPTIMISM_CHAIN_ID)
    }

    const hasNonQfTokenMismatch = nonQfProjects.some(
      project =>
        project.tokenSymbol !== aaUsdcToken.symbol ||
        project.tokenAddress?.toLowerCase() !==
          aaUsdcToken.address?.toLowerCase() ||
        project.selectedToken?.chainId !== OPTIMISM_CHAIN_ID ||
        Number(project.selectedToken?.priceInUSD ?? 0) !== 1,
    )
    if (hasNonQfTokenMismatch) {
      updateSelectedToken(
        0,
        aaUsdcToken,
        aaUsdcToken.symbol,
        aaUsdcToken.address as `0x${string}`,
        aaUsdcToken.decimals,
      )
    }
  }, [
    aaUsdcToken,
    cartItems.length,
    isAAWallet,
    nonQfProjects,
    qfRoundGroups,
    updateSelectedChainId,
    updateSelectedToken,
  ])

  // Remove projects from the cart if they are in inactive rounds
  // This is to prevent users from adding projects to the cart that are not active
  useEffect(() => {
    if (isLoading || error || !activeRoundsData) return
    if (cartItems.length === 0) return

    const activeRoundIds = new Set(
      (activeRoundsData.activeQfRounds || [])
        .map(round => Number(round.id))
        .filter(roundId => Number.isFinite(roundId)),
    )

    const projectsInInactiveRounds = cartItems.filter(item => {
      if (item.roundId == null || item.roundId <= 0) return false
      return !activeRoundIds.has(item.roundId)
    })

    if (projectsInInactiveRounds.length === 0) return

    projectsInInactiveRounds.forEach(project => {
      if (project.roundId != null) {
        removeFromCart(project.roundId, project.id)
      }
    })
  }, [activeRoundsData, cartItems, error, isLoading, removeFromCart])

  // Apply the amount to all projects in the cart
  const handleApplyAmountToAll = () => {
    const normalizedAmount = normalizeDecimalInput(aaAmountToDonate) || '0'
    setAaAmountToDonate(normalizedAmount)

    cartItems.forEach(project => {
      updateProjectDonation(
        project.roundId ?? 0,
        project.id,
        normalizedAmount,
        aaUsdcToken.symbol,
        aaUsdcToken.address as `0x${string}`,
        OPTIMISM_CHAIN_ID,
      )
    })
  }

  return (
    <div className="min-h-screen bg-giv-neutral-200">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-giv-brand-500" />
        </div>
      )}
      {error && (
        <div className="text-center py-12 text-giv-neutral-700">
          Failed to load active rounds. Please try again later. {error.message}
        </div>
      )}
      <main className="max-w-7xl mx-auto py-8">
        <div className="flex flex-wrap gap-6">
          {/* Left Column - Donation Rounds */}
          <div className="flex-1 space-y-5 w-12/12 lg:w-8/12">
            {isAAWallet && cartItems.length > 0 && (
              <div className="bg-white p-4 rounded-2xl border-4 border-giv-neutral-500 overflow-hidden">
                <div className="bg-giv-neutral-300 px-5 py-3 rounded-xl text-base font-medium text-giv-neutral-800">
                  Amount to donate
                </div>
                <div className="py-5 flex max-[480px]:flex-wrap items-center justify-between gap-3">
                  <div className="max-[480px]:w-full md:w-auto">
                    <button
                      type="button"
                      className="max-[480px]:w-full md:w-auto flex items-center gap-2 rounded-md border border-giv-neutral-100 px-3 py-2 text-base font-medium text-giv-neutral-900"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-giv-neutral-300 overflow-hidden"
                      >
                        <Image
                          src="/images/icons/usa.png?v=1"
                          alt="USD"
                          width={20}
                          height={20}
                          unoptimized
                          className="h-5 w-5 object-cover"
                        />
                      </span>
                      USD
                      <ChevronDown className="w-4 h-4 text-giv-neutral-900" />
                    </button>
                  </div>
                  <div className="flex-wrap max-[480px]:justify-between flex items-center gap-3 xs:w-full md:w-auto md:ml-auto">
                    <div className="flex-wrap flex items-center gap-2 rounded-md border border-giv-neutral-100 px-3 py-2">
                      <span>$</span>
                      <input
                        type="text"
                        value={aaAmountToDonate}
                        onChange={e =>
                          setAaAmountToDonate(
                            normalizeDecimalInput(e.target.value),
                          )
                        }
                        autoComplete="off"
                        className="w-full max-[480px]:w-24 md:w-16 focus:w-28 transition-[width] duration-200 ease-out text-base p-0 font-medium text-left text-giv-neutral-900 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyAmountToAll}
                      className="ml-1 text-base font-medium text-giv-brand-500 hover:text-giv-brand-700 transition-colors cursor-pointer"
                    >
                      Apply to all
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                    showMissingAmountErrors={showMissingAmountErrors}
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
                showMissingAmountErrors={showMissingAmountErrors}
              />
            )}
            {cartItems.length === 0 && (
              <div className="text-center py-12 text-giv-neutral-700">
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
