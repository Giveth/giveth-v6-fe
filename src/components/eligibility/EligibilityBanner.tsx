import { useMemo, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { ArrowUpRight } from 'lucide-react'
import { type Route } from 'next'
import { useActiveAccount } from 'thirdweb/react'
import { IconRotate } from '@/components/icons/IconRotate'
import { MatchingEligible } from '@/components/icons/MatchingEligible'
import { useSiweAuth } from '@/context/AuthContext'
import { useActiveQfRounds } from '@/hooks/useActiveQfRounds'
import { useGlobalConfiguration } from '@/hooks/useGlobalConfiguration'
import { usePassportEligibility } from '@/hooks/usePassportEligibility'
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

export function EligibilityBanner() {
  const [isChecking, setIsChecking] = useState(false)

  // Get list of active QF rounds
  const activeQfRoundsQuery = useActiveQfRounds()
  const { data: activeQfRoundsData } = activeQfRoundsQuery

  const { signIn, isAuthenticated, isLoading: isAuthLoading } = useSiweAuth()
  const account = useActiveAccount()

  const eligibilityQuery = usePassportEligibility(
    account?.address ? { address: account.address } : undefined,
    { enabled: !!account?.address && isAuthenticated },
  )
  const { data, isLoading: isEligibilityLoading, refetch } = eligibilityQuery

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

  const isTooOld = useMemo(() => {
    const expirationDate =
      data?.checkPassportEligibility?.expirationDate || null
    if (!expirationDate) return false
    const parsed = new Date(expirationDate)
    if (Number.isNaN(parsed.getTime())) return false
    return parsed < new Date()
  }, [data?.checkPassportEligibility?.expirationDate, isEligibilityLoading])

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

  const checkEligibility = async () => {
    if (!account?.address) return

    setIsChecking(true)
    try {
      if (!isAuthenticated) {
        await signIn()
      }
      // After sign-in, the JWT becomes available, so refetch to get fresh eligibility.
      await refetch()
    } catch (error) {
      console.error('Failed to sign in:', error)
    } finally {
      setIsChecking(false)
    }
  }

  // If no active QF rounds, return null (after hooks to keep order stable)
  if (!activeQfRoundsData?.activeQfRounds?.length) return null

  return (
    <>
      {/* Check passport expiration date */}
      {isTooOld && (
        <div className="p-4 space-y-2 border border-giv-warning-600 rounded-2xl">
          <div className="flex items-center gap-2">
            <MatchingEligible
              fill="var(--giv-warning-600)"
              width={20}
              height={20}
            />
            <h4 className="text-lg font-medium text-giv-warning-600 [font-family:var(--font-inter)]">
              QF Donor Eligibility
            </h4>
          </div>

          <div className="flex justify-between items-center gap-3">
            <p className="text-lg font-medium text-giv-gray-900 [font-family:var(--font-inter)]">
              Verify your donor uniqueness with a quick check of your on-chain
              activity.
            </p>
            <button
              type="button"
              onClick={checkEligibility}
              disabled={isAuthLoading}
              className="text-xs font-bold text-giv-pinky-400 font-sans cursor-pointer hover:opacity-85 border-2 border-giv-pinky-400 rounded-3xl px-6 py-3"
            >
              <span className="flex items-center gap-2">
                {isChecking ? 'Checking Eligibility...' : 'Check Eligibility'}
                <IconRotate
                  width={20}
                  height={20}
                  fill="var(--giv-pinky-400)"
                />
              </span>
            </button>
          </div>
        </div>
      )}
      {/* Wallet Connected And Has Eligibility Data */}
      {account && data && isEligible && !showLoading && !isTooOld && (
        <div className="p-4 space-y-2 border border-giv-jade-600 rounded-2xl">
          <div className="flex items-center gap-2">
            <MatchingEligible
              fill="var(--giv-jade-600)"
              width={20}
              height={20}
            />
            <h4 className="text-lg font-medium [font-family:var(--font-inter)] text-giv-jade-600">
              You're QF-eligible!
            </h4>
          </div>

          <div className="flex justify-between items-center gap-3">
            <p className="text-lg font-medium text-giv-gray-900 [font-family:var(--font-inter)]">
              As long as your donations are above the minimum amount for each
              round, they are eligibile to be matched.
            </p>
          </div>
        </div>
      )}
      {/* Wallet Connected And Has No Eligibility Data */}
      {account && data && !isEligible && !isTooOld && (
        <div className="p-4 space-y-2 border border-giv-primary-500 rounded-2xl">
          <div className="flex items-center gap-2">
            <MatchingEligible
              fill="var(--giv-primary-500)"
              width={20}
              height={20}
            />
            <h4 className="text-lg font-medium text-giv-primary-500 [font-family:var(--font-inter)]">
              QF Donor Eligibility
            </h4>
          </div>

          <div className="flex justify-between items-center gap-3">
            <p className="text-lg font-medium text-giv-gray-900 [font-family:var(--font-inter)]">
              Please go to Passport to increase your score to{' '}
              <span className="font-bold">
                over {globalSettingScore.globalMinimumPassportScore.toString()}
              </span>
              , then come back here and click Refresh Score to check.
            </p>
          </div>

          <div className="flex justify-between items-center gap-3 mt-4 border-t border-giv-gray-300 pt-4">
            <div className="flex gap-4">
              <p className="text-lg font-medium text-giv-gray-900 [font-family:var(--font-inter)] rounded-lg py-3 px-4 bg-giv-gray-200">
                <span>Your Passport score</span>
                <span className="font-bold ml-12">
                  {data?.checkPassportEligibility?.passportScore?.toString() ??
                    0}
                </span>
              </p>
              <Link
                href={PassportLink.href as unknown as Route}
                target="_blank"
                className={clsx(
                  'text-xs font-bold text-giv-pinky-400! [font-family:var(--font-inter)]',
                  'cursor-pointer hover:opacity-85 border-2 border-giv-pinky-400 rounded-3xl px-6 py-3',
                )}
              >
                <span className="flex items-center gap-2">
                  Increase Passport Score
                  <ArrowUpRight width={20} height={20} />
                </span>
              </Link>
            </div>
            <button
              onClick={checkEligibility}
              disabled={isAuthLoading}
              className="text-xs font-bold text-giv-pinky-400 cursor-pointer hover:opacity-85 border-2 border-giv-pinky-400 rounded-3xl px-6 py-3"
            >
              <span className="flex items-center gap-2">
                {isChecking ? 'Checking Eligibility...' : 'Check Eligibility'}
                <IconRotate
                  width={20}
                  height={20}
                  fill="var(--giv-pinky-400)"
                />
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
