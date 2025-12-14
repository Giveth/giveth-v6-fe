'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useArchivedQfRounds } from '@/hooks/useArchivedQfRounds'
import type { ArchivedQfRoundsQuery } from '@/lib/graphql/generated/graphql'
import type { Route } from 'next'

export function ClosedRounds() {
  const {
    data: archivedRoundsData,
    isLoading,
    error,
  } = useArchivedQfRounds(0, 6)

  if (isLoading) {
    return (
      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1f2333]">Closed Rounds</h2>
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5326ec] hover:text-[#6945e3] transition-colors"
          >
            Archived Rounds
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#5326ec]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1f2333]">Closed Rounds</h2>
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5326ec] hover:text-[#6945e3] transition-colors"
          >
            Archived Rounds
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="text-center py-12 text-[#82899a]">
          Failed to load closed rounds. Please try again later.
        </div>
      </div>
    )
  }

  const rounds = archivedRoundsData?.archivedQfRounds?.rounds || []

  if (rounds.length === 0) {
    return (
      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1f2333]">Closed Rounds</h2>
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5326ec] hover:text-[#6945e3] transition-colors"
          >
            Archived Rounds
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="text-center py-12 text-[#82899a]">
          No closed rounds available.
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1f2333]">Closed Rounds</h2>
        <Link
          href="#"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5326ec] hover:text-[#6945e3] transition-colors"
        >
          Archived Rounds
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Closed Round Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rounds
          .slice(0, 3)
          .map(
            (round: ArchivedQfRoundsQuery['archivedQfRounds']['rounds'][0]) => (
              <ClosedRoundCard key={round.id} round={round} />
            ),
          )}
      </div>
    </div>
  )
}

function ClosedRoundCard({
  round,
}: {
  round: ArchivedQfRoundsQuery['archivedQfRounds']['rounds'][0]
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#ebecf2] overflow-hidden">
      <div className="h-32 relative bg-gradient-to-br from-[#f5a623] to-[#ffcc4e]">
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          <div className="flex justify-end gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          </div>
          <div>
            <div className="inline-block px-2 py-1 bg-[#e1458d] text-white text-xs font-medium rounded mb-1">
              {round.name}
            </div>
            <h3 className="text-white font-bold text-sm">Public Goods Round</h3>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-[#1f2333] mb-2">{round.name}</h3>
        <p className="text-xs text-[#82899a] leading-relaxed mb-4">
          This round has ended. Check out the projects that participated and
          their impact.
        </p>

        <p className="text-sm font-medium text-[#1f2333] mb-2">
          {format(new Date(round.beginDate), 'MMM d')} -{' '}
          {format(new Date(round.endDate), 'MMM d, yyyy')}
        </p>

        <p className="text-sm mb-4">
          <span className="font-bold text-[#1f2333]">$50,000</span>
          <span className="text-[#82899a] ml-1">Matching Pool</span>
        </p>

        <Link
          href={`/qf/${round.slug}` as Route}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f2333] !text-white text-sm font-medium rounded-full hover:bg-[#333] transition-colors"
        >
          View Results
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
