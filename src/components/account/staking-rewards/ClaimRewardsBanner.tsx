import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useActiveAccount } from 'thirdweb/react'
import { formatUnits } from 'viem'
import { STAKING_POOLS } from '@/lib/constants/staking-power-constants'
import { getTokenPriceInUSDByCoingeckoId } from '@/lib/helpers/cartHelper'
import { fetchUserOverview } from '@/lib/helpers/stakeHelper'

export const ClaimRewardsBanner = ({
  selectedChain,
  chainLabel,
}: {
  selectedChain: number
  chainLabel: string
}) => {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchUserOverview>
  > | null>(null)
  const [isLoading, _setIsLoading] = useState(false)
  const [error, _setError] = useState<string | null>(null)
  const [tokenPriceUsd, setTokenPriceUsd] = useState(0)

  const account = useActiveAccount()

  useEffect(() => {
    const fetchData = async () => {
      if (!account?.address) return
      try {
        const data = await fetchUserOverview(
          account.address as `0x${string}`,
          selectedChain,
        )
        setData(data)
      } catch (err) {
        _setError(err instanceof Error ? err.message : 'Failed to load rewards')
      }
    }
    fetchData()
  }, [account?.address, selectedChain])

  // Fetch token price
  useEffect(() => {
    const fetchPrice = async () => {
      const coingeckoId = STAKING_POOLS[selectedChain]?.GIVPOWER?.coingeckoId
      if (!coingeckoId) {
        setTokenPriceUsd(0)
        return
      }
      const price = await getTokenPriceInUSDByCoingeckoId(coingeckoId)
      setTokenPriceUsd(price || 0)
    }

    fetchPrice()
  }, [selectedChain])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    console.error(error)
  }

  const givbacksClaimable = data?.givbacks?.claimable ?? 0n
  const locksClaimable = data?.givbacks?.claimableFromLocks ?? 0n
  const stakingClaimable = data?.staking?.claimable ?? 0n
  const givbacksEffective =
    locksClaimable > givbacksClaimable ? locksClaimable : givbacksClaimable
  const totalClaimable = givbacksEffective + stakingClaimable

  // Convert once to human units
  const totalClaimableGiv = parseFloat(formatUnits(totalClaimable, 18))
  const totalClaimableUsd = totalClaimableGiv * tokenPriceUsd

  const totalClaimableLabel = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalClaimableGiv)

  const totalUsdLabel = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalClaimableUsd)

  return (
    <div
      className={clsx(
        'flex flex-col gap-6 md:flex-row md:items-center justify-between px-6 py-7',
        'bg-white',
        'rounded-2xl shadow-[0_3px_20px_rgba(212,218,238,0.7)]',
      )}
    >
      <div className="text-giv-neutral-900 font-medium">
        <div className="text-lg font-bold">Total GIV claimable</div>
        <div className="mt-1 text-base">on {chainLabel}</div>
      </div>

      <div className="text-center md:text-left text-giv-neutral-900">
        <div className="text-3xl font-semibold">{totalClaimableLabel} GIV</div>
        <div className="mt-1 text-xl">~${totalUsdLabel}</div>
      </div>

      <button
        type="button"
        className={clsx(
          'w-auto py-3 px-8 bg-giv-brand-300! text-white! rounded-md text-sm font-bold',
          'flex items-center justify-center gap-2 hover:bg-giv-brand-400! transition-colors cursor-pointer',
        )}
      >
        Claim Rewards
      </button>
    </div>
  )
}
