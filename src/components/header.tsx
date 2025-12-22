'use client'

import { usePathname } from 'next/navigation'
import { CartHeader } from '@/components/header/CartHeader'
import { DefaultHeader } from '@/components/header/DefaultHeader'

export function Header() {
  const pathname = usePathname()
  const isCartPage = pathname.startsWith('/cart')

  // Cart page header variant
  if (isCartPage) {
    return <CartHeader />
  }

  // Default header variant
  return <DefaultHeader />
}
