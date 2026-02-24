'use client'

import { useEffect, useRef, useState } from 'react'
import { useActiveWalletConnectionStatus } from 'thirdweb/react'
import { AiChatPanel } from '@/components/create-project/AiChatPanel'
import { CreateProjectLayout } from '@/components/create-project/CreateProjectLayout'
import { ManualSidebarForm } from '@/components/create-project/ManualSidebarForm'
import { ProjectOwnerSignInButton } from '@/components/create-project/ProjectOwnerSignInButton'
import { useSiweAuth } from '@/context/AuthContext'
import { useAAWalletStore } from '@/store/aa-wallet'

export default function CreateProjectPage() {
  const { isAuthenticated, isLoading, signIn } = useSiweAuth()
  const connectionStatus = useActiveWalletConnectionStatus()
  const [isInitializing, setIsInitializing] = useState(false)
  const [showAiUpdateCue, setShowAiUpdateCue] = useState(false)
  const aiUpdateCueTimerRef = useRef<number | null>(null)
  // Default experience keeps manual edit visible on first load.
  const [authError, setAuthError] = useState<string | null>(null)

  // Default experience: AI chat (form hidden).
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isAAWallet = useAAWalletStore(s => s.isAAWallet)

  const isConnected = connectionStatus === 'connected'
  const isConnectedWithNonAAWallet = isConnected && !isAAWallet
  const isProjectOwnerConnected = isConnected && isAAWallet

  useEffect(() => {
    const initializePage = async () => {
      if (isLoading) return
      setIsInitializing(true)

      if (!isProjectOwnerConnected) {
        setAuthError(null)
        setIsInitializing(false)
        return
      }

      if (!isAuthenticated) {
        try {
          await signIn()
          setAuthError(null)
        } catch (error) {
          console.error('Failed to sign in:', error)
          setAuthError(
            'Authentication was not completed. Please sign the message to continue.',
          )
        }
      }

      setIsInitializing(false)
    }

    initializePage()
  }, [isLoading, isAuthenticated, isProjectOwnerConnected, signIn])

  useEffect(() => {
    return () => {
      if (aiUpdateCueTimerRef.current) {
        window.clearTimeout(aiUpdateCueTimerRef.current)
      }
    }
  }, [])

  const handleAiFormUpdated = () => {
    setShowAiUpdateCue(true)
    if (aiUpdateCueTimerRef.current) {
      window.clearTimeout(aiUpdateCueTimerRef.current)
    }
    aiUpdateCueTimerRef.current = window.setTimeout(() => {
      setShowAiUpdateCue(false)
      aiUpdateCueTimerRef.current = null
    }, 3000)
  }

  if (isLoading || isInitializing) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#f7f8fc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-giv-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Setting up your session...</p>
        </div>
      </div>
    )
  }

  if (!isProjectOwnerConnected) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#f7f8fc] flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in with Thirdweb
          </h1>
          <p className="text-gray-600 mb-8">
            Continue with Thirdweb to create your project-owner smart wallet.
            Browser wallets act as signers for the Thirdweb smart wallet.
          </p>
          {isConnectedWithNonAAWallet ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You are currently connected with a non-AA wallet (donor flow).
              Disconnect it first, then sign in with the project-owner AA wallet
              to continue.
            </div>
          ) : (
            <ProjectOwnerSignInButton />
          )}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (authError) {
      return (
        <div className="min-h-[calc(100vh-64px)] bg-[#f7f8fc] flex items-center justify-center">
          <div className="text-center">
            <p className="max-w-md text-sm text-red-600 mb-4">{authError}</p>
            <button
              type="button"
              onClick={() => {
                setAuthError(null)
                void signIn().catch(error => {
                  console.error('Sign in retry failed:', error)
                  setAuthError(
                    'Authentication was not completed. Please sign the message to continue.',
                  )
                })
              }}
              className="rounded-full bg-[#8668fc] px-5 py-3 text-sm font-semibold text-white hover:opacity-85 cursor-pointer"
            >
              Retry Authentication
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#f7f8fc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-giv-brand-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Signing you in...</p>
        </div>
      </div>
    )
  }

  return (
    <CreateProjectLayout
      isSidebarOpen={isSidebarOpen}
      showAiUpdateCue={showAiUpdateCue}
      onToggleSidebar={() => setIsSidebarOpen(v => !v)}
      sidebar={<ManualSidebarForm />}
      chat={<AiChatPanel onAiFormUpdated={handleAiFormUpdated} />}
    />
  )
}
