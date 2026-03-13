'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Theme } from '@radix-ui/themes'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  ThirdwebProvider,
  useActiveWalletConnectionStatus,
  useAutoConnect,
  useConnect,
  useIsAutoConnecting,
} from 'thirdweb/react'
import { createWallet, injectedProvider } from 'thirdweb/wallets'
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
    if (window.parent === window) return
    if (!injectedProvider('global.safe')) return

    hasTriedSafeAutoConnect.current = true

    void connect(async () => {
      const safeWallet = createWallet('global.safe')
      await safeWallet.connect({
        client: thirdwebClient,
      })
      return safeWallet
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
