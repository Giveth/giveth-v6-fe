'use client'

import { redirect } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { RoundCard } from '@/components/hub/RoundCard'
import { useActiveQfRounds } from '@/hooks/useActiveQfRounds'

export function ActiveRounds() {
  const { data: activeRoundsData, isLoading, error } = useActiveQfRounds()

  const rounds = activeRoundsData?.activeQfRounds || []

  // If it is onlu one active round redirect to it
  if (rounds.length === 1) {
    redirect(`/qf/${rounds[0].slug}`)
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold font-adventor text-giv-deep-900">
        Active Rounds
      </h2>
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-giv-primary-500" />
        </div>
      )}
      {error && (
        <div className="text-center py-12 text-giv-gray-700">
          Failed to load active rounds. Please try again later. {error.message}
        </div>
      )}
      {rounds.length === 0 && (
        <div className="text-center py-12 text-giv-gray-700">
          No active rounds at the moment.
        </div>
      )}
      {rounds.length > 0 && (
        <div className="space-y-6">
          {rounds.map(round => (
            <RoundCard key={round.id} round={round} />
          ))}
        </div>
      )}
    </div>
  )
}
