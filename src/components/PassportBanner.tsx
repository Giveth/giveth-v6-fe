'use client'

import { BadgeCheck, Info } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'
import { useSiweAuth } from '@/context/AuthContext'
import { useGlobalConfiguration } from '@/hooks/useGlobalConfiguration'
import { usePassportEligibility } from '@/hooks/usePassportEligibility'

let globalSettingScore = {
  globalMinimumMBDScore: 0,
  globalMinimumPassportScore: 0,
}

export function PassportBanner({ roundId }: { roundId?: number }) {
  const { signIn, isAuthenticated, isLoading: isAuthLoading } = useSiweAuth()
  const account = useActiveAccount()

  const eligibilityQuery = usePassportEligibility(
    account?.address
      ? { address: account.address, qfRoundId: roundId ?? undefined }
      : undefined,
    { enabled: !!account?.address && isAuthenticated },
  )
  const { data, isLoading, isError, refetch } = eligibilityQuery

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

  // Fetch global settings
  const globalMinimumMBDScoreQuery = useGlobalConfiguration(
    'GLOBAL_MINIMUM_MBD_SCORE',
  )
  const globalMinimumPassportScoreQuery = useGlobalConfiguration(
    'GLOBAL_MINIMUM_PASSPORT_SCORE',
  )
  const { data: globalMinimumMBDScoreData } = globalMinimumMBDScoreQuery
  const { data: globalMinimumPassportScoreData } =
    globalMinimumPassportScoreQuery

  globalSettingScore.globalMinimumMBDScore = Number(
    globalMinimumMBDScoreData?.value ?? 0,
  )
  globalSettingScore.globalMinimumPassportScore = Number(
    globalMinimumPassportScoreData?.value ?? 0,
  )

  let isEligible = false
  let isMBDEligible = false
  let isPassportEligible = false

  // Check if we have roundId included and if we have eligibility data
  if (roundId && roundId > 0 && data?.checkPassportEligibility) {
    const mbdScore = Number(data?.checkPassportEligibility.mbdScore ?? 0)
    const passportScore = Number(
      data?.checkPassportEligibility.passportScore ?? 0,
    )
    isMBDEligible =
      mbdScore > 0 && mbdScore >= globalSettingScore.globalMinimumMBDScore
    isPassportEligible =
      passportScore > 0 &&
      passportScore >= globalSettingScore.globalMinimumPassportScore
    isEligible = isMBDEligible && isPassportEligible
  }
  // Check global settings
  else {
    const mbdScore = Number(globalSettingScore.globalMinimumMBDScore ?? 0)
    const passportScore = Number(
      globalSettingScore.globalMinimumPassportScore ?? 0,
    )
    isMBDEligible =
      mbdScore > 0 && mbdScore >= globalSettingScore.globalMinimumMBDScore
    isPassportEligible =
      passportScore > 0 &&
      passportScore >= globalSettingScore.globalMinimumPassportScore
    isEligible = isMBDEligible && isPassportEligible
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
      {/* Wallet Connected but no eligibility data yet and user is not signed in */}
      {account && !data && !isLoading && !isError && !isAuthenticated && (
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
      {/* Wallet Connected but no eligibility data */}
      {account && data && !isEligible && (
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
      {/* Wallet Connected And Has Eligibility Data */}
      {account && data && isEligible && (
        <div className="bg-[#D2FFFB] py-2.5 px-4 flex items-center justify-center gap-2 text-base">
          <BadgeCheck className="w-6 h-6 text-giv-jade-600" />
          <p>You donations are eligible to be matched!</p>
        </div>
      )}
    </>
  )
}
