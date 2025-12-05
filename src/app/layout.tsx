import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import '@radix-ui/themes/styles.css'

import { Providers } from '@/app/providers'
import { Footer } from '@/components/layout/footer'
import { NewHeader } from '@/components/layout/NewHeader'
import { CartProvider } from '@/context/CartContext'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Giveth',
  description: 'The Future of Giving',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <CartProvider>
            <NewHeader />
            {children}
            <Footer />
          </CartProvider>
        </Providers>
      </body>
    </html>
  )
}
