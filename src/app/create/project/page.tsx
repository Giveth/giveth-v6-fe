'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActiveWalletConnectionStatus } from 'thirdweb/react'
import {
  CreateProjectFullForm,
  type CreateFormSection,
} from '@/components/project/CreateProjectFullForm'
import { CreateProjectProGuide } from '@/components/project/CreateProjectProGuide'
import { ConnectWalletButton } from '@/components/wallet/ConnectWalletButton'
import { useSiweAuth } from '@/hooks/useSiweAuth'

export default function CreateProjectPage() {
  const { isAuthenticated, isLoading, signIn } = useSiweAuth()
  const connectionStatus = useActiveWalletConnectionStatus()
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(false)
  const [activeSection, setActiveSection] =
    useState<CreateFormSection>('default')
  const [progress, setProgress] = useState({
    score: 0,
    completed: 0,
    total: 5,
  })

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
      <div className="bg-gradient-to-r from-[#f5edff] via-[#fdf4ff] to-[#eef4ff]">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-sm text-[#5326ec]">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[#5326ec] shadow-sm ring-1 ring-white/70 transition hover:-translate-x-0.5 hover:shadow"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18L9 12L15 6" />
              </svg>
              Back
            </Link>
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#7f7f92] ring-1 ring-white/60">
              Create a project
            </span>
          </div>

          <div className="flex flex-col gap-6 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.08em] text-[#7f7f92]">
                Get started
              </p>
              <h1 className="text-3xl font-bold text-[#1d1e1f] sm:text-4xl">
                Launch your project on Giveth
              </h1>
              <p className="max-w-2xl text-sm text-gray-600 sm:text-base">
                Mirror of the classic Giveth create flow with guided tips, so
                you can ship a complete, trustworthy project page faster.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                <Badge>Title</Badge>
                <Badge>Description</Badge>
                <Badge>Social links</Badge>
                <Badge>Banner</Badge>
                <Badge>Receiving funds</Badge>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 rounded-2xl bg-[#5326ec] px-5 py-4 text-white shadow-md sm:w-auto">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3v18" />
                      <path d="M3 12h18" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white/80">Project score</p>
                    <p className="text-lg font-semibold">
                      {progress.score}% · {progress.completed}/{progress.total}{' '}
                      steps
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
                  Guided
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>
                    {activeSection === 'default'
                      ? 'Start with the basics'
                      : `You’re on ${sectionLabel(activeSection)}`}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white/90 transition-all"
                    style={{ width: `${Math.min(progress.score, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="-mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <CreateProjectFullForm
              onSectionChange={setActiveSection}
              onProgressChange={setProgress}
            />
          </div>
          <div className="hidden lg:block">
            <CreateProjectProGuide activeSection={activeSection} />
          </div>
        </div>
      </div>
    </div>
  )
}

const sectionLabel = (section: CreateFormSection) => {
  switch (section) {
    case 'name':
      return 'Project name'
    case 'description':
      return 'Description'
    case 'social':
      return 'Social links'
    case 'categories':
      return 'Categories'
    case 'location':
      return 'Impact location'
    case 'image':
      return 'Banner image'
    case 'addresses':
      return 'Receiving funds'
    case 'publish':
      return 'Publish'
    default:
      return 'Project setup'
  }
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#1d1e1f] ring-1 ring-white/80">
      {children}
    </span>
  )
}
