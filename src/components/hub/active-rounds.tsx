'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useActiveQfRounds } from '@/hooks/useActiveQfRounds'
import type { ActiveQfRoundsQuery } from '@/lib/graphql/generated/graphql'
import type { Route } from 'next'

export function ActiveRounds() {
  const { data: activeRoundsData, isLoading, error } = useActiveQfRounds()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-[#1f2333]">Active Rounds</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#5326ec]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-[#1f2333]">Active Rounds</h2>
        <div className="text-center py-12 text-[#82899a]">
          Failed to load active rounds. Please try again later.
        </div>
      </div>
    )
  }

  const rounds = activeRoundsData?.activeQfRounds || []

  if (rounds.length === 0) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-[#1f2333]">Active Rounds</h2>
        <div className="text-center py-12 text-[#82899a]">
          No active rounds at the moment.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-[#1f2333]">Active Rounds</h2>

      {/* Featured Rounds */}
      <div className="space-y-6">
        {rounds
          .slice(0, 2)
          .map(
            (
              round: ActiveQfRoundsQuery['activeQfRounds'][0],
              index: number,
            ) => (
              <div
                key={round.id}
                className="bg-white rounded-2xl border border-[#ebecf2] overflow-hidden flex flex-col md:flex-row"
              >
                <div className="md:w-80 h-48 md:h-auto relative flex-shrink-0">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      index === 0
                        ? 'from-[#f5a623] to-[#f7931e]'
                        : 'from-[#5326ec] to-[#8668fc]'
                    }`}
                  />
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <div>
                      <p className="text-white/70 text-xs mb-1">
                        Quadratic Funding
                      </p>
                      <h3 className="text-white font-bold text-lg leading-tight">
                        {round.name}
                      </h3>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-2">
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
                </div>

                <div className="flex-1 p-6">
                  <h3 className="text-xl font-bold text-[#1f2333] mb-3">
                    {round.name}
                  </h3>
                  <p className="text-sm text-[#82899a] leading-relaxed mb-6">
                    Support projects through quadratic funding. Your donation
                    helps scale impactful initiatives with matching funds.
                  </p>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="px-4 py-2 bg-[#f7f7f9] rounded-full">
                      <span className="font-bold text-[#1f2333]">$50,000</span>
                      <span className="text-sm text-[#82899a] ml-1">
                        Matching Pool
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1f2333]">
                      {format(new Date(round.beginDate), 'MMM d')} -{' '}
                      {format(new Date(round.endDate), 'MMM d, yyyy')}
                    </span>
                    <Link
                      href={`/qf/${round.slug}` as Route}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#5326ec] !text-white text-sm font-medium rounded-full hover:bg-[#6945e3] transition-colors"
                    >
                      Explore Projects
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ),
          )}
      </div>

      {/* Round Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rounds
          .slice(2)
          .map((round: ActiveQfRoundsQuery['activeQfRounds'][0]) => (
            <RoundCard key={round.id} round={round} />
          ))}
      </div>
    </div>
  )
}

function RoundCard({
  round,
}: {
  round: ActiveQfRoundsQuery['activeQfRounds'][0]
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
          Support projects through quadratic funding and help scale impactful
          initiatives.
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
          Explore Projects
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
