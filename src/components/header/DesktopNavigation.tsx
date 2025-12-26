import { menuItems } from './DefaultHeader'
import { MenuLink } from './MenuLink'
import { SearchButton } from './SearchButton'

export function DesktopNavigation({ hideSearch }: { hideSearch?: boolean }) {
  return (
    <nav className="hidden md:flex items-center gap-6">
      {menuItems.map(item => (
        <MenuLink
          key={item.label}
          href={item.href}
          label={item.label}
          submenu={item.submenu}
        />
      ))}

      {!hideSearch && <SearchButton />}
    </nav>
  )
}
