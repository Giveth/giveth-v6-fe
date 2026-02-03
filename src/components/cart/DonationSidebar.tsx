'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'
import { useActiveAccount, useConnectModal } from 'thirdweb/react'
import { AnonymousOption } from '@/components/cart/AnonymousOption'
import { DonateToGiveth } from '@/components/cart/DonateToGiveth'
import { IconWalletApproved } from '@/components/icons/IconWalletApproved'
import { InsufficientFund } from '@/components/modals/InsufficientFund'
import ConnectWalletButton from '@/components/wallet/ConnectWalletButton'
import { useSiweAuth } from '@/context/AuthContext'
import { useCart, type ProjectCartItem } from '@/context/CartContext'
import { useMultiRoundCheckout } from '@/hooks/useMultiRoundCheckout'
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
  const { setShowMissingAmountErrors } = useCart()
  const { reset } = useMultiRoundCheckout()
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

    const totalGroupCartValueWithGiveth =
      totalGroupCartValueUsd + (totalGroupCartValueUsd * givethPercentage) / 100

    if (totalGroupCartValueWithGiveth > totalGroupCartBalanceUsd) {
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

    const totalNonGroupCartValueWithGiveth =
      totalNonGroupCartValueUsd +
      (totalNonGroupCartValueUsd * givethPercentage) / 100

    if (totalNonGroupCartValueWithGiveth > totalNonGroupCartBalanceUsd) {
      setIsInsufficientFund(true)
      return
    }

    // Checko is cart empty
    if (!hasDonationAmount) {
      return
    }

    // Check if round doesn't have any selected token
    const roundsWithoutToken = qfRoundGroups.filter(
      group => !group.selectedToken,
    )
    if (roundsWithoutToken.length > 0) {
      console.error(
        'No token selected for the following rounds:',
        roundsWithoutToken.map(group => group.roundName),
      )
      return
    }

    // Check if some project inside the cart don't have amount
    const projectsWithoutAmount = qfRoundGroups.flatMap(group =>
      group.projects.filter(project => Number(project.donationAmount) === 0),
    )
    const nonQfProjectsWithoutAmount = nonQfProjects.filter(
      project => Number(project.donationAmount) === 0,
    )
    if (
      projectsWithoutAmount.length > 0 ||
      nonQfProjectsWithoutAmount.length > 0
    ) {
      setShowMissingAmountErrors(true)
      return
    }
    setShowMissingAmountErrors(false)

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

    // Sign in if user is not authenticated
    if (!isAuthenticated) {
      try {
        await signIn()
      } catch {
        return
      }
    }

    // Check if user have jwt token
    const storedToken =
      typeof window !== 'undefined'
        ? (window.localStorage.getItem('giveth_token') ?? undefined)
        : undefined
    const jwt = token ?? storedToken
    if (!jwt) return

    // Reset overallStatus and overallError
    reset()

    // Redirect to pending page
    router.push('/cart/pending')
  }

  if (!hasAnyItems) return null

  return (
    <div className="shrink-0 space-y-4 w-12/12 lg:w-4/12">
      {/* Credit Card Option */}
      {/* <div className="bg-white p-5 rounded-2xl">
        <p className="text-base font-medium text-giv-neutral-900 mb-3">
          New to crypto? REMOVE THIS PART
        </p>
        <button className="w-full px-4 py-3 rounded-lg border border-giv-brand-500 hover:border-giv-brand-900 text-giv-neutral-800 text-sm font-medium hover:bg-giv-brand-05 transition-colors flex items-center justify-center gap-1 cursor-pointer">
          Donate with your credit card
          <span className="text-giv-brand-400">New*</span>
        </button>
      </div> */}

      {/* Donation Summary */}

      <div className="bg-white p-5 rounded-2xl">
        <h3 className="text-base font-medium text-giv-neutral-900 mb-2 pb-2 border-b border-giv-neutral-300">
          Donation Summary
        </h3>
        {!walletAddress && (
          <div className="flex flex-col justify-center items-center h-48">
            <div className="text-base font-medium text-giv-neutral-800 pb-2">
              Connect your wallet to begin
            </div>
            <ConnectWalletButton showIcon={true} backgroundColor="#8668FC" />
          </div>
        )}
        {!isAuthenticated && walletAddress && (
          <div className="flex flex-col justify-center items-center h-48">
            <div className="text-base font-medium text-giv-neutral-800 pb-2">
              Please sign in to donate
            </div>
            <button
              onClick={() => signIn()}
              className="px-6 py-2.5 font-semibold rounded-md transition-all duration-200 shadow-sm cursor-pointer bg-giv-brand-300 text-white hover:opacity-85"
            >
              <span className="inline-flex items-center gap-2">
                Sign wallet
                <IconWalletApproved className="w-6 h-6" />
              </span>
            </button>
          </div>
        )}
        <div className="pt-2 space-y-4">
          {walletAddress &&
            isAuthenticated &&
            qfRoundGroups.map(group => {
              // Show only number of the project that have amout
              const projectsWithAmount = group.projects.filter(
                project => Number(project.donationAmount) > 0,
              )
              const numberOfProjectsWithAmount = projectsWithAmount.length

              const totalGroupAmount = Number(group.totalAmount)
              const totalGroupAmountUsd = Number(group.totalUsdValue)

              const totalGroupAmountWithGiveth =
                totalGroupAmount + (totalGroupAmount * givethPercentage) / 100

              return (
                <div
                  key={group.roundId}
                  className="p-3 rounded-lg border border-giv-neutral-300"
                >
                  <p className="text-base text-giv-neutral-900 font-medium">
                    {formatNumber(totalGroupAmountWithGiveth, {
                      minDecimals: 2,
                      maxDecimals: 2,
                    })}{' '}
                    {group.tokenSymbol}{' '}
                    <span className="font-normal">
                      (~${formatNumber(totalGroupAmountUsd)}) to
                    </span>{' '}
                    {numberOfProjectsWithAmount} project
                    {numberOfProjectsWithAmount > 1 ? 's' : ''}{' '}
                    <span className="font-normal">in</span>
                  </p>
                  <p className="text-base text-giv-neutral-900 font-medium mt-0.5">
                    {group.roundName}
                    {givethPercentage > 0 && (
                      <>
                        <span className="font-normal"> and </span>
                        <span className="font-medium"> Giveth</span>{' '}
                      </>
                    )}{' '}
                    <span className="font-normal">on</span>{' '}
                    {getChainName(group.selectedChainId)}
                  </p>
                </div>
              )
            })}
          {isAuthenticated &&
            walletAddress &&
            nonQfProjects.map(project => (
              <div
                key={project.id}
                className="p-3 rounded-lg border border-giv-neutral-300"
              >
                <p className="text-base text-giv-neutral-900 font-medium">
                  {project.title}
                </p>
                <p className="text-base text-giv-neutral-900 font-medium mt-0.5">
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
          className={`${walletAddress && isAuthenticated ? 'block' : 'opacity-50 cursor-not-allowed'}`}
        >
          <DonateToGiveth />

          {/* Donate Button */}
          <button
            onClick={handleDonateButtonClick}
            disabled={!hasDonationAmount || !walletAddress || !isAuthenticated}
            className={clsx(
              'w-full py-4 mt-5 bg-giv-brand-300 text-white! rounded-md text-xs font-bold flex items-center',
              'justify-center gap-2 hover:bg-giv-brand-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
            )}
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
