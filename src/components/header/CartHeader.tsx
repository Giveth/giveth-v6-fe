import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { HeaderConnectWallet } from './HeaderConnectWallet'

export const CartHeader = () => {
  const pathname = usePathname()
  // Return link
  const returnLink = pathname.startsWith('/cart/pending') ? '/cart' : '/qf'

  return (
    <header className="bg-white border-b border-giv-gray-300 px-6 py-4">
      <div className="max-w-[1442px] mx-auto flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link
            href={returnLink}
            className="w-16 h-16 rounded-full flex items-center justify-center hover:bg-giv-gray-200 shadow-[0px_3px_20px_rgba(212,218,238,0.7)] transition-colors"
          >
            <ArrowLeft className="w-8 h-8 text-giv-gray-900" />
          </Link>
          <h1 className="text-base font-medium text-giv-gray-900">
            Donation cart
          </h1>
        </div>

        {/* Right Section - Wallet */}
        <HeaderConnectWallet />
      </div>
    </header>
  )
}
