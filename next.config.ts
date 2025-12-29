import { env } from './src/lib/env'
import type { NextConfig } from 'next'

const isProd = env.VERCEL_ENV === 'production'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/qf',
        permanent: false,
      },
    ]
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: [
      '@radix-ui/themes',
      '@radix-ui/react-icons',
      'thirdweb',
    ],
  },
  compiler: {
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.giveth.io' },
      { protocol: 'https', hostname: '**.giveth.com' },
      { protocol: 'https', hostname: 'cdn.statically.io' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: '**.ipfs.w3s.link' },
      { protocol: 'https', hostname: 'giveth.mypinata.cloud' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
