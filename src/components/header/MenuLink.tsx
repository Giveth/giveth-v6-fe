import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { z } from 'zod'

export const submenuItemSchema = z.object({
  label: z.string(),
  href: z.string(),
})

export const menuLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  submenu: z.array(submenuItemSchema).optional(),
})

type MenuLinkProps = z.infer<typeof menuLinkSchema>

export function MenuLink({ label, href, submenu }: MenuLinkProps) {
  const [menuOpen, setMenuOpen] = useState(false) // dropdown menu open state

  if (submenu) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <Link
          href={{ pathname: href }}
          className="flex items-center gap-1 text-base font-medium text-giv-gray-900 hover:text-giv-primary-500 p-3 hover:bg-giv-primary-50 rounded-lg transition-colors"
        >
          {label}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              menuOpen ? 'rotate-180' : ''
            }`}
          />
        </Link>
        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 w-48 bg-white rounded-lg shadow-lg p-4 z-50 animate-slide-in">
            {submenu.map(item => (
              <Link
                key={item.label}
                href={{ pathname: item.href }}
                className="flex items-center gap-1 text-sm font-medium text-giv-gray-900 hover:text-giv-primary-500 px-4 py-3 mb-2 hover:bg-giv-primary-50 rounded-md transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  } else {
    return (
      <Link
        href={{ pathname: href }}
        className="flex items-center gap-1 text-base font-medium text-giv-gray-900 hover:text-giv-primary-500 p-3 hover:bg-giv-primary-50 rounded-lg transition-colors"
      >
        {label}
      </Link>
    )
  }
}
