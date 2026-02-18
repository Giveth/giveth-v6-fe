import { CheckingAuthentication } from '@/components/account/CheckingAuthentication'
import { NotAuthenticated } from '@/components/account/NotAuthenticated'
import { NotConnected } from '@/components/account/NotConnected'
import { useSiweAuth } from '@/context/AuthContext'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, error, signIn, isConnected } =
    useSiweAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return <CheckingAuthentication />
  }

  // Step 1: User needs to connect wallet
  if (!isConnected) {
    return <NotConnected />
  }

  // Step 2: User needs to sign in with SIWE
  if (!isAuthenticated) {
    return <NotAuthenticated error={error} signIn={signIn} />
  }

  // User is authenticated, show the protected content
  return <>{children}</>
}
