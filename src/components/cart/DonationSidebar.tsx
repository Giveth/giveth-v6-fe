'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { useActiveAccount, useConnectModal } from 'thirdweb/react'
import { AnonymousOption } from '@/components/cart/AnonymousOption'
import { DonateToGiveth } from '@/components/cart/DonateToGiveth'
import { InsufficientFund } from '@/components/modals/InsufficientFund'
import ConnectWalletButton from '@/components/wallet/ConnectWalletButton'
import { useSiweAuth } from '@/context/AuthContext'
import { type ProjectCartItem } from '@/context/CartContext'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { getChainName } from '@/lib/helpers/chainHelper'
import {
  primaryWallets,
  supportedChains,
  thirdwebClient,
} from '@/lib/thirdweb/client'
import { type GroupedProjects } from '@/lib/types/cart'

export function DonationSidebar({
  qfRoundGroups,
  nonQfProjects,
  givethPercentage,
}: {
  qfRoundGroups: GroupedProjects[]
  nonQfProjects: ProjectCartItem[]
  givethPercentage: number
}) {
  const router = useRouter()

  const { signIn, isAuthenticated, token, walletAddress } = useSiweAuth()
  const account = useActiveAccount()
  const { connect } = useConnectModal()

  const [isInsufficientFund, setIsInsufficientFund] = useState(false)

  const hasDonationAmount = useMemo(() => {
    const hasGroupedAmount = qfRoundGroups.some(group =>
      group.projects.some(project => Number(project.donationAmount) > 0),
    )
    const hasNonGroupedAmount = nonQfProjects.some(
      project => Number(project.donationAmount) > 0,
    )
    return hasGroupedAmount || hasNonGroupedAmount
  }, [qfRoundGroups, nonQfProjects])

  const hasAnyItems = qfRoundGroups.length > 0 || nonQfProjects.length > 0

  const handleDonateButtonClick = async () => {
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
    if (!hasDonationAmount) {
      return
    }

    // Require wallet connection and SIWE auth before proceeding
    if (!account?.address) {
      try {
        await connect({
          client: thirdwebClient,
          wallets: primaryWallets,
          chains: supportedChains,
          size: 'compact',
          showThirdwebBranding: false,
        })
      } catch {
        return
      }
      if (!account?.address) return
    }
    if (!isAuthenticated) {
      try {
        await signIn()
      } catch {
        return
      }
    }
    const storedToken =
      typeof window !== 'undefined'
        ? (window.localStorage.getItem('giveth_token') ?? undefined)
        : undefined
    const jwt = token ?? storedToken
    if (!jwt) return

    // Redirect to pending page
    router.push('/cart/pending')
  }

  if (!hasAnyItems) return null

  return (
    <div className="shrink-0 space-y-4 w-12/12 lg:w-4/12">
      {/* Credit Card Option */}
      {/* <div className="bg-white p-5 rounded-2xl">
        <p className="text-base font-medium text-giv-gray-900 mb-3">
          New to crypto? REMOVE THIS PART
        </p>
        <button className="w-full px-4 py-3 rounded-lg border border-giv-primary-500 hover:border-giv-primary-900 text-giv-gray-800 text-sm font-medium hover:bg-giv-primary-05 transition-colors flex items-center justify-center gap-1 cursor-pointer">
          Donate with your credit card
          <span className="text-giv-primary-400">New*</span>
        </button>
      </div> */}

      {/* Donation Summary */}

      <div className="bg-white p-5 rounded-2xl">
        <h3 className="text-base font-medium text-giv-gray-900 mb-2 pb-2 border-b border-giv-gray-300">
          Donation Summary
        </h3>
        {!walletAddress && (
          <div className="flex flex-col justify-center items-center h-48">
            <div className="text-base font-medium text-giv-gray-800 pb-2">
              Connect your wallet to begin
            </div>
            <ConnectWalletButton showIcon={true} backgroundColor="#8668FC" />
          </div>
        )}
        <div className="pt-2 space-y-4">
          {walletAddress &&
            qfRoundGroups.map(group => {
              // Show only number of the project that have amout
              const projectsWithAmount = group.projects.filter(
                project => Number(project.donationAmount) > 0,
              )
              const numberOfProjectsWithAmount = projectsWithAmount.length

              // Reduce group amount by giveth percentage
              const reducedGroupAmount =
                Number(group.totalAmount) * (1 - givethPercentage / 100)
              const reducedGroupAmountUsd =
                Number(group.totalUsdValue) * (1 - givethPercentage / 100)

              return (
                <div
                  key={group.roundId}
                  className="p-3 rounded-lg border border-giv-gray-300"
                >
                  <p className="text-base text-giv-gray-900 font-medium">
                    {formatNumber(reducedGroupAmount, {
                      minDecimals: 2,
                      maxDecimals: 6,
                    })}{' '}
                    {group.tokenSymbol}{' '}
                    <span className="font-normal">
                      (~${formatNumber(reducedGroupAmountUsd)}) to
                    </span>{' '}
                    {numberOfProjectsWithAmount} project
                    {numberOfProjectsWithAmount > 1 ? 's' : ''}{' '}
                    <span className="font-normal">in</span>
                  </p>
                  <p className="text-base text-giv-gray-900 font-medium mt-0.5">
                    {group.roundName} <span className="font-normal">on</span>{' '}
                    {getChainName(group.selectedChainId)}
                  </p>
                </div>
              )
            })}
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

        <div
          className={`${walletAddress ? 'block' : 'opacity-50 cursor-not-allowed'}`}
        >
          <DonateToGiveth />
          {/* Donate Button */}
          <button
            onClick={handleDonateButtonClick}
            disabled={!hasDonationAmount}
            className="w-full py-3 mt-5 bg-giv-pinky-500 text-white! rounded-3xl text-xs font-bold flex items-center 
          justify-center gap-2 hover:bg-giv-pinky-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Donate now
            <ArrowRight className="w-5 h-5" />
          </button>
          <AnonymousOption />
        </div>
      </div>

      <InsufficientFund
        open={isInsufficientFund}
        onOpenChange={setIsInsufficientFund}
      />
    </div>
  )
}
