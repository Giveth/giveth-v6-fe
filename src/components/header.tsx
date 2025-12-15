'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Search,
  ShoppingCart,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { CartDropdown } from './cart/cart-dropdown'
import { GivethLogo } from './icons/GivethLogo'
import { CustomConnectWallet } from './wallet/CustomConnectWallet'

export function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartRef = useRef<HTMLDivElement>(null)
  const { cartItems } = useCart()
  const pathname = usePathname()
  const isCartPage = pathname === '/cart'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cart page header variant
  if (isCartPage) {
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
          <CustomConnectWallet />
        </div>
      </header>
    )
  }

  // Default header variant
  return (
    <header className="bg-white border-b border-[#ebecf2] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <GivethLogo width={32} height={32} />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <button className="flex items-center gap-1 text-sm font-medium text-[#1f2333] hover:text-[#5326ec]">
              Donate
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1 text-sm font-medium text-[#1f2333] hover:text-[#5326ec]">
              GIVeconomy
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1 text-sm font-medium text-[#1f2333] hover:text-[#5326ec]">
              Community
              <ChevronDown className="w-4 h-4" />
            </button>
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

          {/* Notification Bell */}
          <button className="relative p-2 hover:bg-[#f7f7f9] rounded-lg">
            <Bell className="w-5 h-5 text-[#1f2333]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#e1458d] rounded-full" />
          </button>

          {/* Cart */}
          <div className="relative" ref={cartRef}>
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative p-2 hover:bg-[#f7f7f9] rounded-lg"
            >
              <ShoppingCart className="w-5 h-5 text-[#1f2333]" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1f2333] text-white text-xs rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>

            {isCartOpen && (
              <CartDropdown onClose={() => setIsCartOpen(false)} />
            )}
          </div>

          {/* GIV Balance */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#f7f7f9] rounded-full">
            <div className="w-5 h-5 rounded-full bg-[#5326ec] flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <span className="text-sm font-medium text-[#1f2333]">
              1,314,995
            </span>
          </div>

          {/* Wallet */}
          <CustomConnectWallet />
        </div>
      </div>
    </header>
  )
}
