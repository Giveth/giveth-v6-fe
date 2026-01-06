'use client'

import { Info } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'
import { useSiweAuth } from '@/context/AuthContext'
import { usePassportEligibility } from '@/hooks/usePassportEligibility'

export function PassportBanner() {
  const { signIn, isAuthenticated, isLoading: isAuthLoading } = useSiweAuth()
  const account = useActiveAccount()

  const eligibilityQuery = usePassportEligibility(
    account?.address ? { address: account.address } : undefined,
    { enabled: !!account?.address && isAuthenticated },
  )
  const { data, isLoading, isError, refetch } = eligibilityQuery

  console.log({ data })

  const checkEligibility = async () => {
    if (!account?.address) return

    if (!isAuthenticated) {
      try {
        await signIn()
        // After sign-in, the JWT becomes available, so refetch to get fresh eligibility.
        await refetch()
      } catch (error) {
        console.error('Failed to sign in:', error)
      }
    } else {
      await refetch()
    }
  }
  return (
    <>
      {isLoading && (
        <div className="bg-giv-primary-100 py-2.5 px-4 flex items-center justify-center gap-2 text-base">
          Checking Eligibility...
        </div>
      )}
      {/* Wallet Not Connected */}
      {!account && !isLoading && !isError && (
        <div className="bg-[#fff3d2] py-2.5 px-4 flex items-center justify-center gap-2 text-base">
          <Info className="w-6 h-6 text-giv-warning-600" />
          Connect your wallet to verify your eligibility for donation matching.
        </div>
      )}
      {/* Wallet Connected but no data */}
      {account && !isLoading && !isError && (
        <div className="bg-[#fff3d2] py-2.5 px-4 flex items-center justify-center gap-2 text-base">
          <Info className="w-6 h-6 text-giv-warning-600" />
          <p>
            Get your donations matched! Verify your uniqueness with one click.
          </p>
          <button
            onClick={checkEligibility}
            disabled={isAuthLoading}
            className="text-sm text-giv-primary-500 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Eligibility
          </button>
        </div>
      )}
      {data && !data.checkPassportEligibility.isEligible && (
        <div className="bg-[#fff3d2] py-2.5 px-4 flex items-center justify-center gap-2 text-base">
          <Info className="w-6 h-6 text-giv-warning-600" />
          <p>You are not eligible for donation matching.</p>
          <button
            onClick={checkEligibility}
            disabled={isAuthLoading}
            className="text-sm text-giv-primary-500 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Re-check Eligibility
          </button>
        </div>
      )}
    </>
  )
}
