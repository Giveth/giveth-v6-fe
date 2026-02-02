import clsx from 'clsx'
import { XCircle } from 'lucide-react'
import { IconHeartHand } from '@/components/icons/IconHeartHand'

export function PendingHero({
  overallError,
  overallStatus,
}: {
  overallError?: string
  overallStatus?: 'idle' | 'preparing' | 'in_progress' | 'completed' | 'failed'
}) {
  const shouldShowError = overallStatus === 'failed' && Boolean(overallError)

  return (
    <div className="text-center p-8 bg-white">
      {/* Heart Hands Icon */}
      <div className="flex justify-center mb-1">
        <div className="relative">
          <IconHeartHand
            fill={shouldShowError ? 'var(--giv-neutral-500)' : '#FF96C6'}
          />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-giv-neutral-900 mb-2">
        {shouldShowError ? 'Oh no!' : 'Donating'}
      </h1>

      {shouldShowError && (
        <div
          className={clsx(
            'mb-4 px-3 py-2 mx-auto w-fit rounded-xl border border-giv-neutral-400',
            'bg-giv-neutral-200 text-giv-error-400 text-sm font-medium',
            'flex items-center gap-2',
          )}
        >
          <XCircle className="w-4 h-4 text-giv-error-400" /> Donation failed
        </div>
      )}
    </div>
  )
}
