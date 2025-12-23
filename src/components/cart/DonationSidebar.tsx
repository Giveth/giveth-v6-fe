'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AnonymousOption } from './AnonymousOption'
import { DonateToGiveth } from './DonateToGiveth'

export function DonationSidebar() {
  return (
    <div className="shrink-0 space-y-4 w-12/12 lg:w-4/12">
      {/* Credit Card Option */}
      <div className="bg-white p-5 rounded-2xl">
        <p className="text-base font-medium text-giv-gray-900 mb-3">
          New to crypto?
        </p>
        <button className="w-full px-4 py-3 rounded-lg border border-giv-primary-500 hover:border-giv-primary-900 text-giv-gray-800 text-sm font-medium hover:bg-giv-primary-05 transition-colors flex items-center justify-center gap-1 cursor-pointer">
          Donate with your credit card
          <span className="text-giv-primary-400">New*</span>
        </button>
      </div>

      {/* Donation Summary */}
      <div className="bg-white p-5 rounded-2xl">
        <h3 className="text-base font-medium text-giv-gray-900 mb-2 pb-2 border-b border-giv-gray-300">
          Donation Summary
        </h3>
        <div className="pt-2 space-y-4">
          {/* Summary Item 1 */}
          <div className="p-3 rounded-lg border border-giv-gray-300">
            <p className="text-base text-giv-gray-900 font-medium">
              0.00026 BTC <span className="font-normal">(~$70) to</span> 2
              projects <span className="font-normal">in</span>
            </p>
            <p className="text-base text-giv-gray-900 font-medium mt-0.5">
              Super duper round <span className="font-normal">on</span> Polygon
            </p>
          </div>

          {/* Summary Item 2 */}
          <div className="p-3 rounded-lg border border-giv-gray-300">
            <p className="text-base text-giv-gray-900 font-medium">
              1200 USDT
              <span className="font-normal">(~$ 1200.00) to</span> 2 projects{' '}
              <span className="font-normal">in</span>
            </p>
            <p className="text-base text-giv-gray-900 font-medium mt-0.5">
              The best round ever <span className="font-normal">on</span>
              Optimism
            </p>
          </div>
        </div>

        <DonateToGiveth />

        {/* Donate Button */}
        <Link
          href={{ pathname: '/cart/pending' }}
          className="w-full py-3 mt-5 bg-giv-pinky-500 text-white! rounded-3xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-giv-pinky-700 transition-colors cursor-pointer"
        >
          Donate now
          <ArrowRight className="w-5 h-5" />
        </Link>

        <AnonymousOption />
      </div>
    </div>
  )
}
