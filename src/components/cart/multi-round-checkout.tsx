/**
 * Multi-Round Checkout Component
 *
 * UI for checking out multiple QF rounds with automatic chain switching
 * and progress tracking for each round.
 */

'use client'

import { AlertCircle, Check, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DonationRound } from '@/context/CartContext'
import { useMultiRoundCheckout } from '@/hooks/useMultiRoundCheckout'
import { getChainName } from '@/lib/helpers/chain'

interface MultiRoundCheckoutProps {
  rounds: DonationRound[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function MultiRoundCheckout({
  rounds,
  onSuccess,
  onCancel,
}: MultiRoundCheckoutProps) {
  const { state, checkoutAllRounds, reset, validateRounds } =
    useMultiRoundCheckout()

  const handleCheckout = async () => {
    const validation = validateRounds(rounds)

    if (!validation.valid) {
      alert(validation.errors.join('\n'))
      return
    }

    await checkoutAllRounds(rounds)

    if (state.status === 'completed' && state.failedRounds === 0) {
      onSuccess?.()
    }
  }

  const getRoundStatus = (roundId: number) => {
    return state.roundStatuses.get(roundId)
  }

  const getStatusIcon = (roundId: number) => {
    const roundStatus = getRoundStatus(roundId)
    if (!roundStatus) return null

    switch (roundStatus.status) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />
      case 'error':
        return <X className="w-5 h-5 text-red-600" />
      case 'preparing':
      case 'awaiting_approval':
      case 'processing':
      case 'confirming':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusText = (roundId: number) => {
    const roundStatus = getRoundStatus(roundId)
    if (!roundStatus) return 'Pending'

    switch (roundStatus.status) {
      case 'idle':
        return 'Pending'
      case 'preparing':
        return 'Preparing...'
      case 'awaiting_approval':
        return 'Approve in wallet'
      case 'processing':
        return 'Processing...'
      case 'confirming':
        return 'Confirming...'
      case 'success':
        return 'Success!'
      case 'error':
        return `Failed: ${roundStatus.error}`
      default:
        return 'Pending'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#ebecf2] p-6">
        <h2 className="text-xl font-semibold text-[#1f2333] mb-2">
          Multi-Round Checkout
        </h2>
        <p className="text-sm text-[#82899a]">
          {rounds.length} round{rounds.length > 1 ? 's' : ''} •{' '}
          {state.status === 'completed'
            ? `${state.completedRounds} completed, ${state.failedRounds} failed`
            : state.status === 'in_progress'
              ? `Processing round ${state.currentRoundIndex + 1} of ${state.totalRounds}`
              : 'Ready to checkout'}
        </p>
      </div>

      {/* Overall Status */}
      {state.overallError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-xs text-red-700 mt-1">{state.overallError}</p>
          </div>
        </div>
      )}

      {/* Rounds List */}
      <div className="space-y-3">
        {rounds.map((round, index) => {
          const roundStatus = getRoundStatus(round.roundId)
          const isActive = index === state.currentRoundIndex
          const isCompleted = roundStatus?.status === 'success'
          const isFailed = roundStatus?.status === 'error'

          return (
            <div
              key={round.roundId}
              className={`bg-white rounded-xl border p-4 transition-all ${
                isActive
                  ? 'border-[#5326ec] shadow-md'
                  : isCompleted
                    ? 'border-green-200'
                    : isFailed
                      ? 'border-red-200'
                      : 'border-[#ebecf2]'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(round.roundId)}
                </div>

                {/* Round Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-[#1f2333]">
                        {round.roundName}
                      </h3>
                      <p className="text-sm text-[#82899a] mt-1">
                        {round.projects.length} project
                        {round.projects.length > 1 ? 's' : ''} •{' '}
                        {round.totalAmount} {round.token} •{' '}
                        {getChainName(round.chainId)}
                      </p>
                    </div>

                    {/* Amount Badge */}
                    <div className="flex-shrink-0 px-3 py-1 bg-[#f7f7f9] rounded-lg">
                      <p className="text-sm font-medium text-[#1f2333]">
                        {round.totalAmount} {round.token}
                      </p>
                    </div>
                  </div>

                  {/* Status Text */}
                  <p
                    className={`text-xs mt-2 ${
                      isCompleted
                        ? 'text-green-600'
                        : isFailed
                          ? 'text-red-600'
                          : 'text-[#82899a]'
                    }`}
                  >
                    {getStatusText(round.roundId)}
                  </p>

                  {/* Transaction Hash */}
                  {roundStatus?.transactionHash && (
                    <a
                      href={`https://polygonscan.com/tx/${roundStatus.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#5326ec] hover:underline mt-1 inline-block"
                    >
                      View transaction →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {state.status === 'idle' || state.status === 'failed' ? (
          <>
            <Button
              onClick={handleCheckout}
              disabled={rounds.length === 0}
              className="flex-1 bg-[#e1458d] hover:bg-[#c93a7a] text-white font-medium py-6 rounded-full"
            >
              Checkout All Rounds
            </Button>
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                className="px-6 py-6 rounded-full"
              >
                Cancel
              </Button>
            )}
          </>
        ) : state.status === 'completed' ? (
          <>
            <Button
              onClick={onSuccess}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-6 rounded-full"
            >
              View Receipts
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              className="px-6 py-6 rounded-full"
            >
              Start New Checkout
            </Button>
          </>
        ) : (
          <div className="flex-1 py-6 px-4 bg-blue-50 border border-blue-200 rounded-full text-center">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {state.status === 'preparing'
                  ? 'Preparing transactions...'
                  : `Processing round ${state.currentRoundIndex + 1} of ${state.totalRounds}...`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      {state.status === 'idle' && (
        <div className="bg-[#f7f7f9] rounded-xl p-4">
          <p className="text-xs text-[#82899a]">
            <strong>Note:</strong> Each round will be executed as a separate
            transaction. You may need to approve transactions on different
            chains. All transactions are independent - if one fails, others will
            still complete.
          </p>
        </div>
      )}
    </div>
  )
}
