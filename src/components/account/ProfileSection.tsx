'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
// import { Copy, Sparkle } from 'lucide-react'
import { Copy } from 'lucide-react'
import { EnsName } from '@/components/account/EnsName'
// import { IconBoost } from '@/components/icons/IconBoost'
// import { IconDonation } from '@/components/icons/IconDonation'
import { IconPraiseHand } from '@/components/icons/IconPraiseHand'
import { useSiweAuth } from '@/context/AuthContext'
import { useProfile, useUserStats } from '@/hooks/useAccount'
import { formatNumber } from '@/lib/helpers/cartHelper'
import type { Address } from 'thirdweb'

export function ProfileSection() {
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<number | null>(null)
  const { token, walletAddress } = useSiweAuth()
  const { data: profileData, isLoading: isProfileLoading } = useProfile(
    token || undefined,
  )
  const user = profileData?.me

  const { data: userStatsData, isLoading: isUserStatsLoading } = useUserStats(
    user?.id ? Number(user.id) : undefined,
    token || undefined,
  )
  const userStats = userStatsData?.userStats ?? null

  // const { data: statsData } = useUserStats(
  //   user?.id ? Number(user.id) : undefined,
  //   token || undefined,
  // )
  // const stats = statsData // Unused for now

  if (isProfileLoading && !user) {
    return (
      <div className="p-6 bg-white rounded-xl border border-giv-gray-300">
        Loading Profile...
      </div>
    )
  } else if (!user) {
    return (
      <div className="p-6 bg-white rounded-xl border border-giv-gray-300">
        User not found
      </div>
    )
  }

  // Fallbacks
  const displayName = user?.name || user?.firstName || 'Anonymous User'
  const displayEmail = user?.email || 'No email'
  const addressToCopy =
    user?.wallets?.[0]?.address || walletAddress || 'No address'

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(addressToCopy)
      setCopied(true)
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current)
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false)
        copyTimerRef.current = null
      }, 1500)
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl p-6 font-inter">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  width={128}
                  height={128}
                  alt="Profile avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-bold">
                  {displayName[0]}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-2 pt-2">
              <h1 className="text-lg font-bold text-giv-gray-900 mb-1">
                {displayName}
              </h1>
              <p className="text-base text-giv-gray-900">{displayEmail}</p>
              <div className="flex items-center gap-2 text-base">
                <span className="text-giv-gray-900">
                  <EnsName
                    address={
                      user?.wallets?.[0]?.address as Address as `0x${string}`
                    }
                  />
                </span>
                <button
                  className="text text-giv-gray-900 hover:text-giv-primary-500 cursor-pointer"
                  onClick={handleCopyAddress}
                >
                  <Copy className="w-4 h-4" />
                </button>
                {copied && (
                  <span className="text-xs text-giv-primary-500">Copied!</span>
                )}
              </div>
            </div>
          </div>

          {/* <Button
            variant="outline"
            className="border-[#5326ec] text-[#5326ec] hover:bg-[#f6f3ff] bg-transparent"
            onClick={() => setIsEditProfileOpen(true)}
          >
            Edit Profile
          </Button> */}
        </div>

        {/* Stats - Keeping hardcoded for now or mapping if I knew the fields. 
            The hardcoded values were specific so I will just leave them static unless I can verify the API response. 
            "Integrate with BE" suggests I should try. but without schema I might break build.
            I will leave stats hardcoded but commented that they need wiring, or try to wire if I find the type.
        */}
        {userStats && !isUserStatsLoading && (
          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-giv-gray-300">
            <div className="flex items-center justify-start gap-1 text-left text-xs text-giv-neutral-900">
              <span className="mr-2">
                <IconPraiseHand
                  width={18}
                  height={18}
                  fillHand="#1D1E1F"
                  fillHeart="#1D1E1F"
                />
              </span>
              <span className="font-semibold">
                ${formatNumber(user?.totalDonated.toString() || '0')}
              </span>
              <span>Donated to</span>
              <span className="font-semibold">
                {userStats.uniqueProjectsDonatedTo}
              </span>
              <span>Projects</span>
            </div>

            {/* <Sparkle
              className="w-3 h-3 text-giv-neutral-900"
              fill="currentColor"
            />

            <div className="flex items-center justify-start gap-1 text-left text-xs text-giv-neutral-900">
              <span className="mr-2">
                <IconBoost width={18} height={18} fill="#1D1E1F" />
              </span>
              <span>Boosted</span>
              <span className="font-semibold">7</span>
              <span>Projects with</span>
              <span className="font-semibold">7,000,000</span>
              <span>GIVpower</span>
            </div>

            <Sparkle
              className="w-3 h-3 text-giv-neutral-900"
              fill="currentColor"
            />

            <div className="flex items-center justify-start gap-1 text-left text-xs text-giv-neutral-900">
              <span className="mr-2">
                <IconDonation width={18} height={18} fill="#1D1E1F" />
              </span>
              <span className="font-semibold">
                ${formatNumber(userStats.totalReceived.toString() || '0')}
              </span>
              <span>donation received for</span>
              <span className="font-semibold">
                {userStats.projectsWithDonationsCount}
              </span>
              <span>projects</span>
            </div> */}
          </div>
        )}
      </div>

      {/* <EditProfileModal
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        token={token || undefined}
      /> */}
    </>
  )
}
