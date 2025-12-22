'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function CartHeader() {
  return (
    <header className="bg-white border-b px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link
            href="/qf"
            className="w-16 h-16 rounded-full border border-giv-gray-30 flex items-center justify-center hover:bg-giv-gray-200 shadow-[0px_3px_20px_rgba(212,218,238,0.7)] transition-colors"
          >
            <ArrowLeft className="w-8 h-8 text-giv-gray-900" />
          </Link>
          <h1 className="text-lg font-semibold text-[#1f2333]">
            Donation cartAAA
          </h1>
        </div>

        {/* Right Section - Wallet */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
          <div className="text-right">
            <p className="text-sm font-medium text-[#1f2333]">0xF278...7a2cc</p>
            <p className="text-xs text-[#37b4a9]">Connected to xDai</p>
          </div>
        </div>
      </div>
    </header>
  )
}
