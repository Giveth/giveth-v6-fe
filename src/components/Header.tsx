'use client'

import { usePathname } from 'next/navigation'
import { CartHeader } from '@/components/header/CartHeader'
import { DefaultHeader } from '@/components/header/DefaultHeader'

export function Header() {
  const pathname = usePathname()
  const isCartPage = pathname.startsWith('/cart')
  const isCreateProjectPage = pathname.startsWith('/create/project')

  // Cart page header variant
  if (isCartPage) {
    return <CartHeader />
  }

  if (isCreateProjectPage) {
    return <DefaultHeader hideSearch createProjectMinimal />
  }

  // Default header variant
  return <DefaultHeader hideSearch />
}
