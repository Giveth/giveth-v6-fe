'use client'

import { type ReactNode, useState } from 'react'
import { Theme } from '@radix-ui/themes'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThirdwebProvider } from 'thirdweb/react'
import { useThemeSync } from '@/hooks/use-theme-sync'
import { getQueryClient } from '@/lib/react-query/query-client'

type ProvidersProps = {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  useThemeSync()
  const [queryClient] = useState(() => getQueryClient())

  return (
    <ThirdwebProvider>
      <Theme accentColor="iris" grayColor="sand" radius="large">
        <QueryClientProvider client={queryClient}>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools
              initialIsOpen={false}
              position="bottom"
              buttonPosition="bottom-right"
            />
          )}
        </QueryClientProvider>
      </Theme>
    </ThirdwebProvider>
  )
}
