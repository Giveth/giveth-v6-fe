import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { type Route } from 'next'
import { HeaderConnectWallet } from '@/components/header/HeaderConnectWallet'

export const CartHeader = () => {
  const pathname = usePathname()
  // Return link
  let returnLink = pathname.startsWith('/cart/pending') ? '/cart' : '/qf'
  returnLink = pathname.startsWith('/cart/success') ? '/qf' : returnLink

  // Retunr Title based on the pathname
  let title = pathname.startsWith('/cart')
    ? 'Back to Projects'
    : 'Donation Cart'

  title = pathname.startsWith('/cart/success') ? 'Back to Projects' : title
  title = pathname.startsWith('/cart/pending') ? 'Donation Cart' : title

  return (
    <header className="bg-white border-b border-giv-neutral-300 px-4 sm:px-6 py-4">
      <div className="max-w-[1442px] mx-auto flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link
            href={returnLink as Route}
            className="w-16 h-16 rounded-full flex items-center justify-center hover:bg-giv-neutral-200 shadow-[0px_3px_20px_rgba(212,218,238,0.7)] transition-colors"
          >
            <ArrowLeft className="w-8 h-8 text-giv-neutral-900" />
          </Link>
          <h1 className="text-base font-medium text-giv-neutral-900">
            {title}
          </h1>
        </div>

        {/* Right Section - Wallet */}
        <HeaderConnectWallet />
      </div>
    </header>
  )
}
