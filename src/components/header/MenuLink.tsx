import { useState } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'
import { z } from 'zod'
import type { Route } from 'next'

export const submenuItemSchema = z.object({
  label: z.string(),
  href: z.string(),
  target: z.string().optional(),
})

export const menuLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
  submenu: z.array(submenuItemSchema).optional(),
  target: z.string().optional(),
})

type MenuLinkProps = z.infer<typeof menuLinkSchema>

export function MenuLink({ label, href, submenu, target }: MenuLinkProps) {
  const [menuOpen, setMenuOpen] = useState(false) // dropdown menu open state
  const rel = target === '_blank' ? 'noopener noreferrer' : undefined

  if (submenu) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <Link
          href={href as Route}
          target={target}
          rel={rel}
          className={clsx(
            'flex justify-between md:justify-start items-center gap-1',
            'text-sm font-semibold text-giv-neutral-900 hover:text-giv-brand-500',
            'p-3 hover:bg-giv-brand-50 rounded-md transition-colors',
            menuOpen && 'bg-giv-brand-50',
          )}
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
          <div
            className={clsx(
              'md:absolute top-full left-0 w-48 bg-white md:rounded-lg md:shadow-lg p-4 z-50 animate-slide-in',
              menuOpen && 'bg-giv-brand-50',
            )}
          >
            {submenu.map(item => (
              <Link
                key={item.label}
                href={item.href as Route}
                target={item.target}
                rel={
                  item.target === '_blank' ? 'noopener noreferrer' : undefined
                }
                className={clsx(
                  'flex items-center gap-1',
                  'text-sm font-medium text-giv-neutral-900 hover:text-giv-brand-500',
                  'px-4 py-3 mb-2 hover:bg-giv-brand-50 rounded-md transition-colors',
                )}
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
        href={href as Route}
        target={target}
        rel={rel}
        className={clsx(
          'flex items-center gap-1',
          'text-sm font-semibold text-giv-neutral-900 hover:text-giv-brand-500',
          'p-3 hover:bg-giv-brand-50 rounded-md transition-colors',
        )}
      >
        {label}
      </Link>
    )
  }
}
