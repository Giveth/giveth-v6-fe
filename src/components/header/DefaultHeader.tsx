import Link from 'next/link'
import { CartButton } from '@/components/header/CartButton'
import { CreateProjectButton } from '@/components/header/CreateProjectButton'
import { DesktopNavigation } from '@/components/header/DesktopNavigation'
import { HeaderConnectWallet } from '@/components/header/HeaderConnectWallet'
import { MobileNavigation } from '@/components/header/MobileNavigation'
import { GivethLogo } from '@/components/icons/GivethLogo'
import { LogoLink } from '@/lib/constants/menu-links'
import type { Route } from 'next'

export function DefaultHeader({ hideSearch }: { hideSearch?: boolean }) {
  const isExternalLogoLink = /^https?:\/\//.test(LogoLink)

  return (
    <header className="bg-white border-b border-giv-neutral-300 px-6 py-4">
      <div className="relative max-w-[1442px] mx-auto flex flex-wrap lg:flex-nowrap items-center justify-between">
        {/* Logo and Nav */}
        <div className="flex items-center gap-1 lg:gap-8">
          {isExternalLogoLink ? (
            <a
              href={LogoLink}
              className="flex items-center"
              rel="noopener noreferrer"
            >
              <GivethLogo width={66} height={66} />
            </a>
          ) : (
            <Link href={LogoLink as Route} className="flex items-center">
              <GivethLogo width={66} height={66} />
            </Link>
          )}

          {/* Desktop Menu */}
          <DesktopNavigation hideSearch={hideSearch} />

          {/* Mobile Menu */}
          <MobileNavigation hideSearch={hideSearch} />
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block pe-1">
            <CreateProjectButton />
          </div>

          {/* Cart */}
          <CartButton />

          {/* Wallet */}
          <HeaderConnectWallet />
        </div>
      </div>
    </header>
  )
}
