'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CircleCheck,
  CircleX,
  Eye,
  EyeClosed,
  Link as LinkIcon,
} from 'lucide-react'
import { EligibilityBanner } from '@/components/eligibility/EligibilityBanner'
import { IconPraiseHand } from '@/components/icons/IconPraiseHand'
import { useCart } from '@/context/CartContext'
import type { RoundCheckoutStatus } from '@/hooks/useMultiRoundCheckout'
import { useProjectById } from '@/hooks/useProject'
import { GIVETH_PROJECT_ID } from '@/lib/constants/app-main'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { getChainName } from '@/lib/helpers/chainHelper'
import { loadCheckoutReceipt } from '@/lib/helpers/checkoutReceipt'

export function SuccessDonationSummary() {
  const { clearCart, givethPercentage } = useCart()
  const [receipt, setReceipt] =
    useState<ReturnType<typeof loadCheckoutReceipt>>(null)
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(
    new Set<string>(),
  )

  const effectiveGivethPercentage =
    receipt?.givethPercentage ?? givethPercentage

  // Get Giveth project data
  const givethProjectData = useProjectById(GIVETH_PROJECT_ID)

  useEffect(() => {
    const r = loadCheckoutReceipt()
    setReceipt(r)
    if (r?.qfRoundGroups?.length) {
      setExpandedRounds(new Set([String(r.qfRoundGroups[0].roundId)]))
    }

    // Clear cart after a successful checkout so users don't see old items again.
    // We only do this if we have a receipt (i.e. we actually completed a checkout flow).
    if (r) clearCart()
  }, [])

  const toggleRound = (roundId: string) => {
    setExpandedRounds(prev => {
      const next = new Set(prev)
      if (next.has(roundId)) {
        next.delete(roundId)
      } else {
        next.add(roundId)
      }
      return next
    })
  }

  const roundStatuses = useMemo(() => {
    const entries = receipt?.roundStatuses ?? []
    return new Map<number, RoundCheckoutStatus>(entries)
  }, [receipt?.roundStatuses])

  const getExplorerUrl = (chainId: number, hash: string) => {
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      10: 'https://optimistic.etherscan.io',
      100: 'https://gnosisscan.io',
      137: 'https://polygonscan.com',
      8453: 'https://basescan.org',
      42161: 'https://arbiscan.io',
    }
    const base = explorers[chainId] || 'https://polygonscan.com'
    return `${base}/tx/${hash}`
  }

  // Count only projects that have donation amount
  const totalQfProjects =
    receipt?.qfRoundGroups.reduce(
      (acc, r) =>
        acc + r.projects.filter(p => Number(p.donationAmount) > 0).length,
      0,
    ) ?? 0
  const totalNonQfProjects =
    receipt?.nonQfProjects.filter(p => Number(p.donationAmount) > 0).length ?? 0

  const totalProjects = useMemo(() => {
    if (!receipt) return 0
    return totalQfProjects + totalNonQfProjects
  }, [receipt, totalQfProjects, totalNonQfProjects])

  const totalUsd = useMemo(() => {
    if (!receipt) return 0
    return (
      receipt.qfRoundGroups.reduce(
        (acc, r) => acc + Number(r.totalUsdValue || 0),
        0,
      ) +
      receipt.nonQfProjects.reduce((acc, p) => {
        const priceInUSD = p.selectedToken?.priceInUSD ?? 0
        return acc + Number(p.donationAmount || 0) * priceInUSD
      }, 0)
    )
  }, [receipt])

  return (
    <div className="p-4 bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="mb-6 mt-2">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-giv-gray-300">
          <IconPraiseHand />
          <h2 className="text-2xl font-bold text-giv-gray-900 [font-family:var(--font-inter)]">
            Your donation summary
          </h2>
        </div>
        <p className="text-giv-gray-700 text-lg font-medium [font-family:var(--font-inter)]">
          You’ve donated{' '}
          <span className="text-giv-primary-700">
            ~${formatNumber(totalUsd)}
          </span>{' '}
          to{' '}
          <span className="text-giv-primary-700">
            {totalProjects} project{totalProjects > 1 ? 's' : ''}.
          </span>
        </p>
      </div>

      {/* Donation Rounds */}
      <div className="space-y-4">
        {!receipt?.qfRoundGroups?.length && (
          <div className="p-4 border-2 border-giv-gray-300 rounded-xl text-giv-gray-700">
            No receipt found. Please complete a donation first.
          </div>
        )}

        {receipt?.qfRoundGroups?.map(round => {
          const status = roundStatuses.get(round.roundId)
          const roundKey = String(round.roundId)
          const isSuccess = status?.status === 'success'
          const isFailed = status?.status === 'error'

          const givethAmountForRound =
            effectiveGivethPercentage > 0 && effectiveGivethPercentage < 100
              ? (Number(round.totalAmount) * effectiveGivethPercentage) /
                (100 - effectiveGivethPercentage)
              : 0

          const totalAmountForRound = round.projects
            .filter(p => Number(p.donationAmount) > 0)
            .reduce((acc, p) => acc + Number(p.donationAmount), 0)

          return (
            <div
              key={roundKey}
              className="p-4 pb-0 border-4 border-giv-gray-300 rounded-xl overflow-hidden"
            >
              {/* Round Header */}
              <div className="bg-giv-gray-300 px-4 py-2 rounded-xl">
                <p className="text-giv-gray-800 text-base font-normal">
                  <span className="font-medium">
                    {totalAmountForRound > 0
                      ? `${totalAmountForRound} ${round.tokenSymbol}`
                      : `${round.totalAmount} ${round.tokenSymbol}`}
                  </span>{' '}
                  (~${formatNumber(Number(round.totalUsdValue || 0))}) to{' '}
                  <span className="font-medium">
                    {totalProjects} project{totalProjects > 1 ? 's' : ''}.
                  </span>{' '}
                  in <span className="font-medium">{round.roundName}</span> on{' '}
                  <span className="font-medium">
                    {getChainName(round.selectedChainId)}
                  </span>
                </p>
              </div>

              {/* Toggle */}
              <div className="py-3 mt-2 [font-family:var(--font-inter)]">
                <div className="flex justify-between mb-3">
                  <div className="flex flex-col items-start gap-2">
                    {isSuccess ? (
                      <div className="inline-flex w-auto items-center gap-2 px-3 py-2.5 bg-giv-gray-200 rounded-md border border-giv-gray-400">
                        <div className="flex items-center gap-2 text-sm font-medium text-giv-jade-500">
                          <span>
                            <CircleCheck className="w-4 h-4" />
                          </span>
                          <span>Donation successful</span>
                        </div>
                      </div>
                    ) : isFailed ? (
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-giv-gray-200 rounded-md border border-giv-gray-400">
                        <div className="flex items-center gap-2 text-sm font-medium text-(--color-danger)">
                          <span>
                            <CircleX className="w-4 h-4" />
                          </span>
                          <span>Donation failed</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-giv-gray-200 rounded-md border border-giv-gray-400">
                        <div className="flex items-center gap-2 text-sm font-medium text-giv-gray-700">
                          <span>Pending</span>
                        </div>
                      </div>
                    )}

                    {status?.transactionHash && (
                      <a
                        href={getExplorerUrl(
                          round.selectedChainId,
                          status.transactionHash,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 text-base font-medium text-giv-primary-500 bg-giv-gray-200 rounded-md px-3 py-2 border border-giv-primary-500 hover:opacity-85"
                      >
                        <LinkIcon className="w-4 h-4 text-giv-primary-500" />
                        <span className="text-giv-primary-500">
                          View on block explorer
                        </span>
                        <ArrowRight className="w-4 h-4 text-giv-primary-500" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => toggleRound(roundKey)}
                    className="flex items-center gap-1 h-12 px-3 py-2 text-base font-medium text-giv-gray-900 hover:text-giv-primary-500 bg-giv-gray-200 rounded-md transition-colors cursor-pointer"
                  >
                    {expandedRounds.has(roundKey) ? 'Hide' : 'Show'} Transaction
                    details
                    {expandedRounds.has(roundKey) ? (
                      <EyeClosed className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Transactions */}
                {expandedRounds.has(roundKey) && (
                  <div className="space-y-2 flex flex-col items-start gap-2">
                    {round.projects.map(project => (
                      <div
                        key={project.id}
                        className="w-auto inline-flex items-center gap-3 py-2 px-3 bg-giv-gray-200 rounded-md text-base text-giv-gray-800 font-normal"
                      >
                        <span className="font-medium">
                          {project.donationAmount} {project.tokenSymbol}
                        </span>
                        <span>to</span>
                        <span className="font-medium">{project.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                {effectiveGivethPercentage > 0 &&
                  expandedRounds.has(roundKey) && (
                    <div className="space-y-2 flex flex-col items-start gap-2 mt-2">
                      <div className="w-auto inline-flex items-center gap-3 py-2 px-3 bg-giv-gray-200 rounded-md text-base text-giv-gray-800 font-normal">
                        <span className="font-medium">
                          {givethAmountForRound > 0
                            ? `${givethAmountForRound} ${round.tokenSymbol}`
                            : `${round.totalAmount} ${round.tokenSymbol}`}
                        </span>
                        <span>to</span>
                        <span className="font-medium">
                          {givethProjectData?.data?.project?.title}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )
        })}

        <EligibilityBanner />
      </div>
    </div>
  )
}
