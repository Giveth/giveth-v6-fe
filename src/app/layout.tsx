import { Inter } from 'next/font/google'
import { Providers } from '@/app/providers'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { CartProvider } from '@/context/CartContext'
import '@radix-ui/themes/styles.css'
import type { Metadata } from 'next'

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
            <Header />
            {children}
            <Footer />
          </CartProvider>
        </Providers>
      </body>
    </html>
  )
}
