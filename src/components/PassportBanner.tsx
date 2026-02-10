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
import { IconWarning } from '@/components/icons/IconWarning'
import { useSiweAuth } from '@/context/AuthContext'
import { useGlobalConfiguration } from '@/hooks/useGlobalConfiguration'
import {
  usePassportEligibility,
  useRefreshPassportEligibility,
} from '@/hooks/usePassportEligibility'
import { PassportLink } from '@/lib/constants/menu-links'

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
  const [userPassportData, setUserPassportData] = useState({
    passportScore: 0,
    mbdScore: 0,
    isEligible: false,
    expirationDate: null,
  })

  const { signIn, isAuthenticated, isLoading: isAuthLoading } = useSiweAuth()
  const account = useActiveAccount()

  const eligibilityQuery = usePassportEligibility(
    account?.address ? { address: account.address } : undefined,
    { enabled: !!account?.address && isAuthenticated },
  )
  const { data, isLoading: isEligibilityLoading, isError } = eligibilityQuery

  const { mutateAsync: refreshEligibility } = useRefreshPassportEligibility()

  // Update user passport data
  useEffect(() => {
    if (data) {
      setUserPassportData({
        passportScore: data.checkPassportEligibility.passportScore ?? 0,
        mbdScore: data.checkPassportEligibility.mbdScore ?? 0,
        isEligible: data.checkPassportEligibility.isEligible,
        expirationDate: data.checkPassportEligibility.expirationDate ?? null,
      })
    }
  }, [data])

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

  let isUserEligible = false // By default, user is not eligible
  const userMBDScore = Number(userPassportData?.mbdScore ?? 0)
  const userPassportScore = Number(userPassportData?.passportScore ?? 0)

  // First we check MBD Score
  if (userMBDScore >= globalSettingScore.globalMinimumMBDScore) {
    isUserEligible = true
  }
  // Second if MBD score less than global minimum, we check Passport Score
  else if (userPassportScore >= globalSettingScore.globalMinimumPassportScore) {
    isUserEligible = true
  } else {
    isUserEligible = false
  }

  const showLoading = useMemo(
    () => isEligibilityLoading || isAuthLoading,
    [isChecking, isEligibilityLoading, isAuthLoading],
  )

  const checkEligibility = async () => {
    if (!account?.address) return

    setIsChecking(true)
    try {
      if (!isAuthenticated) {
        await signIn()
      }
      // After sign-in, the JWT becomes available, so refresh to get fresh eligibility.
      const response = await refreshEligibility(account.address)

      if (response?.refreshPassportScore) {
        setUserPassportData({
          passportScore: response.refreshPassportScore.passportScore ?? 0,
          mbdScore: response.refreshPassportScore.mbdScore ?? 0,
          isEligible: response.refreshPassportScore.isEligible,
          expirationDate: response.refreshPassportScore.expirationDate ?? null,
        })
      }
    } catch (error) {
      console.error('Failed to sign in:', error)
    } finally {
      setIsChecking(false)
    }
  }

  // If global minimum MBD score and global minimum passport score are 0, return null
  if (
    globalSettingScore.globalMinimumMBDScore === 0 &&
    globalSettingScore.globalMinimumPassportScore === 0
  ) {
    return null
  }

  return (
    <>
      {showLoading && (
        <div className=" bg-giv-brand-100 py-2.5 px-4 flex items-center justify-center gap-2 text-base">
          Checking Eligibility...
        </div>
      )}
      {/* Wallet Not Connected */}
      {!account && !showLoading && !isError && (
        <div className="bg-giv-warning-200 py-2.5 px-4 flex items-center justify-center gap-2 text-base">
          <Info className="w-6 h-6 text-giv-warning-600" />
          Connect your wallet to verify your eligibility for donation matching.
        </div>
      )}
      {/* Wallet Connected but no eligibility data yet and user is not signed in */}
      {account && !data && !showLoading && !isError && !isAuthenticated && (
        <div className=" bg-giv-warning-200 py-2.5 px-4 flex items-center justify-center gap-2 text-base">
          <Info className="w-6 h-6 text-giv-warning-600" />
          <p>
            Get your donations matched! Verify your uniqueness with one click.
          </p>
          <button
            onClick={checkEligibility}
            disabled={isAuthLoading}
            className="text-base text-giv-brand-500 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Eligibility
          </button>
        </div>
      )}
      {/* If the user's MBD score is below the threshold for MBD and their passport score is below the threshold for Passport */}
      {account && data && !isUserEligible && (
        <div className="bg-giv-brand-100 py-2.5 px-4 flex flex-wrap md:flex-nowrap items-center justify-center gap-2 text-base">
          <IconWarning width={24} height={24} />
          <Link
            href={PassportLink.href as unknown as Route}
            target={PassportLink.target as HTMLAttributeAnchorTarget}
            className="flex items-center gap-2"
          >
            <span className="text-giv-brand-500! font-normal disabled:opacity-85">
              Go to Passport
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-giv-brand-500" />
          </Link>
          <p className="text-giv-neutral-900">
            to increase your score above{' '}
            <span className="font-bold">
              {globalSettingScore.globalMinimumPassportScore}
            </span>{' '}
            and then click to{' '}
          </p>
          <button
            type="button"
            onClick={checkEligibility}
            disabled={isAuthLoading}
            className="text-base text-giv-brand-500 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Refreshing Score...' : 'Refresh Score'}
          </button>
        </div>
      )}
      {/* Wallet Connected And Has Eligibility Data */}
      {account && data && isUserEligible && !showLoading && (
        <div className="bg-giv-success-200 py-2.5 px-4 flex items-center justify-center gap-2 text-base">
          <BadgeCheck className="w-6 h-6 text-giv-success-600" />
          <p>You donations are eligible to be matched!</p>
        </div>
      )}
    </>
  )
}
