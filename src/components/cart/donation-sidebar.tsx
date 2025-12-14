'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export function DonationSidebar() {
  const [isAnonymous, setIsAnonymous] = useState(false)

  return (
    <div className="w-80 flex-shrink-0 space-y-4">
      {/* Credit Card Option */}
      <div className="bg-white rounded-xl border border-[#ebecf2] p-5">
        <p className="text-sm text-[#4f576a] mb-3">New to crypto?</p>
        <button className="w-full px-4 py-3 rounded-lg border border-[#5326ec] text-[#5326ec] text-sm font-medium hover:bg-[#f6f3ff] transition-colors flex items-center justify-center gap-1">
          Donate with your credit card
          <span className="text-[#e1458d] font-semibold">New*</span>
        </button>
      </div>

      {/* Donation Summary */}
      <div className="bg-white rounded-xl border border-[#ebecf2] p-5">
        <h3 className="text-base font-semibold text-[#1f2333] mb-4">
          Donation Summary
        </h3>
        <div className="border-t border-[#ebecf2] pt-4 space-y-4">
          {/* Summary Item 1 */}
          <div className="p-3 bg-[#f7f7f9] rounded-lg">
            <p className="text-sm text-[#1f2333]">
              <span className="font-semibold">0.00026 BTC</span>{' '}
              <span className="text-[#82899a]">(~$70)</span> to{' '}
              <span className="font-semibold">2 projects</span> in
            </p>
            <p className="text-sm text-[#1f2333] mt-0.5">
              <span className="font-medium">Super duper round</span> on{' '}
              <span className="font-semibold">Polygon</span>
            </p>
          </div>

          {/* Summary Item 2 */}
          <div className="p-3 bg-[#f7f7f9] rounded-lg">
            <p className="text-sm text-[#1f2333]">
              <span className="font-semibold">1200 USDT</span>{' '}
              <span className="text-[#82899a]">(~$ 1200.00)</span> to{' '}
              <span className="font-semibold">2 projects</span> in
            </p>
            <p className="text-sm text-[#1f2333] mt-0.5">
              <span className="font-medium">The best round ever</span> on{' '}
              <span className="font-semibold">Optimism</span>
            </p>
          </div>
        </div>

        {/* Donate Button */}
        <Button className="w-full mt-5 bg-[#e1458d] hover:bg-[#c93a7a] text-white font-medium py-6 rounded-full flex items-center justify-center gap-2">
          Donate Now
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Anonymous Option */}
      <div className="bg-white rounded-xl border border-[#ebecf2] p-5">
        <div className="flex items-start gap-3">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={checked => setIsAnonymous(checked as boolean)}
            className="mt-0.5"
          />
          <div>
            <label
              htmlFor="anonymous"
              className="text-sm font-medium text-[#1f2333] cursor-pointer"
            >
              Make my donation anonymous
            </label>
            <p className="text-xs text-[#82899a] mt-1 leading-relaxed">
              By checking this, we won't consider your profile information as a
              donor for this donation and won't show it on public pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
