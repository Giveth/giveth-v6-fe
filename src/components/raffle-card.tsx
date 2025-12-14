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
    <div className="bg-white rounded-xl border border-[#ebecf2] p-8">
      <div className="flex items-center justify-between">
        {/* Left - Round Info */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5326ec] to-[#8668fc] flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <span className="text-2xl">🎁</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[#1f2333] font-medium">🎁</span>
              <h3 className="font-bold text-[#1f2333]">GIVbacks Round 89</h3>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-[#5326ec] to-[#8668fc] bg-clip-text text-transparent">
              2,800,000 GIV
            </div>
            <p className="text-xs text-[#82899a]">Prize pool</p>
          </div>
        </div>

        {/* Center - Countdown */}
        <div className="space-y-2">
          <p className="text-xs text-[#82899a] font-medium">Ends in</p>
          <div className="text-xl font-bold text-[#1f2333]">
            {timeLeft.days} days, {timeLeft.hours} hours, {timeLeft.minutes}{' '}
            minutes
          </div>
          <div className="space-y-1">
            <p className="text-xs text-[#82899a]">Started</p>
            <p className="text-sm font-medium text-[#1f2333]">
              Tue 25 Feb 2025
            </p>
          </div>
        </div>

        {/* Right - Action */}
        <div className="space-y-3">
          <div className="text-right space-y-1">
            <p className="text-xs text-[#82899a]">Your tickets</p>
            <div className="flex items-center gap-2 justify-end">
              <Ticket className="w-4 h-4 text-[#5326ec]" />
              <span className="text-2xl font-bold text-[#1f2333]">197</span>
            </div>
          </div>

          <Button className="bg-[#5326ec] hover:bg-[#6c00f6] text-white gap-2 w-full">
            Donate Now
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-xs text-[#82899a] text-center">
            Earn more raffle by donating
          </p>
        </div>
      </div>

      {/* Archived Rounds Link */}
      <div className="mt-6 pt-6 border-t border-[#ebecf2] text-right">
        <button className="text-sm font-medium text-[#5326ec] hover:underline inline-flex items-center gap-1">
          Archived Rounds
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
