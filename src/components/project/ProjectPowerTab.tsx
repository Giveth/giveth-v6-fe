'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { type Route } from 'next'
import { type Address } from 'thirdweb'
import { EnsName } from '@/components/account/EnsName'
import { ProjectImage } from '@/components/project/ProjectImage'
import { useProjectBoosters } from '@/hooks/useProject'
import { USER_AVATAR_FALLBACK_IMAGE } from '@/lib/constants/other-constants'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { shortenAddress } from '@/lib/helpers/userHelper'

type ProjectPowerTabProps = {
  projectId: number
}

const TABLE_GRID_COLUMNS = 'grid-cols-[minmax(0,2fr)_minmax(0,1fr)]'

type BoosterRow = {
  id: number
  userName?: string
  avatar?: string | null
  profileAddress?: string
  givpowerAmount: number
}

export function ProjectPowerTab({ projectId }: ProjectPowerTabProps) {
  const { data, isLoading, error } = useProjectBoosters({
    projectId,
    take: 1000,
  })

  const rows = useMemo<BoosterRow[]>(() => {
    const boosts = data?.getPowerBoosting?.powerBoostings ?? []

    return boosts
      .map(boost => {
        const primaryAddress =
          boost.user?.wallets?.find(wallet => wallet.isPrimary)?.address ||
          boost.user?.wallets?.[0]?.address
        const fullName =
          `${boost.user?.firstName || ''} ${boost.user?.lastName || ''}`.trim() ||
          undefined
        const ensName = boost.user?.primaryEns?.trim() || undefined
        const userName =
          ensName ||
          boost.user?.name?.trim() ||
          fullName ||
          (primaryAddress ? undefined : `User #${boost.userId}`)

        return {
          id: boost.id,
          userName,
          avatar: boost.user?.avatar,
          profileAddress: primaryAddress,
          givpowerAmount: Number(boost.givpowerAmount || 0),
        }
      })
      .filter(row => row.givpowerAmount > 0)
      .sort((a, b) => b.givpowerAmount - a.givpowerAmount)
  }, [data?.getPowerBoosting?.powerBoostings])

  const totalGivpowerAmount = useMemo(
    () => rows.reduce((sum, row) => sum + row.givpowerAmount, 0),
    [rows],
  )
  if (isLoading) {
    return (
      <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
        <div className="flex items-center justify-center py-12 text-giv-neutral-700">
          Loading GIVpower boosters...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
        <div className="rounded-xl border border-giv-error-400 bg-giv-error-100 p-4 text-giv-error-400">
          Failed to load project boosters.
        </div>
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
        <div className="text-center py-12">
          <div className="text-giv-neutral-700 text-lg">No boosts yet.</div>
          <div className="text-giv-neutral-700 text-sm mt-2">
            When users boost this project, they will appear here.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
      <h2 className="mb-6 text-2xl font-bold text-giv-neutral-900">
        GIVpower Summary
      </h2>

      <div className="space-y-3">
        <div
          className={`grid items-center gap-4 rounded-xl bg-giv-neutral-300 px-4 py-3 text-lg font-bold text-giv-neutral-800 ${TABLE_GRID_COLUMNS}`}
        >
          <div>User</div>
          <div>GIVpower Amount</div>
        </div>

        {rows.map((row, index) => (
          <div
            key={row.id}
            className={`grid items-center gap-4 rounded-xl px-4 py-3 text-lg font-medium text-giv-neutral-800 ${TABLE_GRID_COLUMNS} ${
              index % 2 === 0 ? 'bg-white' : 'bg-giv-neutral-200'
            }`}
          >
            <div className="min-w-0 truncate">
              {(() => {
                const donorAddress = row.profileAddress
                  ? (row.profileAddress as Address as `0x${string}`)
                  : null
                const donorAlt =
                  row.userName ||
                  (donorAddress
                    ? shortenAddress(donorAddress)
                    : `User #${row.id}`)

                return donorAddress ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <ProjectImage
                        src={row.avatar || USER_AVATAR_FALLBACK_IMAGE}
                        alt={donorAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Link
                      href={`/user/${donorAddress}` as Route}
                      className="text-base! hover:text-giv-brand-500! truncate"
                    >
                      {row.userName || <EnsName address={donorAddress} />}
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <ProjectImage
                        src={row.avatar || USER_AVATAR_FALLBACK_IMAGE}
                        alt={donorAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="truncate">{donorAlt}</span>
                  </div>
                )
              })()}
            </div>

            <div className="tabular-nums">
              {formatNumber(row.givpowerAmount, {
                minDecimals: 2,
                maxDecimals: 2,
                locale: 'en-US',
              })}
            </div>
          </div>
        ))}

        <div
          className={`grid items-center gap-4 px-4 py-2 text-lg font-bold text-giv-neutral-800 ${TABLE_GRID_COLUMNS}`}
        >
          <div>Total GIVpower</div>
          <div className="tabular-nums">
            {formatNumber(totalGivpowerAmount, {
              minDecimals: 2,
              maxDecimals: 2,
              locale: 'en-US',
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
