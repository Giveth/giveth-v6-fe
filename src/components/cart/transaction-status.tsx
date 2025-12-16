/**
 * Transaction Status Component
 *
 * Displays the status of a donation transaction with visual feedback
 * for different states (pending, confirming, success, error)
 */

import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react'
import type { DonationStatus } from '@/hooks/useDonation'

interface TransactionStatusProps {
  status: DonationStatus
  transactionHash?: string
  bundleId?: string
  error?: string
  chainId?: number
  supportsEIP5792?: boolean
  supportsEIP7702?: boolean
}

export function TransactionStatus({
  status,
  transactionHash,
  bundleId,
  error,
  chainId = 137,
  supportsEIP5792 = false,
  supportsEIP7702 = false,
}: TransactionStatusProps) {
  const getExplorerUrl = (hash: string) => {
    // Map chain IDs to explorer URLs
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io',
      10: 'https://optimistic.etherscan.io',
      137: 'https://polygonscan.com',
      8453: 'https://basescan.org',
      42161: 'https://arbiscan.io',
    }

    const explorerUrl = explorers[chainId] || 'https://polygonscan.com'
    return `${explorerUrl}/tx/${hash}`
  }

  const renderStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'preparing':
      case 'awaiting_approval':
      case 'processing':
      case 'confirming':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'preparing':
        return 'Preparing transaction...'
      case 'awaiting_approval':
        return supportsEIP5792
          ? 'Please approve the batch transaction in your wallet'
          : 'Please approve in your wallet'
      case 'processing':
        return 'Processing donation...'
      case 'confirming':
        return 'Confirming transaction on blockchain...'
      case 'success':
        return 'Donation successful! 🎉'
      case 'error':
        return error || 'Transaction failed'
      default:
        return 'Ready to donate'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700'
      case 'preparing':
      case 'awaiting_approval':
      case 'processing':
      case 'confirming':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  if (status === 'idle') return null

  return (
    <div className="space-y-3">
      {/* Status Card */}
      <div
        className={`rounded-xl border p-4 transition-all ${getStatusColor()}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{renderStatusIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium mb-1">{getStatusText()}</p>

            {/* EIP Support Info */}
            {status === 'awaiting_approval' &&
              (supportsEIP5792 || supportsEIP7702) && (
                <p className="text-xs opacity-75 mb-2">
                  {supportsEIP5792 && supportsEIP7702
                    ? '✨ Using EIP-7702 & EIP-5792: Token approval and donation in one transaction'
                    : supportsEIP5792
                      ? '✨ Using EIP-5792: Batch transaction enabled'
                      : '✨ Using EIP-7702: Enhanced features enabled'}
                </p>
              )}

            {/* Bundle ID (EIP-5792) */}
            {bundleId && (
              <div className="text-xs opacity-75">
                <p className="font-mono break-all">Bundle: {bundleId}</p>
              </div>
            )}

            {/* Transaction Hash */}
            {transactionHash && (
              <a
                href={getExplorerUrl(transactionHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium hover:underline inline-flex items-center gap-1 mt-2"
              >
                View on explorer →
              </a>
            )}

            {/* Error Details */}
            {status === 'error' && error && (
              <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                <p className="font-mono text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Steps (for processing states) */}
        {(status === 'preparing' ||
          status === 'awaiting_approval' ||
          status === 'processing' ||
          status === 'confirming') && (
          <div className="mt-3 pt-3 border-t border-current/10">
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full ${
                  status === 'preparing'
                    ? 'bg-current animate-pulse'
                    : 'bg-current/30'
                }`}
              />
              <span className={status === 'preparing' ? 'font-medium' : ''}>
                Preparing
              </span>

              <div className="flex-1 h-px bg-current/20" />

              <div
                className={`w-2 h-2 rounded-full ${
                  status === 'awaiting_approval'
                    ? 'bg-current animate-pulse'
                    : status === 'processing' || status === 'confirming'
                      ? 'bg-current/30'
                      : 'bg-current/10'
                }`}
              />
              <span
                className={status === 'awaiting_approval' ? 'font-medium' : ''}
              >
                Approval
              </span>

              <div className="flex-1 h-px bg-current/20" />

              <div
                className={`w-2 h-2 rounded-full ${
                  status === 'processing'
                    ? 'bg-current animate-pulse'
                    : status === 'confirming'
                      ? 'bg-current/30'
                      : 'bg-current/10'
                }`}
              />
              <span className={status === 'processing' ? 'font-medium' : ''}>
                Processing
              </span>

              <div className="flex-1 h-px bg-current/20" />

              <div
                className={`w-2 h-2 rounded-full ${
                  status === 'confirming'
                    ? 'bg-current animate-pulse'
                    : 'bg-current/10'
                }`}
              />
              <span className={status === 'confirming' ? 'font-medium' : ''}>
                Confirming
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
