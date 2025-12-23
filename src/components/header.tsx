'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { DefaultHeader } from './header/DefaultHeader'
import { CustomConnectWallet } from './wallet/CustomConnectWallet'

export function Header() {
  const pathname = usePathname()
  const isCartPage = pathname.startsWith('/cart')

  // Cart page header variant
  if (isCartPage) {
    return (
      <header className="bg-white border-b border-[#ebecf2] px-6 py-4">
        <div className="max-w-[1442px] mx-auto flex items-center justify-between">
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
  return <DefaultHeader />
}
