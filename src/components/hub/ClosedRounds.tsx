'use client'

import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { RoundCard } from '@/components/hub/RoundCard'
import { useArchivedQfRounds } from '@/hooks/useArchivedQfRounds'

export function ClosedRounds() {
  const {
    data: archivedRoundsData,
    isLoading,
    error,
  } = useArchivedQfRounds(0, 6)

  const rounds = archivedRoundsData?.archivedQfRounds?.rounds || []

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-bold text-giv-deep-900">Closed Rounds</h2>
        <Link
          href="https://giveth.io/qf-archive"
          className="inline-flex items-center gap-2 text-base font-bold text-giv-brand-500! hover:text-giv-brand-700! transition-colors"
        >
          Archived Rounds
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-giv-brand-500" />
        </div>
      )}
      {error && (
        <div className="text-center py-12 text-giv-neutral-700">
          Failed to load closed rounds. Please try again later.
        </div>
      )}
      {rounds.length === 0 && (
        <div className="text-center py-12 text-giv-neutral-700">
          No closed rounds available.
        </div>
      )}
      {rounds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rounds.slice(0, 3).map(round => (
            <RoundCard
              key={round.id}
              round={round}
              layout="vertical"
              isClosed={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
