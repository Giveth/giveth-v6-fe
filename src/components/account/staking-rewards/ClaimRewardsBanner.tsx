import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useActiveAccount } from 'thirdweb/react'
import { type Address, formatUnits } from 'viem'
import RewardsClaimModal from '@/components/account/staking-rewards/RewardsClaimModal'
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
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const stakingClaimable = data?.staking?.claimable ?? 0n
  const givbacksLiquid = data?.givbacks?.givbackLiquidPart ?? 0n
  const givfarmAmount = stakingClaimable
  const givbacksAmount = givbacksLiquid
  const givstreamAmount = data?.givbacks?.streamableAmount ?? 0n
  const totalClaimable = givbacksAmount + givfarmAmount + givstreamAmount
  const givstreamRate = data?.givbacks?.streaming ?? 0n
  const givfarmRate = data?.staking?.streaming ?? 0n

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

  const formatGiv = (value: bigint) =>
    new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(formatUnits(value, 18)))

  const formatGivRate = (value: bigint) =>
    `${new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(formatUnits(value, 18)))} GIV/week`

  const tokenDistroAddress = STAKING_POOLS[selectedChain]?.TOKEN_DISTRO_ADDRESS
  const givpowerLmAddress = STAKING_POOLS[selectedChain]?.GIVPOWER?.LM_ADDRESS
  const stakedAmount = data?.staking?.staked ?? 0n

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
        onClick={() => setIsModalOpen(true)}
        className={clsx(
          'w-auto py-3 px-8 bg-giv-brand-300! text-white! rounded-md text-sm font-bold',
          'flex items-center justify-center gap-2 hover:bg-giv-brand-400! transition-colors cursor-pointer',
        )}
      >
        Claim Rewards
      </button>

      <RewardsClaimModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        account={account}
        chainId={selectedChain}
        tokenDistroAddress={tokenDistroAddress as Address | undefined}
        givpowerLmAddress={givpowerLmAddress as Address | undefined}
        stakedAmount={stakedAmount}
        totalGiv={totalClaimableLabel}
        totalUsd={`$${totalUsdLabel}`}
        streamRate={formatGivRate(givstreamRate + givfarmRate)}
        givstreamAmount={`${formatGiv(givstreamAmount)} GIV`}
        givstreamRate={formatGivRate(givstreamRate)}
        givbacksAmount={`${formatGiv(givbacksAmount)} GIV`}
        givfarmAmount={`${formatGiv(givfarmAmount)} GIV`}
        givfarmRate={`+${formatGivRate(givfarmRate)}`}
        totalRate={formatGivRate(givstreamRate + givfarmRate)}
      />
    </div>
  )
}
