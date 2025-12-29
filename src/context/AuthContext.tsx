'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  useActiveAccount,
  useActiveWalletChain,
  useActiveWalletConnectionStatus,
} from 'thirdweb/react'
import { SiweService } from '@/lib/auth/siwe.service'

interface User {
  id: number
  email?: string
  name?: string
  avatar?: string
  primaryWallet?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  isConnected: boolean
  walletAddress: string | undefined
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    error: null,
  })

  const account = useActiveAccount()
  const connectionStatus = useActiveWalletConnectionStatus()
  const chain = useActiveWalletChain()

  const siweService = useMemo(() => new SiweService(), [])
  const lastWalletAddressRef = useRef<string | undefined>(undefined)
  const lastImpactGraphSyncRef = useRef<string | undefined>(undefined)
  const initRef = useRef(false)

  const setSignedOutState = useCallback((error: string | null = null) => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error,
    })
  }, [])

  // Initialize auth state from localStorage - only once
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const initializeAuth = async () => {
      const token = localStorage.getItem('giveth_token')
      if (token) {
        try {
          const validation = await siweService.validateToken(token)
          if (validation.valid && validation.user) {
            setAuthState({
              isAuthenticated: true,
              user: validation.user,
              token,
              isLoading: false,
              error: null,
            })
          } else {
            localStorage.removeItem('giveth_token')
            setSignedOutState(null)
          }
        } catch {
          localStorage.removeItem('giveth_token')
          setSignedOutState('Token validation failed')
        }
      } else {
        setSignedOutState(null)
      }
    }

    initializeAuth()
  }, [setSignedOutState, siweService])

  // Keep auth state consistent with wallet connection / account changes
  useEffect(() => {
    const isConnected = connectionStatus === 'connected'
    const walletAddress = account?.address

    if (
      walletAddress &&
      lastWalletAddressRef.current &&
      walletAddress !== lastWalletAddressRef.current
    ) {
      localStorage.removeItem('giveth_token')
      setSignedOutState(null)
    }

    lastWalletAddressRef.current = walletAddress

    if (!isConnected) return

    const syncImpactGraphUser = async () => {
      if (!walletAddress) return

      try {
        // Ensure user exists in Impact-Graph (public endpoint; no JWT needed)
        if (lastImpactGraphSyncRef.current !== walletAddress) {
          lastImpactGraphSyncRef.current = walletAddress
          try {
            // await ensureImpactGraphUserExists(walletAddress)
          } catch (e) {
            // Non-fatal: do not block wallet auth check if Impact-Graph is down.
            console.error('Impact-Graph user sync failed:', e)
          }
        }
      } catch (error) {
        console.error('Error syncing Impact-Graph user:', error)
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to sync Impact-Graph user',
        }))
      }
    }

    const token = localStorage.getItem('giveth_token')
    if (!token) {
      setAuthState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }))
      syncImpactGraphUser().finally(() => {
        // Wallet is connected but user isn't authenticated yet; don't call v6-core to create/update user.
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }))
      })
    }
  }, [account?.address, connectionStatus, setSignedOutState, siweService])

  const signIn = useCallback(async () => {
    if (!account?.address) {
      setAuthState(prev => ({
        ...prev,
        error: 'Wallet not connected',
      }))
      return
    }

    setAuthState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }))

    try {
      const signMessage = async (message: string): Promise<string> => {
        if (!account) {
          throw new Error('No active account')
        }
        const signature = await account.signMessage({
          message: { raw: message as `0x${string}` },
        })
        return signature as string
      }

      const response = await siweService.signInWithEthereum(
        account.address as `0x${string}`,
        signMessage,
        chain?.id,
      )

      if (
        response.verifySiweToken.success &&
        response.verifySiweToken.token &&
        response.verifySiweToken.user
      ) {
        setAuthState({
          isAuthenticated: true,
          user: response.verifySiweToken.user,
          token: response.verifySiweToken.token,
          isLoading: false,
          error: null,
        })

        localStorage.setItem('giveth_token', response.verifySiweToken.token)
      } else {
        throw new Error(
          response.verifySiweToken.error || 'Authentication failed',
        )
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }))
    }
  }, [account, chain?.id, siweService])

  const signOut = useCallback(async () => {
    setSignedOutState(null)
    localStorage.removeItem('giveth_token')
  }, [setSignedOutState])

  const value: AuthContextValue = {
    ...authState,
    signIn,
    signOut,
    isConnected: connectionStatus === 'connected',
    walletAddress: account?.address,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useSiweAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useSiweAuth must be used within an AuthProvider')
  }
  return context
}
