'use client'

import { useState } from 'react'
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
}: {
  qfRoundGroups: GroupedProjects[]
  nonQfProjects: ProjectCartItem[]
  roundStatuses: Map<number, RoundCheckoutStatus>
  overallStatus: OverallStatus
  overallError?: string
}) {
  const totalProjects =
    qfRoundGroups.reduce((acc, r) => acc + r.projects.length, 0) +
    nonQfProjects.length

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
        return 'Preparing transactions...'
      case 'awaiting_approval':
        return 'Approve in wallet'
      case 'processing':
      case 'confirming':
        return 'Your transactions are processing.'
      case 'success':
        return 'Transactions completed.'
      case 'error':
        return 'Some transactions failed.'
      default:
        return 'Ready to process transactions.'
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
          You are donating{' '}
          <span className="text-giv-primary-700">
            ~${formatNumber(totalUsd)}
          </span>{' '}
          to{' '}
          <span className="text-giv-primary-700">
            {totalProjects} projects.
          </span>
        </p>
      </div>

      {overallStatus === 'failed' && overallError && (
        <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {overallError}
        </div>
      )}

      {/* Donation Rounds */}
      <div className="space-y-4">
        {qfRoundGroups.map(round => {
          const status = getRoundStatus(round.roundId)
          const roundKey = String(round.roundId)
          return (
            <div
              key={roundKey}
              className="p-4 pb-0 border-4 border-giv-gray-300 rounded-xl overflow-hidden"
            >
              {/* Round Header */}
              <div className="bg-giv-gray-300 px-4 py-2 rounded-xl">
                <p className="text-giv-gray-800 text-base font-normal">
                  <span className="font-medium">
                    {round.totalAmount} {round.tokenSymbol}
                  </span>{' '}
                  (~${formatNumber(Number(round.totalUsdValue || 0))}) to{' '}
                  <span className="font-medium">
                    {round.projects.length} projects
                  </span>{' '}
                  in <span className="font-medium">{round.roundName}</span> on{' '}
                  <span className="font-medium">
                    {getChainName(round.selectedChainId)}
                  </span>
                </p>
              </div>

              {/* Toggle */}
              <div className="py-3 [font-family:var(--font-inter)]">
                {/* Processing Status */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 ${
                      status?.status === 'success'
                        ? 'text-green-700 border-green-300'
                        : status?.status === 'error'
                          ? 'text-red-700 border-red-300'
                          : 'text-giv-gray-700 border-giv-gray-400'
                    } bg-giv-gray-200 rounded-md border`}
                  >
                    <span className="flex items-center justify-center w-4 h-4">
                      {getRoundStatusIcon(status?.status)}
                    </span>
                    <span className="text-sm">
                      {getRoundBadgeText(status?.status)}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleRound(roundKey)}
                    className="flex items-center gap-1 text-base font-medium text-giv-gray-900 hover:text-giv-primary-500 bg-giv-gray-200 rounded-md px-3 py-2 transition-colors cursor-pointer"
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
              </div>
            </div>
          )
        })}

        {nonQfProjects.length > 0 && (
          <div className="p-4 border-4 border-giv-gray-300 rounded-xl overflow-hidden">
            <div className="bg-giv-gray-300 px-4 py-2 rounded-xl">
              <p className="text-giv-gray-800 text-base font-normal">
                <span className="font-medium">Direct donations</span>
              </p>
            </div>
            <div className="py-3 [font-family:var(--font-inter)]">
              <div className="space-y-2 flex flex-col items-start gap-2">
                {nonQfProjects.map(project => (
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
