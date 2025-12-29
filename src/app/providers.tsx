'use client'

import { type ReactNode, useState } from 'react'
import { Theme } from '@radix-ui/themes'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThirdwebProvider } from 'thirdweb/react'
import { AuthProvider } from '@/context/AuthContext'
import { useThemeSync } from '@/hooks/use-theme-sync'
import { env } from '@/lib/env'
import { getQueryClient } from '@/lib/react-query/query-client'

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  useThemeSync()
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
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
