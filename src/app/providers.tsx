'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Theme } from '@radix-ui/themes'
import { SafeAppProvider } from '@safe-global/safe-apps-provider'
import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  ThirdwebProvider,
  useActiveWalletConnectionStatus,
  useAutoConnect,
  useConnect,
  useIsAutoConnecting,
} from 'thirdweb/react'
import { EIP1193, createWallet, injectedProvider } from 'thirdweb/wallets'
import { AuthProvider } from '@/context/AuthContext'
import { useThemeSync } from '@/hooks/use-theme-sync'
import { env } from '@/lib/env'
import { getQueryClient } from '@/lib/react-query/query-client'
import {
  aaInAppWallet,
  supportedWallets,
  thirdwebClient,
} from '@/lib/thirdweb/client'

type ProvidersProps = {
  children: ReactNode
}

function ThirdwebAutoConnect() {
  const { connect } = useConnect()
  const connectionStatus = useActiveWalletConnectionStatus()
  const isAutoConnecting = useIsAutoConnecting()
  const hasTriedSafeAutoConnect = useRef(false)

  useAutoConnect({
    client: thirdwebClient,
    wallets: [aaInAppWallet, ...supportedWallets],
  })

  useEffect(() => {
    if (hasTriedSafeAutoConnect.current) return
    if (typeof window === 'undefined') return
    if (isAutoConnecting || connectionStatus !== 'disconnected') return
    const inIframe = window.parent !== window
    const hasSafeUrlHint = new URLSearchParams(window.location.search).has(
      'safe',
    )
    const hasSafeReferrer = document.referrer.includes('safe.global')
    const hasSafeAncestor =
      window.location.ancestorOrigins?.[0]?.includes('safe.global') ?? false
    const isSafeContext =
      inIframe || hasSafeUrlHint || hasSafeReferrer || hasSafeAncestor
    const discoveredSafeProvider = injectedProvider('global.safe')

    if (!discoveredSafeProvider && !isSafeContext) return

    hasTriedSafeAutoConnect.current = true

    void connect(async () => {
      if (discoveredSafeProvider) {
        const safeWallet = createWallet('global.safe')
        await safeWallet.connect({
          client: thirdwebClient,
        })
        return safeWallet
      }

      if (isSafeContext) {
        const sdk = new SafeAppsSDK()
        const safeInfo = await Promise.race([
          sdk.safe.getInfo().catch(() => null),
          new Promise<null>(resolve => {
            window.setTimeout(() => resolve(null), 1500)
          }),
        ])
        if (!safeInfo) {
          throw new Error('Safe SDK provider not available')
        }

        const safeProvider = new SafeAppProvider(safeInfo, sdk)
        const safeWallet = EIP1193.fromProvider({
          provider: safeProvider as unknown as EIP1193.EIP1193Provider,
          walletId: 'global.safe',
        })
        await safeWallet.connect({
          client: thirdwebClient,
        })
        return safeWallet
      }

      throw new Error('Safe provider not available for auto-connect')
    }).catch(() => {
      // Silently ignore failed Safe auto-connect and keep manual connect available.
    })
  }, [connect, connectionStatus, isAutoConnecting])

  return null
}

export function Providers({ children }: ProvidersProps) {
  useThemeSync()
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        <ThirdwebAutoConnect />
        <AuthProvider>
          <Theme accentColor="iris" grayColor="sand" radius="large">
            {children}
            {env.NODE_ENV === 'development' && (
              <ReactQueryDevtools
                initialIsOpen={false}
                position="bottom"
                buttonPosition="bottom-right"
              />
            )}
          </Theme>
        </AuthProvider>
      </ThirdwebProvider>
    </QueryClientProvider>
  )
}
