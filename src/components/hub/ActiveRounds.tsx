'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { type Route } from 'next'
import { RoundCard } from '@/components/hub/RoundCard'
import { useActiveQfRounds } from '@/hooks/useActiveQfRounds'
import { QFArchiveLink } from '@/lib/constants/menu-links'

export function ActiveRounds() {
  const { data: activeRoundsData, isLoading, error } = useActiveQfRounds()
  const router = useRouter()
  const rounds = activeRoundsData?.activeQfRounds || []

  useEffect(() => {
    if (!activeRoundsData) return

    if (rounds.length === 1) {
      router.push(`/qf/${rounds[0].slug}`)
    } else if (rounds.length === 0) {
      router.push(QFArchiveLink.href as unknown as Route)
    }
  }, [rounds, activeRoundsData])

  return (
    <div className="font-inter space-y-8">
      <h2 className="text-2xl font-bold text-giv-deep-900">Active Rounds</h2>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rounds.map(round => (
            <RoundCard
              key={round.id}
              round={round}
              layout={
                round.displaySize === 'STANDARD' ? 'vertical' : 'horizontal'
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
