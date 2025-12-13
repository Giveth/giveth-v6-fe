'use client'

import { Button } from '@/components/ui/button'
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton'
import { useSiweAuth } from '@/hooks/useSiweAuth'

export function SiweAuthButton() {
  const { isAuthenticated, isLoading, error, signIn, signOut, isConnected } =
    useSiweAuth()

  if (!isConnected) {
    return <ConnectWalletButton />
  }

  return (
    <div className="flex items-center gap-3">
      <ConnectWalletButton />
      {isAuthenticated ? (
        <Button variant="ghost" onClick={signOut} disabled={isLoading}>
          Sign Out
        </Button>
      ) : (
        <Button
          variant="ghost"
          onClick={signIn}
          disabled={isLoading}
          className="hidden sm:inline-flex"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      )}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
          {error}
        </div>
      )}
    </div>
  )
}
