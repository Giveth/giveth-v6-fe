import { Inter } from 'next/font/google'
import { Providers } from '@/app/providers'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { CartProvider } from '@/context/CartContext'
import '@radix-ui/themes/styles.css'
import type { Metadata } from 'next'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Giveth',
  description: 'The Future of Giving',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <Providers>
          <CartProvider>
            <Header />
            {children}
            <Footer />
          </CartProvider>
        </Providers>
      </body>
    </html>
  )
}
