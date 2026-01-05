'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'
import { AnonymousOption } from '@/components/cart/AnonymousOption'
import { DonateToGiveth } from '@/components/cart/DonateToGiveth'
import { type ProjectCartItem } from '@/context/CartContext'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { getChainName } from '@/lib/helpers/chainHelper'
import { type GroupedProjects } from '@/lib/types/cart'
import { InsufficientFund } from '../modals/InsufficientFund'

export function DonationSidebar({
  qfRoundGroups,
  nonQfProjects,
}: {
  qfRoundGroups: GroupedProjects[]
  nonQfProjects: ProjectCartItem[]
}) {
  const router = useRouter()
  useActiveAccount()

  const [isInsufficientFund, setIsInsufficientFund] = useState(false)
  const [totalCartAmountUsd, setTotalCartAmountUsd] = useState(0)

  if (qfRoundGroups.length === 0) return null

  // Set total cart amount
  useEffect(() => {
    const totalCartAmountUsd = qfRoundGroups.reduce((acc, group) => {
      return acc + Number(group.totalUsdValue)
    }, 0)
    const totalNonQfProjectsAmount = nonQfProjects.reduce((acc, project) => {
      return (
        acc +
        Number(project.donationAmount) *
          Number(project.selectedToken?.priceInUSD ?? 0)
      )
    }, 0)
    setTotalCartAmountUsd(totalCartAmountUsd + totalNonQfProjectsAmount)
  }, [qfRoundGroups, nonQfProjects])

  const handleDonateButtonClick = () => {
    // Check is cart group value match user wallet balance
    const totalGroupCartValueUsd = qfRoundGroups.reduce((acc, group) => {
      return acc + Number(group.totalUsdValue)
    }, 0)

    const totalGroupCartBalanceUsd = qfRoundGroups.reduce((acc, group) => {
      return (
        acc +
        Number(group.selectedToken?.formattedBalance ?? 0) *
          Number(group.selectedToken?.priceInUSD ?? 0)
      )
    }, 0)

    if (totalGroupCartValueUsd > totalGroupCartBalanceUsd) {
      setIsInsufficientFund(true)
      return
    }

    // Check is cart non-group value match user wallet balance
    const totalNonGroupCartValueUsd = nonQfProjects.reduce((acc, project) => {
      return (
        acc +
        Number(project.donationAmount) *
          Number(project.selectedToken?.priceInUSD ?? 0)
      )
    }, 0)

    const totalNonGroupCartBalanceUsd = nonQfProjects.reduce((acc, project) => {
      return (
        acc +
        Number(project.selectedToken?.formattedBalance ?? 0) *
          Number(project.selectedToken?.priceInUSD ?? 0)
      )
    }, 0)

    if (totalNonGroupCartValueUsd > totalNonGroupCartBalanceUsd) {
      setIsInsufficientFund(true)
      return
    }

    // Checko is cart empty
    if (totalCartAmountUsd === 0) {
      return
    }

    router.push('/cart/pending')
  }

  return (
    <div className="shrink-0 space-y-4 w-12/12 lg:w-4/12">
      {/* Credit Card Option */}
      <div className="bg-white p-5 rounded-2xl">
        <p className="text-base font-medium text-giv-gray-900 mb-3">
          New to crypto? REMOVE THIS PART
        </p>
        <button className="w-full px-4 py-3 rounded-lg border border-giv-primary-500 hover:border-giv-primary-900 text-giv-gray-800 text-sm font-medium hover:bg-giv-primary-05 transition-colors flex items-center justify-center gap-1 cursor-pointer">
          Donate with your credit card
          <span className="text-giv-primary-400">New*</span>
        </button>
      </div>

      {/* Donation Summary */}

      <div className="bg-white p-5 rounded-2xl">
        <h3 className="text-base font-medium text-giv-gray-900 mb-2 pb-2 border-b border-giv-gray-300">
          Donation Summary
        </h3>
        <div className="pt-2 space-y-4">
          {qfRoundGroups.map(group => (
            <div
              key={group.roundId}
              className="p-3 rounded-lg border border-giv-gray-300"
            >
              <p className="text-base text-giv-gray-900 font-medium">
                {group.totalAmount} {group.tokenSymbol}{' '}
                <span className="font-normal">
                  (~${formatNumber(Number(group.totalUsdValue))}) to
                </span>{' '}
                {group.projects.length} project
                {group.projects.length > 1 ? 's' : ''}{' '}
                <span className="font-normal">in</span>
              </p>
              <p className="text-base text-giv-gray-900 font-medium mt-0.5">
                {group.roundName} <span className="font-normal">on</span>{' '}
                {getChainName(group.selectedChainId)}
              </p>
            </div>
          ))}
          {nonQfProjects.map(project => (
            <div
              key={project.id}
              className="p-3 rounded-lg border border-giv-gray-300"
            >
              <p className="text-base text-giv-gray-900 font-medium">
                {project.title}
              </p>
              <p className="text-base text-giv-gray-900 font-medium mt-0.5">
                {project.donationAmount} {project.tokenSymbol}{' '}
                <span className="font-normal">
                  (~$
                  {formatNumber(
                    Number(project.donationAmount) *
                      (project.selectedToken?.priceInUSD ?? 0),
                  )}
                  )
                </span>
              </p>
            </div>
          ))}
        </div>

        <DonateToGiveth />

        {/* Donate Button */}
        <button
          onClick={handleDonateButtonClick}
          disabled={totalCartAmountUsd === 0}
          className="w-full py-3 mt-5 bg-giv-pinky-500 text-white! rounded-3xl text-xs font-bold flex items-center 
          justify-center gap-2 hover:bg-giv-pinky-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Donate now
          <ArrowRight className="w-5 h-5" />
        </button>

        <AnonymousOption />
      </div>

      <InsufficientFund
        open={isInsufficientFund}
        onOpenChange={setIsInsufficientFund}
      />
    </div>
  )
}
