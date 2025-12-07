'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { BellIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { SiweAuthButton } from '@/components/auth/SiweAuthButton'
import { CartModal } from '@/components/cart/CartModal'
import { GivethLogo } from '@/components/icons/GivethLogo'
import { useCart } from '@/context/CartContext'

export function Header() {
  const { cartItems } = useCart()
  const [isCartModalOpen, setIsCartModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize search value from URL params on mount
  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    if (searchFromUrl) {
      setSearchValue(searchFromUrl)
    }
  }, [searchParams])

  const handleSearch = useCallback(() => {
    if (searchValue.trim().length >= 2) {
      const params = new URLSearchParams()
      params.set('search', searchValue.trim())
      params.set('sort', 'relevance')
      router.push(`/?${params.toString()}`)
    }
  }, [searchValue, router])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch],
  )

  return (
    <>
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between bg-white px-4 shadow-sm sm:px-6 lg:px-8">
        {/* Left: Logo and Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <GivethLogo width={40} height={40} />
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
              Donate
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L5 5L9 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900">
              GIVeconomy
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L5 5L9 1"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <Link
              href="#"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Community
            </Link>
          </nav>
        </div>

        {/* Center: Search */}
        <div className="hidden max-w-md flex-1 px-8 lg:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-full bg-gray-100 py-2.5 pl-5 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#fd67ac]/20"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {}
          <Link
            href="/create/project"
            className="hidden text-sm font-bold text-[#d81a72] hover:text-[#b0155c] sm:block"
          >
            Create A Project
          </Link>

          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100">
            <BellIcon className="h-5 w-5 text-[#d81a72]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#d81a72] ring-2 ring-white" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#fd67ac] text-[10px] font-bold text-white">
              12
            </span>
          </button>

          <button
            onClick={() => setIsCartModalOpen(true)}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 3H5L5.4 5M5.4 5H21L17 13H7M5.4 5L7 13M7 13L4.70711 15.2929C4.07714 15.9229 4.52331 17 5.41421 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 19C9 20.1046 8.10457 21 7 21C5.89543 21 5 20.1046 5 19C5 17.8954 5.89543 17 7 17C8.10457 17 9 17.8954 9 19Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-bold text-gray-900">{cartItems.length}</span>
          </button>

          <SiweAuthButton />
        </div>
      </header>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
      />
    </>
  )
}
