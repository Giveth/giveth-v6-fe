'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActiveWalletConnectionStatus } from 'thirdweb/react'
import { CreateProjectFullForm } from '@/components/project/CreateProjectFullForm'
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton'
import { useSiweAuth } from '@/hooks/useSiweAuth'

export default function CreateProjectPage() {
  const { isAuthenticated, isLoading, signIn } = useSiweAuth()
  const connectionStatus = useActiveWalletConnectionStatus()
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(false)

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

  // Show loading state while checking auth
  if (isLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-[#f7f7f9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5326ec] mx-auto"></div>
          <p className="mt-4 text-gray-600">Setting up your session...</p>
        </div>
      </div>
    )
  }

  // Show connect wallet if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#f7f7f9] flex items-center justify-center">
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

  // Show sign in if wallet connected but not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f7f9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5326ec] mx-auto"></div>
          <p className="mt-4 text-gray-600">Signing you in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f9]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-[#1d1e1f]">
              Create a Project
            </h1>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Left: Form */}
          <div>
            <CreateProjectFullForm />
          </div>

          {/* Right: Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <WritingTipsSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function WritingTipsSidebar() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
            stroke="#5326ec"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 className="text-base font-semibold text-[#1d1e1f]">
          A Few Writing Tips
        </h3>
      </div>

      <ul className="space-y-3 text-sm text-gray-600">
        <li className="flex items-start gap-2">
          <span className="text-[#5326ec] mt-1">•</span>
          <span>
            Keep your project title short! Aim for less than 10 words.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#5326ec] mt-1">•</span>
          <span>
            Be specific. Use your description to explain what you&apos;re doing
            and why.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#5326ec] mt-1">•</span>
          <span>
            Use formatting to organize your text and make it easier to read.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#5326ec] mt-1">•</span>
          <span>Include links to your social media profiles and website.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-[#5326ec] mt-1">•</span>
          <span>Add an eye-catching image that represents your project.</span>
        </li>
      </ul>
    </div>
  )
}
