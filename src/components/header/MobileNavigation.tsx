import { useEffect, useState } from 'react'
import { MenuIcon, X } from 'lucide-react'
import { CreateProjectButton } from '@/components/header/CreateProjectButton'
import { menuItems } from '@/constants/menu-links'
import { MenuLink } from './MenuLink'
import { SearchButton } from './SearchButton'

export function MobileNavigation({ hideSearch }: { hideSearch?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isMenuOpen])

  return (
    <>
      {/* Open button */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="md:hidden flex items-center gap-2 p-3 rounded-lg text-base font-medium text-giv-gray-900 hover:bg-giv-primary-50 transition"
      >
        <MenuIcon className="h-6 w-6" />
        Menu
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${
          isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Sliding nav */}
      <nav
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white
        transform transition-transform duration-300 ease-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-semibold">Menu</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-lg hover:bg-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
          {menuItems.map(
            (item: {
              label: string
              href: string
              submenu?: { label: string; href: string }[]
            }) => (
              <MenuLink
                key={item.label}
                href={item.href}
                label={item.label}
                submenu={item.submenu}
              />
            ),
          )}

          <div className="flex flex-col gap-4 mt-4">
            {!hideSearch && <SearchButton />}
            <div className="mt-2 ml-2 flex justify-center">
              <CreateProjectButton />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
