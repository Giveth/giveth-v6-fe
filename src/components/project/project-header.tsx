'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, ShoppingCart } from 'lucide-react'
import { CartDropdown } from '@/components/cart/cart-dropdown'

export function ProjectHeader() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-white border-b border-[#ebecf2] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 bg-[#1b1657] rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#"
              className="text-sm font-medium text-[#1f2333] hover:text-[#5326ec]"
            >
              Donate
            </Link>
            <button className="flex items-center gap-1 text-sm font-medium text-[#1f2333] hover:text-[#5326ec]">
              GIVeconomy
              <ChevronDown className="w-4 h-4" />
            </button>
            <Link
              href="#"
              className="text-sm font-medium text-[#1f2333] hover:text-[#5326ec]"
            >
              Community
            </Link>
            <button className="flex items-center gap-2 text-sm text-[#82899a] hover:text-[#5326ec]">
              Search projects
              <Search className="w-4 h-4" />
            </button>
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm font-medium text-[#5326ec] hover:text-[#8668fc]">
            <span className="text-lg">+</span>
            Create A Project
          </button>

          <div className="relative" ref={cartRef}>
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2 hover:bg-[#f7f7f9] rounded-lg"
            >
              <ShoppingCart className="w-5 h-5 text-[#1f2333]" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1f2333] text-white text-xs rounded-full flex items-center justify-center">
                5
              </span>
            </button>

            {isCartOpen && (
              <CartDropdown onClose={() => setIsCartOpen(false)} />
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-[#f7f7f9] rounded-full">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#5326ec] to-[#e1458d]" />
            <span className="text-sm font-medium text-[#1f2333]">
              0xF278...7a2cc
            </span>
            <span className="text-xs text-[#82899a]">Connected to xDai</span>
          </div>
        </div>
      </div>
    </header>
  )
}
