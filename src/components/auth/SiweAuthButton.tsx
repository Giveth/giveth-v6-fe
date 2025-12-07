'use client'

import { Button } from '@/components/ui/button'
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton'
import { useSiweAuth } from '@/hooks/useSiweAuth'

export function SiweAuthButton() {
  const {
    isAuthenticated,
    user,
    isLoading,
    error,
    signIn,
    signOut,
    isConnected,
    walletAddress,
  } = useSiweAuth()

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <div className="font-medium">{user.name || 'Anonymous User'}</div>
          <div className="text-gray-500">
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </div>
        </div>
        <Button variant="ghost" onClick={signOut} disabled={isLoading}>
          Sign Out
        </Button>
      </div>
    )
  }

  if (!isConnected) {
    return <ConnectWalletButton />
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      <Button onClick={signIn} disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In with Ethereum'}
      </Button>

      <div className="text-xs text-gray-500">
        Connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
      </div>
    </div>
  )
}
