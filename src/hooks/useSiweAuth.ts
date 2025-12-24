'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useActiveAccount,
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

export function useSiweAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true, // Start with loading true
    error: null,
  })

  const account = useActiveAccount()
  const connectionStatus = useActiveWalletConnectionStatus()

  // Create once to avoid re-instantiating clients on every render
  const siweService = useMemo(() => new SiweService(), [])
  const lastWalletAddressRef = useRef<string | undefined>(undefined)

  const setSignedOutState = useCallback((error: string | null = null) => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error,
    })
  }, [])

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('giveth_token')
      if (token) {
        try {
          // Validate token with backend
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
            // Token is invalid, remove it
            localStorage.removeItem('giveth_token')
            setSignedOutState(null)
          }
        } catch {
          // Error validating token, remove it
          localStorage.removeItem('giveth_token')
          setSignedOutState('Token validation failed')
        }
      } else {
        // Important: explicitly clear any stale in-memory auth state
        setSignedOutState(null)
      }
    }

    initializeAuth()
  }, [setSignedOutState, siweService])

  // Keep auth state consistent with wallet connection / account changes.
  // This prevents cases where UI shows authenticated content after wallet connect
  // while no token is present (e.g. stale in-memory state from HMR or prior session).
  useEffect(() => {
    const isConnected = connectionStatus === 'connected'
    const walletAddress = account?.address

    // If wallet changes, any existing token/user should be considered invalid for safety.
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

    const token = localStorage.getItem('giveth_token')
    if (!token) {
      // Wallet connected but no token => must require SIWE immediately
      setSignedOutState(null)
    }
  }, [account?.address, connectionStatus, setSignedOutState])

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
      // Create a sign message function using thirdweb
      const signMessage = async (message: string): Promise<string> => {
        if (!account) {
          throw new Error('No active account')
        }

        // This will need to be implemented based on thirdweb's signing API
        // For now, using a placeholder - you'll need to implement this properly
        const signature = await account.signMessage({
          message: { raw: message as `0x${string}` },
        })
        return signature as string
      }

      const response = await siweService.signInWithEthereum(
        account.address as `0x${string}`,
        signMessage,
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

        // Store token in localStorage or secure storage
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
  }, [account, siweService])

  const signOut = useCallback(async () => {
    // const token = authState.token || localStorage.getItem('giveth_token')

    // Invalidate token on auth service
    // TODO: Invalidate token stucks on Auth service - should be fixed in the future
    // if (token) {
    //   await siweService.invalidateToken(token)
    // }

    setSignedOutState(null)

    // Remove token from storage
    localStorage.removeItem('giveth_token')
  }, [setSignedOutState])

  return {
    ...authState,
    signIn,
    signOut,
    isConnected: connectionStatus === 'connected',
    walletAddress: account?.address,
  }
}
