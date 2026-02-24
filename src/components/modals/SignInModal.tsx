'use client'

import { useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Dialog, Flex, Text } from '@radix-ui/themes'
import { Loader2, Mail, Wallet } from 'lucide-react'
import { useConnect, useConnectModal } from 'thirdweb/react'
import { getUserEmail, preAuthenticate } from 'thirdweb/wallets/in-app'
import {
  aaInAppWallet,
  primaryWallets,
  supportedChains,
  thirdwebClient,
} from '@/lib/thirdweb/client'
import { useAAWalletStore } from '@/store/aa-wallet'

type SignInModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  purpose?: 'donation' | 'projectOwner'
}

type SignInView = 'main' | 'email' | 'verification' | 'connecting'

/**
 * Sign In Modal
 *
 * Provides two paths for sign-in:
 * 1. "Connect Wallet" - Opens Thirdweb wallet connect (existing WAGMI-like flow)
 * 2. "Donate with dollars" - Creates an AA wallet via email/Google sign-in
 */
export function SignInModal({
  open,
  onOpenChange,
  purpose = 'donation',
}: SignInModalProps) {
  const [view, setView] = useState<SignInView>('main')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { connect } = useConnect()
  const { connect: openConnectModal } = useConnectModal()
  const { setIsAAWallet, setAuthenticatedEmail } = useAAWalletStore()

  /**
   * Reusable helper to handle backend auth and email sync
   * after Thirdweb wallet is successfully connected.
   */
  const handlePostWalletConnection = async () => {
    setIsAAWallet(true)
    // SIWE sign-in is handled automatically by AuthContext's auto-signIn effect
    // once React re-renders with the fresh account from the new connection.

    // Fetch and sync email to global store
    try {
      const providerEmail = await getUserEmail({ client: thirdwebClient })
      if (providerEmail) {
        setAuthenticatedEmail(providerEmail.trim())
      }
    } catch (err) {
      console.error('Non-fatal: Failed to read in-app wallet email:', err)
      // Non-fatal: user is already authenticated.
    }

    handleOpenChange(false)
  }
  const isProjectOwnerFlow = purpose === 'projectOwner'

  const resetState = () => {
    setView('main')
    setEmail('')
    setVerificationCode('')
    setIsLoading(false)
    setError(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) resetState()
    onOpenChange(open)
  }

  /**
   * Handle wallet connection for browser wallets.
   * Opens the standard Thirdweb connect modal.
   */
  const handleConnectWallet = async () => {
    setIsAAWallet(false)
    setAuthenticatedEmail(undefined)
    handleOpenChange(false)
    // Open the standard Thirdweb wallet connect modal
    try {
      await openConnectModal({
        client: thirdwebClient,
        wallets: primaryWallets,
        chains: supportedChains,
        size: 'compact',
        showThirdwebBranding: false,
      })
    } catch {
      // User cancelled the connection
    }
  }

  /**
   * Handle Google sign-in for AA wallet
   */
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await connect(async () => {
        await aaInAppWallet.connect({
          client: thirdwebClient,
          strategy: 'google',
        })
        return aaInAppWallet
      })
      await handlePostWalletConnection()
    } catch (err) {
      console.error('Google sign-in failed:', err)
      setError(err instanceof Error ? err.message : 'Google sign-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Step 1: Send verification code to email
   */
  const handleSendVerificationCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await preAuthenticate({
        client: thirdwebClient,
        strategy: 'email',
        email,
      })
      setView('verification')
    } catch (err) {
      console.error('Failed to send verification code:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to send verification code',
      )
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Step 2: Verify code and create AA wallet
   */
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      setError('Please enter the verification code')
      return
    }

    setIsLoading(true)
    setError(null)
    setView('connecting')

    try {
      await connect(async () => {
        await aaInAppWallet.connect({
          client: thirdwebClient,
          strategy: 'email',
          email,
          verificationCode,
        })
        return aaInAppWallet
      })
      await handlePostWalletConnection()
    } catch (err) {
      console.error('Email verification failed:', err)
      setError(err instanceof Error ? err.message : 'Verification failed')
      setView('verification')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content
        size="3"
        className="w-[92vw] max-w-[420px] rounded-3xl p-0 overflow-hidden"
      >
        <Dialog.Title className="sr-only">Sign In</Dialog.Title>
        <Dialog.Description className="sr-only">
          {isProjectOwnerFlow
            ? 'Connect your wallet or sign in with email to create a project'
            : 'Connect your wallet or sign in with email to donate'}
        </Dialog.Description>

        {/* Header */}
        <Flex align="center" justify="between" className="pt-6 pb-2">
          <Text size="5" weight="bold" className="text-giv-neutral-900">
            Sign In
          </Text>
          <Dialog.Close>
            <button
              type="button"
              aria-label="Close"
              className="rounded-full p-2 hover:bg-black/5 cursor-pointer"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Flex>

        <div className="pb-6 space-y-5">
          {view === 'main' && (
            <>
              {/* Browser Wallet Option */}
              <div>
                <Text size="2" className="text-giv-neutral-600 block">
                  Already have a wallet?
                </Text>
                <button
                  onClick={handleConnectWallet}
                  className="w-full px-4 py-3.5 mt-2 rounded-xl border border-giv-neutral-300 hover:border-giv-brand-300 hover:bg-giv-brand-05 text-giv-neutral-900 text-sm font-semibold transition-all flex items-center gap-3 cursor-pointer"
                >
                  <Wallet className="w-5 h-5 text-giv-brand-500" />
                  Connect Wallet
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-giv-neutral-300" />
                <span className="mx-3 text-xs text-giv-neutral-500">or</span>
                <div className="flex-grow border-t border-giv-neutral-300" />
              </div>

              {/* Donate with Dollars Section */}
              <div>
                <div className="bg-giv-brand-05 border border-giv-brand-100 rounded-xl p-3 mb-3">
                  <Text size="2" weight="medium" className="text-giv-brand-600">
                    {isProjectOwnerFlow
                      ? 'New to crypto? We can set up your wallet'
                      : 'New to crypto? Donate with dollars'}
                  </Text>
                  <Text size="1" className="text-giv-neutral-600 mt-1 block">
                    Sign in with your email or Google account. We&apos;ll set up
                    a wallet for you automatically.
                  </Text>
                </div>

                <div className="space-y-2">
                  {/* Google Sign In */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 rounded-xl border border-giv-neutral-300 hover:border-giv-brand-300 hover:bg-giv-brand-05 text-giv-neutral-900 text-sm font-semibold transition-all flex items-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </button>

                  {/* Email Sign In */}
                  <button
                    onClick={() => setView('email')}
                    disabled={isLoading}
                    className="w-full px-4 py-3.5 rounded-xl border border-giv-neutral-300 hover:border-giv-brand-300 hover:bg-giv-brand-05 text-giv-neutral-900 text-sm font-semibold transition-all flex items-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-5 h-5 text-giv-brand-500" />
                    Continue with Email
                  </button>
                </div>
              </div>

              {error && (
                <Text size="1" className="text-red-500 text-center block">
                  {error}
                </Text>
              )}
            </>
          )}

          {view === 'email' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setView('main')
                  setError(null)
                }}
                className="text-sm text-giv-brand-500 hover:text-giv-brand-600 cursor-pointer"
              >
                &larr; Back
              </button>

              <div>
                <Text
                  size="2"
                  weight="medium"
                  className="text-giv-neutral-900 mb-2 block"
                >
                  Enter your email
                </Text>
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendVerificationCode()
                  }}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-giv-neutral-300 focus:border-giv-brand-300 focus:outline-none focus:ring-2 focus:ring-giv-brand-100 text-sm"
                  autoFocus
                />
              </div>

              <button
                onClick={handleSendVerificationCode}
                disabled={isLoading || !email}
                className="w-full py-3.5 rounded-xl bg-giv-brand-300 text-white font-semibold text-sm hover:bg-giv-brand-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending verification code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>

              {error && (
                <Text size="1" className="text-red-500 text-center block">
                  {error}
                </Text>
              )}

              <Text size="1" className="text-giv-neutral-500 text-center block">
                We'll send you a verification code to confirm your email.
              </Text>
            </div>
          )}

          {view === 'verification' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setView('email')
                  setVerificationCode('')
                  setError(null)
                }}
                className="text-sm text-giv-brand-500 hover:text-giv-brand-600 cursor-pointer"
              >
                &larr; Back
              </button>

              <div>
                <Text
                  size="2"
                  weight="medium"
                  className="text-giv-neutral-900 mb-1 block"
                >
                  Enter verification code
                </Text>
                <Text size="1" className="text-giv-neutral-500 mb-3 block">
                  We sent a code to <strong>{email}</strong>
                </Text>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={e => {
                    setVerificationCode(e.target.value)
                    setError(null)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleVerifyCode()
                  }}
                  placeholder="Enter code"
                  className="w-full px-4 py-3 rounded-xl border border-giv-neutral-300 focus:border-giv-brand-300 focus:outline-none focus:ring-2 focus:ring-giv-brand-100 text-sm text-center text-lg tracking-widest"
                  autoFocus
                  inputMode="numeric"
                />
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isLoading || !verificationCode}
                className="w-full py-3.5 rounded-xl bg-giv-brand-300 text-white font-semibold text-sm hover:bg-giv-brand-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Sign In'
                )}
              </button>

              {error && (
                <Text size="1" className="text-red-500 text-center block">
                  {error}
                </Text>
              )}

              <button
                onClick={handleSendVerificationCode}
                disabled={isLoading}
                className="w-full text-center text-sm text-giv-brand-500 hover:text-giv-brand-600 cursor-pointer disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          )}

          {view === 'connecting' && (
            <Flex
              direction="column"
              align="center"
              justify="center"
              className="py-8"
              gap="4"
            >
              <Loader2 className="w-8 h-8 animate-spin text-giv-brand-500" />
              <Text size="3" weight="medium" className="text-giv-neutral-900">
                Setting up your wallet...
              </Text>
              <Text size="2" className="text-giv-neutral-600 text-center">
                Please check your email for a verification code.
              </Text>
              {error && (
                <Text size="1" className="text-red-500 text-center block">
                  {error}
                </Text>
              )}
            </Flex>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
