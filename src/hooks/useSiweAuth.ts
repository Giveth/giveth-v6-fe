'use client'

import { useCallback, useEffect, useState } from 'react'
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

  const siweService = new SiweService()

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
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
            }))
          }
        } catch {
          // Error validating token, remove it
          localStorage.removeItem('giveth_token')
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Token validation failed',
          }))
        }
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }))
      }
    }

    initializeAuth()
  }, [])

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

  const signOut = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,
    })

    // Remove token from storage
    localStorage.removeItem('giveth_token')
  }, [])

  return {
    ...authState,
    signIn,
    signOut,
    isConnected: connectionStatus === 'connected',
    walletAddress: account?.address,
  }
}
