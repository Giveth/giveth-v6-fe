import { ArrowUpRight } from 'lucide-react'
import { MatchingEligible } from '@/components/icons/MatchingEligible'
import { IconRotate } from '../icons/IconRotate'

export function EligibilityBanner() {
  return (
    <>
      <div className="p-4 space-y-2 border border-giv-jade-600 rounded-2xl">
        <div className="flex items-center gap-2">
          <MatchingEligible fill="var(--giv-jade-600)" width={20} height={20} />
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
          <button className="text-xs font-bold text-giv-pinky-400 font-sans cursor-pointer hover:opacity-85 border-2 border-giv-pinky-400 rounded-3xl px-6 py-3">
            <span className="flex items-center gap-2">
              Check Eligibility
              <IconRotate width={20} height={20} fill="var(--giv-pinky-400)" />
            </span>
          </button>
        </div>
      </div>
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
            <span className="font-bold">over 12</span>, then come back here and
            click Refresh Score to check.
          </p>
        </div>

        <div className="flex justify-between items-center gap-3 mt-4 border-t border-giv-gray-300 pt-4">
          <div className="flex gap-4">
            <p className="text-lg font-medium text-giv-gray-900 [font-family:var(--font-inter)] rounded-lg py-3 px-4 bg-giv-gray-200">
              <span>Your Passport score</span>
              <span className="font-bold ml-12">10</span>
            </p>
            <button className="text-xs font-bold text-giv-pinky-400 [font-family:var(--font-inter)] cursor-pointer hover:opacity-85 border-2 border-giv-pinky-400 rounded-3xl px-6 py-3">
              <span className="flex items-center gap-2">
                Increase Passport Score
                <ArrowUpRight width={20} height={20} />
              </span>
            </button>
          </div>
          <button className="text-xs font-bold text-giv-pinky-400 cursor-pointer hover:opacity-85 border-2 border-giv-pinky-400 rounded-3xl px-6 py-3">
            <span className="flex items-center gap-2">
              Check Eligibility
              <IconRotate width={20} height={20} fill="var(--giv-pinky-400)" />
            </span>
          </button>
        </div>
      </div>
    </>
  )
}
