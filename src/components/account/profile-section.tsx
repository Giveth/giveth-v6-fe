'use client'

import { Copy } from 'lucide-react'
import { useSiweAuth } from '@/context/AuthContext'
import { useProfile, useUserStats } from '@/hooks/useAccount'

export function ProfileSection() {
  const { token, walletAddress } = useSiweAuth()
  const { data: profileData, isLoading: isProfileLoading } = useProfile(
    token || undefined,
  )
  const user = profileData?.me

  const { data: statsData, isLoading: isStatsLoading } = useUserStats(
    user?.id ? Number(user.id) : undefined,
    token || undefined,
  )
  const stats = statsData?.userStats

  if (isProfileLoading && !user) {
    return (
      <div className="p-6 bg-white rounded-xl border border-[#ebecf2]">
        Loading Profile...
      </div>
    )
  } else if (!user) {
    return (
      <div className="p-6 bg-white rounded-xl border border-[#ebecf2]">
        User not found
      </div>
    )
  }

  // Fallbacks
  const displayName = user?.name || user?.firstName || 'Anonymous User'
  const displayEmail = user?.email || 'No email'
  const displayAddress =
    user?.wallets?.[0]?.address || walletAddress || 'No address'
  const shortAddress =
    displayAddress.length > 10
      ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`
      : displayAddress

  return (
    <>
      <div className="bg-white rounded-xl border border-[#ebecf2] p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              {user?.avatar ? (
                <img
                  src={user.avatar}
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
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[#1f2333]">
                {displayName}
              </h1>
              <p className="text-sm text-[#82899a]">{displayEmail}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#82899a] font-mono">{shortAddress}</span>
                <button
                  className="text-[#82899a] hover:text-[#5326ec]"
                  onClick={() => navigator.clipboard.writeText(displayAddress)}
                >
                  <Copy className="w-4 h-4" />
                </button>
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

        {/* User Stats */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-[#ebecf2]">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#82899a]">💰</span>
            <span className="font-bold text-[#1f2333]">
              {isStatsLoading
                ? '...'
                : `$${(stats?.totalDonated ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
            <span className="text-[#82899a]">Donated to</span>
            <span className="font-semibold text-[#1f2333]">
              {isStatsLoading ? '...' : (stats?.uniqueProjectsDonatedTo ?? 0)}
            </span>
            <span className="text-[#82899a]">Projects</span>
          </div>

          <div className="w-px h-4 bg-[#ebecf2]" />

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#82899a]">❤️</span>
            <span className="text-[#82899a]">Liked</span>
            <span className="font-semibold text-[#1f2333]">
              {isStatsLoading ? '...' : (stats?.likedProjectsCount ?? 0)}
            </span>
            <span className="text-[#82899a]">Projects</span>
          </div>

          <div className="w-px h-4 bg-[#ebecf2]" />

          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#82899a]">💵</span>
            <span className="font-bold text-[#1f2333]">
              {isStatsLoading
                ? '...'
                : `$${(stats?.totalReceived ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
            <span className="text-[#82899a]">received for</span>
            <span className="font-semibold text-[#1f2333]">
              {isStatsLoading
                ? '...'
                : (stats?.projectsWithDonationsCount ?? 0)}
            </span>
            <span className="text-[#82899a]">projects</span>
          </div>
        </div>
      </div>

      {/* <EditProfileModal
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        token={token || undefined}
      /> */}
    </>
  )
}
