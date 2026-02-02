'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useActiveWalletConnectionStatus } from 'thirdweb/react'
import { AiChatPanel } from '@/components/create-project/AiChatPanel'
import { CreateProjectLayout } from '@/components/create-project/CreateProjectLayout'
import { ManualSidebarForm } from '@/components/create-project/ManualSidebarForm'
import ConnectWalletButton from '@/components/wallet/ConnectWalletButton'
import { useSiweAuth } from '@/context/AuthContext'

export default function CreateProjectPage() {
  const { isAuthenticated, isLoading, signIn } = useSiweAuth()
  const connectionStatus = useActiveWalletConnectionStatus()
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(false)

  // Default experience: AI chat (form hidden).
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const isConnected = connectionStatus === 'connected'

  useEffect(() => {
    const initializePage = async () => {
      if (isLoading) return
      setIsInitializing(true)

      if (!isConnected) {
        setIsInitializing(false)
        return
      }

      if (!isAuthenticated) {
        try {
          await signIn()
        } catch (error) {
          console.error('Failed to sign in:', error)
          router.push('/')
          return
        }
      }

      setIsInitializing(false)
    }

    initializePage()
  }, [isLoading, isAuthenticated, isConnected, signIn, router])

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

  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#f7f8fc] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600 mb-8">
            You need to connect your wallet to create a project
          </p>
          <ConnectWalletButton />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
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
      onToggleSidebar={() => setIsSidebarOpen(v => !v)}
      sidebar={<ManualSidebarForm />}
      chat={<AiChatPanel />}
    />
  )
}
