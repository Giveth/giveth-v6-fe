'use client'

import router from 'next/router'
import { ArrowRight } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'
import { AnonymousOption } from '@/components/cart/AnonymousOption'
import { DonateToGiveth } from '@/components/cart/DonateToGiveth'
import { formatNumber, useWalletTokens } from '@/lib/helpers/cartHelper'
import { getChainName } from '@/lib/helpers/chainHelper'
import { type GroupedProjects } from '@/lib/types/cart'

export function DonationSidebar({
  qfRoundGroups,
}: {
  qfRoundGroups: GroupedProjects[]
}) {
  if (qfRoundGroups.length === 0) return null

  console.log({ qfRoundGroups })

  const account = useActiveAccount()
  const accountAddress = account?.address

  const handleDonateButtonClick = () => {
    // Check is cart value match user wallet balance
    const totalCartValue = qfRoundGroups.reduce((acc, group) => {
      return acc + Number(group.totalUsdValue)
    }, 0)
    const walletTokens = useWalletTokens(
      qfRoundGroups[0].selectedChainId,
      accountAddress,
    )
    if (
      walletTokens.data &&
      walletTokens.data.length > 0 &&
      walletTokens.status === 'success'
    ) {
      const userWalletBalance = walletTokens.reduce((acc, token) => {
        return acc + Number(token.balance)
      }, 0)
    }
    if (totalCartValue > userWalletBalance) {
      toast.error('Insufficient balance')
      return
    }
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
        </div>

        <DonateToGiveth />

        {/* Donate Button */}
        <button
          onClick={handleDonateButtonClick}
          className="w-full py-3 mt-5 bg-giv-pinky-500 text-white! rounded-3xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-giv-pinky-700 transition-colors cursor-pointer"
        >
          Donate now
          <ArrowRight className="w-5 h-5" />
        </button>

        <AnonymousOption />
      </div>
    </div>
  )
}
