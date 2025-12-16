import Link from 'next/link'
import { CartButton } from '@/components/header/CartButton'
import { CreateProjectButton } from '@/components/header/CreateProjectButton'
import { MenuLink } from '@/components/header/MenuLink'
import { SearchButton } from '@/components/header/SearchButton'
import { GivethLogo } from '@/components/icons/GivethLogo'
import { CustomConnectWallet } from '@/components/wallet/CustomConnectWallet'

const menuItems = [
  {
    label: 'Donate',
    href: '/qf',
  },
  {
    label: 'GIVeconomy',
    href: '/qf',
    submenu: [
      {
        label: 'Stake GIV',
        href: '/qf',
      },
      {
        label: 'GIVbacks',
        href: '/qf',
      },
    ],
  },
  {
    label: 'Community',
    href: '/qf',
    submenu: [
      {
        label: 'Get Started',
        href: '/qf',
      },
      {
        label: 'Givers NFT',
        href: '/qf',
      },
      {
        label: 'About Us',
        href: '/qf',
      },
      {
        label: 'Vote',
        href: '/qf',
      },
      {
        label: 'Join Us',
        href: '/qf',
      },
      {
        label: 'Leave Feedback',
        href: '/qf',
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

          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map(item => (
              <MenuLink
                key={item.label}
                href={item.href}
                label={item.label}
                submenu={item.submenu}
              />
            ))}

            <SearchButton />
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <div className="pe-5">
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
