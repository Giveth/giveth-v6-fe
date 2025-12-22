import Link from 'next/link'
import { CartButton } from '@/components/header/CartButton'
import { CreateProjectButton } from '@/components/header/CreateProjectButton'
import { GivethLogo } from '@/components/icons/GivethLogo'
import { CustomConnectWallet } from '@/components/wallet/CustomConnectWallet'
import { DesktopNavigation } from './DesktopNavigation'
import { MobileNavigation } from './MobileNavigation'

export const menuItems = [
  {
    label: 'Donate',
    href: '/qf',
  },
  {
    label: 'GIVeconomy',
    href: 'https://giveth.io/givfarm',
    submenu: [
      {
        label: 'Stake GIV',
        href: 'https://giveth.io/givfarm',
      },
      {
        label: 'GIVbacks',
        href: 'https://giveth.io/givbacks',
      },
    ],
  },
  {
    label: 'Community',
    href: 'https://giveth.io/onboarding',
    submenu: [
      {
        label: 'Get Started',
        href: 'https://giveth.io/onboarding',
      },
      {
        label: 'Givers NFT',
        href: 'https://giveth.io/nft',
      },
      {
        label: 'About Us',
        href: 'https://giveth.io/about',
      },
      {
        label: 'Vote',
        href: 'https://snapshot.org/#/giv.eth',
      },
      {
        label: 'Join Us',
        href: 'https://giveth.io/join',
      },
      {
        label: 'Leave Feedback',
        href: 'https://giveth.typeform.com/feedback',
      },
    ],
  },
]

export function DefaultHeader() {
  return (
    <header className="bg-white border-b border-giv-gray-300 px-6 py-4">
      <div className="max-w-[1442px] mx-auto flex items-center justify-between">
        {/* Logo and Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <GivethLogo width={66} height={66} />
          </Link>

          {/* Desktop Menu */}
          <DesktopNavigation />

          {/* Mobile Menu */}
          <MobileNavigation />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block pe-5">
            <CreateProjectButton />
          </div>

          {/* Cart */}
          <CartButton />

          {/* Wallet */}
          <CustomConnectWallet />
        </div>
      </div>
    </header>
  )
}
