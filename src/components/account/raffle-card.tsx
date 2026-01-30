'use client'

import { useState } from 'react'
import { ArrowRight, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RaffleCard() {
  const [timeLeft] = useState({
    days: 5,
    hours: 11,
    minutes: 47,
  })

  return (
    <div className="bg-white rounded-xl border border-giv-neutral-300 p-8">
      <div className="flex items-center justify-between">
        {/* Left - Round Info */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-linear-to-br from-giv-brand-500 to-giv-brand-300 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <span className="text-2xl">🎁</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-giv-deep-blue-800 font-medium">🎁</span>
              <h3 className="font-bold text-giv-deep-blue-800">
                GIVbacks Round 89
              </h3>
            </div>
            <div className="text-3xl font-bold bg-linear-to-r from-giv-brand-500 to-giv-brand-300 bg-clip-text text-transparent">
              2,800,000 GIV
            </div>
            <p className="text-xs text-giv-neutral-700">Prize pool</p>
          </div>
        </div>

        {/* Center - Countdown */}
        <div className="space-y-2">
          <p className="text-xs text-giv-neutral-700 font-medium">Ends in</p>
          <div className="text-xl font-bold text-giv-deep-blue-800">
            {timeLeft.days} days, {timeLeft.hours} hours, {timeLeft.minutes}{' '}
            minutes
          </div>
          <div className="space-y-1">
            <p className="text-xs text-giv-neutral-700">Started</p>
            <p className="text-sm font-medium text-giv-deep-blue-800">
              Tue 25 Feb 2025
            </p>
          </div>
        </div>

        {/* Right - Action */}
        <div className="space-y-3">
          <div className="text-right space-y-1">
            <p className="text-xs text-giv-neutral-700">Your tickets</p>
            <div className="flex items-center gap-2 justify-end">
              <Ticket className="w-4 h-4 text-giv-brand-500" />
              <span className="text-2xl font-bold text-giv-deep-blue-800">
                197
              </span>
            </div>
          </div>

          <Button className="bg-giv-brand-500 hover:bg-giv-brand-400 text-white gap-2 w-full">
            Donate Now
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-xs text-giv-neutral-700 text-center">
            Earn more raffle by donating
          </p>
        </div>
      </div>

      {/* Archived Rounds Link */}
      <div className="mt-6 pt-6 border-t border-giv-neutral-300 text-right">
        <button className="text-sm font-medium text-giv-brand-500 hover:underline inline-flex items-center gap-1">
          Archived Rounds
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
