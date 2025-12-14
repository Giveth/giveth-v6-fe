'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function CartHeader() {
  return (
    <header className="bg-white border-b border-[#ebecf2] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 rounded-full border border-[#ebecf2] flex items-center justify-center hover:bg-[#f7f7f9] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#4f576a]" />
          </Link>
          <h1 className="text-lg font-semibold text-[#1f2333]">
            Donation cart
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
