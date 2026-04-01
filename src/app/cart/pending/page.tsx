'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { DonationSummary } from '@/components/cart/pending/DonationSummary'
import { PendingHero } from '@/components/cart/pending/PendingHero'
import { useCart, type DonationRound } from '@/context/CartContext'
import { useMultiRoundCheckout } from '@/hooks/useMultiRoundCheckout'
import { groupCartItemsByRound } from '@/lib/helpers/cartHelper'
import {
  clearCheckoutReceipt,
  saveCheckoutReceipt,
} from '@/lib/helpers/checkoutReceipt'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

function isRoundTokenMetadataReady(round: DonationRound): boolean {
  const selectedToken =
    round.selectedToken ??
    round.projects.find(project => project.selectedToken)?.selectedToken

  if (!selectedToken) return false
  if (!selectedToken.symbol) return false
  if (!Number.isFinite(selectedToken.decimals) || selectedToken.decimals < 0) {
    return false
  }
  if (selectedToken.chainId !== round.selectedChainId) return false

  const normalizedSelectedAddress = selectedToken.address?.toLowerCase() ?? ''
  const normalizedRoundAddress = (round.tokenAddress || '').toLowerCase()
  const selectedIsNative =
    !normalizedSelectedAddress || normalizedSelectedAddress === ZERO_ADDRESS
  const roundIsNative =
    !normalizedRoundAddress || normalizedRoundAddress === ZERO_ADDRESS

  if (selectedIsNative && roundIsNative) return true
  return normalizedSelectedAddress === normalizedRoundAddress
}

export default function PendingPage() {
  const router = useRouter()
  const { cartItems, isAnonymous, givethPercentage } = useCart()
  const { state, checkoutAllRounds } = useMultiRoundCheckout()
  const startedRef = useRef(false)
  const checkoutGivethPercentageRef = useRef(givethPercentage)

  const effectiveGivethPercentage = startedRef.current
    ? checkoutGivethPercentageRef.current
    : givethPercentage

  const { qfRoundGroups, nonQfProjects } = useMemo(
    () => groupCartItemsByRound(cartItems),
    [cartItems],
  )

  const roundsForCheckout: DonationRound[] = useMemo(() => {
    return qfRoundGroups
      .map(group => {
        const projectsWithAmount = group.projects.filter(
          project => Number(project.donationAmount) > 0,
        )
        if (projectsWithAmount.length === 0) return null

        const fallbackToken = projectsWithAmount.find(
          p => p.selectedToken,
        )?.selectedToken

        const totalAmount = projectsWithAmount.reduce((acc, project) => {
          return acc + Number(project.donationAmount || 0)
        }, 0)
        const totalUsdValue = projectsWithAmount.reduce((acc, project) => {
          const priceInUSD = project.selectedToken?.priceInUSD ?? 0
          return acc + Number(project.donationAmount || 0) * priceInUSD
        }, 0)

        return {
          roundId: group.roundId,
          roundName: group.roundName,
          selectedChainId: group.selectedChainId,
          selectedToken: group.selectedToken ?? fallbackToken,
          tokenSymbol: group.tokenSymbol,
          tokenAddress: group.tokenAddress,
          tokenDecimals: group.tokenDecimals,
          projects: projectsWithAmount,
          totalAmount: totalAmount.toString(),
          totalUsdValue: totalUsdValue.toString(),
        }
      })
      .filter((round): round is DonationRound => Boolean(round))
  }, [qfRoundGroups])

  const isCheckoutReady = useMemo(() => {
    if (roundsForCheckout.length === 0) return false
    return roundsForCheckout.every(isRoundTokenMetadataReady)
  }, [roundsForCheckout])

  // If user lands here with an empty cart, bounce back.
  useEffect(() => {
    if (cartItems.length === 0) router.push('/cart' as never)
  }, [cartItems.length, router])

  // Start processing immediately when page loads.
  useEffect(() => {
    if (startedRef.current) return
    if (roundsForCheckout.length === 0) return
    if (!isCheckoutReady) return
    startedRef.current = true
    checkoutGivethPercentageRef.current = givethPercentage
    clearCheckoutReceipt()
    void checkoutAllRounds(roundsForCheckout, { anonymous: isAnonymous })
  }, [checkoutAllRounds, roundsForCheckout, isAnonymous, isCheckoutReady])

  // Move to success page once processing is complete (even if some rounds failed).
  useEffect(() => {
    if (state.status === 'completed') {
      saveCheckoutReceipt({
        createdAt: Date.now(),
        qfRoundGroups,
        nonQfProjects,
        roundStatuses: Array.from(state.roundStatuses.entries()),
        overallStatus: state.status,
        overallError: state.overallError,
        givethPercentage: effectiveGivethPercentage,
      })
      router.push('/cart/success' as never)
    }
  }, [
    state.status,
    state.overallError,
    state.roundStatuses,
    router,
    qfRoundGroups,
    nonQfProjects,
    effectiveGivethPercentage,
  ])

  return (
    <div className="bg-giv-neutral-200 flex flex-col">
      <main className="flex-1 pb-8">
        <PendingHero
          overallError={state.overallError}
          overallStatus={state.status}
        />
        <div className="max-w-7xl mx-auto px-4 space-y-6 mt-6">
          <DonationSummary
            qfRoundGroups={qfRoundGroups}
            nonQfProjects={nonQfProjects}
            roundStatuses={state.roundStatuses}
            givethPercentage={effectiveGivethPercentage}
            overallStatus={state.status}
            overallError={state.overallError}
          />
        </div>
      </main>
    </div>
  )
}
