import { Inter, Red_Hat_Text } from 'next/font/google'
import { Providers } from '@/app/providers'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { CartProvider } from '@/context/CartContext'
import '@radix-ui/themes/styles.css'
import type { Metadata } from 'next'

import './globals.css'

const redHatText = Red_Hat_Text({
  subsets: ['latin'],
  variable: '--font-red-hat-text',
})

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
      <body className={`${redHatText.className} ${inter.variable}`}>
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
