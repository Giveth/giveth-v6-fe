'use client'

import {
  type HTMLAttributeAnchorTarget,
  useEffect,
  useMemo,
  useState,
} from 'react'
import Link from 'next/link'
import { BadgeCheck, ExternalLink, Info } from 'lucide-react'
import { type Route } from 'next'
import { useActiveAccount } from 'thirdweb/react'
import { useSiweAuth } from '@/context/AuthContext'
import { useGlobalConfiguration } from '@/hooks/useGlobalConfiguration'
import { usePassportEligibility } from '@/hooks/usePassportEligibility'
import { PassportLink } from '@/lib/constants/menu-links'
import { IconWarning } from './icons/IconWarning'

let globalSettingScore = {
  globalMinimumMBDScore: 0,
  globalMinimumPassportScore: 0,
}

/**
 *  Admin Pro defines global thresholds for all concurrently active QF rounds:
 *  - Minimum Model-Based Detection (MBD) score
 *  - Minimum Passport Stamp score
 *  If both thresholds are set to 0:
 *  - Passport eligibility checks are disabled
 *  - All Passport-related UI (banners, messages) is hidden
 */

export function PassportBanner() {
  const [isChecking, setIsChecking] = useState(false)
  const { signIn, isAuthenticated, isLoading: isAuthLoading } = useSiweAuth()
  const account = useActiveAccount()

  const eligibilityQuery = usePassportEligibility(
    account?.address ? { address: account.address } : undefined,
    { enabled: !!account?.address && isAuthenticated },
  )
  const {
    data,
    isLoading: isEligibilityLoading,
    isError,
    refetch,
  } = eligibilityQuery

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
    globalMinimumMBDScoreData?.globalConfiguration?.value ?? 0,
  )
  globalSettingScore.globalMinimumPassportScore = Number(
    globalMinimumPassportScoreData?.globalConfiguration?.value ?? 0,
  )

  let passportScore = 0
  let isEligible = false
  let isMBDEligible = false
  let isPassportEligible = false

  const mbdScore = Number(data?.checkPassportEligibility?.mbdScore ?? 0)
  passportScore = Number(data?.checkPassportEligibility?.passportScore ?? 0)
  isMBDEligible =
    mbdScore > 0 && mbdScore >= globalSettingScore.globalMinimumMBDScore
  isPassportEligible =
    passportScore > 0 &&
    passportScore >= globalSettingScore.globalMinimumPassportScore
  isEligible = isMBDEligible && isPassportEligible

  const showLoading = useMemo(
    () => isChecking || isEligibilityLoading || isAuthLoading,
    [isChecking, isEligibilityLoading, isAuthLoading],
  )

  useEffect(() => {
    if (!isEligibilityLoading && !isAuthLoading && isChecking) {
      setIsChecking(false)
    }
  }, [isEligibilityLoading, isAuthLoading, isChecking])

  const checkEligibility = async () => {
    if (!account?.address) return

    if (!isAuthenticated) {
      try {
        setIsChecking(true)
        await signIn()
        // After sign-in, the JWT becomes available, so refetch to get fresh eligibility.
        await refetch()
      } catch (error) {
        console.error('Failed to sign in:', error)
        setIsChecking(false)
      }
    } else {
      setIsChecking(true)
      await refetch()
      setIsChecking(false)
    }
  }

  if (
    globalSettingScore.globalMinimumMBDScore === 0 &&
    globalSettingScore.globalMinimumPassportScore === 0
  ) {
    return null
  }

  return (
    <>
      {showLoading && (
        <div className="bg-giv-primary-100 py-2.5 px-4 flex items-center justify-center gap-2 text-base">
          Checking Eligibility...
        </div>
      )}
      {/* Wallet Not Connected */}
      {!account && !showLoading && !isError && (
        <div className="bg-[#fff3d2] py-2.5 px-4 flex items-center justify-center gap-2 text-base">
          <Info className="w-6 h-6 text-giv-warning-600" />
          Connect your wallet to verify your eligibility for donation matching.
        </div>
      )}
      {/* Wallet Connected but no eligibility data yet and user is not signed in */}
      {account && !data && !showLoading && !isError && !isAuthenticated && (
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
      {/* If the user's MBD score is below the threshold for MBD and their passport score is below the threshold for Passport */}
      {account && data && !isEligible && !showLoading && (
        <div className="bg-giv-primary-100 py-2.5 px-4 flex items-center justify-center gap-2 text-base">
          <IconWarning width={24} height={24} />
          <Link
            href={PassportLink.href as unknown as Route}
            target={PassportLink.target as HTMLAttributeAnchorTarget}
            className="flex items-center gap-2"
          >
            <span className="text-giv-primary-500! font-normal disabled:opacity-85">
              Go to Passport
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-giv-primary-500" />
          </Link>
          <p className="text-giv-gray-900">
            to increase your score above{' '}
            <span className="font-bold">{passportScore}</span> and then click
            to{' '}
          </p>
          <button
            onClick={checkEligibility}
            disabled={isAuthLoading}
            className="text-sm text-giv-primary-500 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refresh Score
          </button>
        </div>
      )}
      {/* Wallet Connected And Has Eligibility Data */}
      {account && data && isEligible && !showLoading && (
        <div className="bg-[#D2FFFB] py-2.5 px-4 flex items-center justify-center gap-2 text-base">
          <BadgeCheck className="w-6 h-6 text-giv-jade-600" />
          <p>You donations are eligible to be matched!</p>
        </div>
      )}
    </>
  )
}
