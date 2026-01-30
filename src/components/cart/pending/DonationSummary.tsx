'use client'

import { useState } from 'react'
import clsx from 'clsx'
import {
  CheckCircle2,
  CircleDashed,
  Ellipsis,
  Eye,
  EyeClosed,
  XCircle,
} from 'lucide-react'
import { IconPraiseHand } from '@/components/icons/IconPraiseHand'
import type { ProjectCartItem } from '@/context/CartContext'
import type { RoundCheckoutStatus } from '@/hooks/useMultiRoundCheckout'
import { useProjectById } from '@/hooks/useProject'
import { GIVETH_PROJECT_ID } from '@/lib/constants/app-main'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { getChainName } from '@/lib/helpers/chainHelper'
import type { GroupedProjects } from '@/lib/types/cart'

type OverallStatus =
  | 'idle'
  | 'preparing'
  | 'in_progress'
  | 'completed'
  | 'failed'

export function DonationSummary({
  qfRoundGroups,
  nonQfProjects,
  roundStatuses,
  overallStatus,
  overallError,
  givethPercentage,
}: {
  qfRoundGroups: GroupedProjects[]
  nonQfProjects: ProjectCartItem[]
  roundStatuses: Map<number, RoundCheckoutStatus>
  overallStatus: OverallStatus
  overallError?: string
  givethPercentage: number
}) {
  const totalProjectsInCart =
    qfRoundGroups.reduce((acc, r) => acc + r.projects.length, 0) +
    nonQfProjects.length

  // Count only projects that have donation amount
  const totalQfProjects = qfRoundGroups.reduce(
    (acc, r) =>
      acc + r.projects.filter(p => Number(p.donationAmount) > 0).length,
    0,
  )
  const totalNonQfProjects = nonQfProjects.filter(
    p => Number(p.donationAmount) > 0,
  ).length

  const totalProjects = totalQfProjects + totalNonQfProjects

  const totalUsd =
    qfRoundGroups.reduce((acc, r) => acc + Number(r.totalUsdValue || 0), 0) +
    nonQfProjects.reduce((acc, p) => {
      const priceInUSD = p.selectedToken?.priceInUSD ?? 0
      return acc + Number(p.donationAmount || 0) * priceInUSD
    }, 0)

  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(
    new Set(qfRoundGroups.map(r => String(r.roundId))),
  )

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

  const getRoundStatus = (roundId: number) => roundStatuses.get(roundId)

  const getRoundBadgeText = (status?: RoundCheckoutStatus['status']) => {
    switch (status) {
      case 'preparing':
        return 'Ready to process'
      case 'awaiting_approval':
        return 'Ready to process'
      case 'processing':
      case 'confirming':
        return 'Your donation is processing'
      case 'success':
        return 'Donation completed'
      case 'error':
        return 'Donation failed'
      default:
        return 'Your donation is processing'
    }
  }

  const getRoundStatusIcon = (status?: RoundCheckoutStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'preparing':
      case 'awaiting_approval':
      case 'processing':
      case 'confirming':
        return <CircleDashed className="w-4 h-4 animate-spin" />
      default:
        return <Ellipsis className="w-4 h-4" />
    }
  }

  // Get Giveth project data
  const givethProjectData = useProjectById(GIVETH_PROJECT_ID)

  return (
    <div className="p-4 bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="mb-6 mt-2">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-giv-neutral-300">
          <IconPraiseHand />
          <h2 className="text-2xl font-bold text-giv-neutral-900">
            Your donation summary
          </h2>
        </div>
        <p className="text-giv-neutral-700 text-lg font-medium">
          You are donating{' '}
          <span className="text-giv-brand-700">~${formatNumber(totalUsd)}</span>{' '}
          to{' '}
          <span className="text-giv-brand-700">{totalProjects} projects.</span>
        </p>
      </div>

      {/* If some project(s) don't have donation amount, show a warning */}
      {totalQfProjects !== totalProjectsInCart && (
        <div className="mb-4 p-3 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-700 text-sm">
          Some projects don't have donation amount.
        </div>
      )}

      {/* Donation Rounds */}
      <div className="space-y-4">
        {qfRoundGroups.map(round => {
          const status = getRoundStatus(round.roundId)
          const roundKey = String(round.roundId)
          const roundTotalAmount = Number(round.totalAmount || 0)
          const givethAmountForRound =
            givethPercentage > 0 && givethPercentage < 100
              ? (roundTotalAmount * givethPercentage) / (100 - givethPercentage)
              : 0

          const totalAmountInRound = roundTotalAmount + givethAmountForRound

          // COunt only projects that have donation amount
          const projectsWithAmount = round.projects.filter(
            p => Number(p.donationAmount) > 0,
          )
          const numberOfProjectsWithAmount = projectsWithAmount.length

          return (
            <div
              key={roundKey}
              className="p-4 pb-0 border-4 border-giv-neutral-300 rounded-xl overflow-hidden"
            >
              {/* Round Header */}
              <div className="bg-giv-neutral-300 px-4 py-2 rounded-xl">
                <p className="text-giv-neutral-800 text-base font-normal">
                  <span className="font-medium">
                    {formatNumber(totalAmountInRound, {
                      minDecimals: 2,
                      maxDecimals: 6,
                    })}{' '}
                    {round.tokenSymbol}
                  </span>{' '}
                  (~${formatNumber(Number(round.totalUsdValue || 0))}) to{' '}
                  <span className="font-medium">
                    {numberOfProjectsWithAmount} projects
                  </span>{' '}
                  in <span className="font-medium">{round.roundName}</span>{' '}
                  {givethPercentage > 0 && (
                    <>
                      and
                      <span className="font-medium"> Giveth</span>{' '}
                    </>
                  )}
                  on{' '}
                  <span className="font-medium">
                    {getChainName(round.selectedChainId)}
                  </span>
                </p>
              </div>

              {/* Toggle */}
              <div className="py-3">
                {/* Processing Status */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 ${
                      status?.status === 'success'
                        ? 'text-green-700 border-green-300'
                        : status?.status === 'error' ||
                            overallStatus === 'failed'
                          ? 'text-red-700 border-red-300'
                          : 'text-giv-neutral-700 border-giv-neutral-400'
                    } bg-giv-neutral-200 rounded-md border`}
                  >
                    {overallStatus === 'failed' && overallError && (
                      <>
                        <span className="flex items-center justify-center w-4 h-4">
                          <XCircle className="w-4 h-4 text-red-600" />
                        </span>
                        <span className="text-sm">Donation failed</span>
                      </>
                    )}
                    {overallStatus !== 'failed' && (
                      <>
                        <span className="flex items-center justify-center w-4 h-4">
                          {getRoundStatusIcon(status?.status)}
                        </span>
                        <span className="text-sm">
                          {getRoundBadgeText(status?.status)}
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => toggleRound(roundKey)}
                    className={clsx(
                      'flex items-center gap-1 text-base font-medium',
                      'text-giv-neutral-900 hover:text-giv-brand-500',
                      'bg-giv-neutral-200 rounded-md px-3 py-2',
                      'transition-colors cursor-pointer',
                    )}
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
                        className={clsx(
                          'w-auto inline-flex items-center gap-3 py-2 px-3 bg-giv-neutral-200 rounded-md text-base',
                          'text-giv-neutral-900 font-normal',
                        )}
                      >
                        {/* Amount */}
                        <span className="font-medium">
                          {project.donationAmount} {project.tokenSymbol}
                        </span>

                        <span>to</span>

                        {/* Project Name */}
                        <span className="font-medium">{project.title}</span>
                      </div>
                    ))}
                  </div>
                )}
                {givethPercentage > 0 && expandedRounds.has(roundKey) && (
                  <div className="text-giv-neutral-700 text-sm font-normal mt-2">
                    <div
                      key={GIVETH_PROJECT_ID}
                      className="w-auto inline-flex items-center gap-3 py-2 px-3 bg-giv-neutral-200 rounded-md text-base text-giv-neutral-800 font-normal"
                    >
                      {/* Amount */}
                      <span className="font-medium">
                        {formatNumber(givethAmountForRound)} {round.tokenSymbol}
                      </span>

                      <span>to</span>
                      <span className="font-medium">
                        {givethProjectData?.data?.project?.title ?? 'Giveth'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {nonQfProjects.length > 0 && (
          <div className="p-4 border-4 border-giv-neutral-300 rounded-xl overflow-hidden">
            <div className="bg-giv-neutral-300 px-4 py-2 rounded-xl">
              <p className="text-giv-neutral-800 text-base font-normal">
                <span className="font-medium">Direct donations</span>
              </p>
            </div>
            <div className="py-3">
              <div className="space-y-2 flex flex-col items-start gap-2">
                {nonQfProjects.map(project => (
                  <div
                    key={project.id}
                    className="w-auto inline-flex items-center gap-3 py-2 px-3 bg-giv-neutral-200 rounded-md text-base text-giv-neutral-800 font-normal"
                  >
                    <span className="font-medium">
                      {project.donationAmount} {project.tokenSymbol}
                    </span>
                    <span>to</span>
                    <span className="font-medium">{project.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
