import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { useActiveAccount } from 'thirdweb/react'
import { type Address, formatUnits } from 'viem'
import RewardsClaimModal from '@/components/account/staking-rewards/RewardsClaimModal'
import { STAKING_POOLS } from '@/lib/constants/staking-power-constants'
import { getTokenPriceInUSDByCoingeckoId } from '@/lib/helpers/cartHelper'
import { fetchUserOverview, formatToken } from '@/lib/helpers/stakeHelper'

const CLAIM_SYNC_DELAY_MS = 12_000
const CLAIM_SYNC_RETRY_MS = 10_000
const CLAIM_SYNC_MAX_ATTEMPTS = 9

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
  const [error, setError] = useState<string | null>(null)
  const [tokenPriceUsd, setTokenPriceUsd] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClaimOptimistic, setIsClaimOptimistic] = useState(false)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const syncSessionIdRef = useRef(0)
  const currentContextRef = useRef<{
    address: `0x${string}` | undefined
    chainId: number
  }>({
    address: undefined,
    chainId: selectedChain,
  })
  const latestTotalClaimableRef = useRef<bigint>(0n)
  const latestFetchDataRef = useRef<
    (() => Promise<Awaited<ReturnType<typeof fetchUserOverview>> | null>) | null
  >(null)

  const account = useActiveAccount()

  const fetchData = useCallback(async () => {
    const address = account?.address as `0x${string}` | undefined
    if (!address) {
      setData(null)
      return null
    }

    const requestContext = {
      address,
      chainId: selectedChain,
    }

    try {
      const rewardsData = await fetchUserOverview(
        requestContext.address,
        requestContext.chainId,
      )
      const activeContext = currentContextRef.current
      const isSameContext =
        activeContext.address === requestContext.address &&
        activeContext.chainId === requestContext.chainId

      if (!isSameContext) {
        return null
      }

      setData(rewardsData)
      setError(null)
      return rewardsData
    } catch (err) {
      const activeContext = currentContextRef.current
      const isSameContext =
        activeContext.address === requestContext.address &&
        activeContext.chainId === requestContext.chainId
      if (!isSameContext) {
        return null
      }
      setError(err instanceof Error ? err.message : 'Failed to load rewards')
      return null
    }
  }, [account?.address, selectedChain])

  useEffect(() => {
    latestFetchDataRef.current = fetchData
  }, [fetchData])

  useEffect(() => {
    currentContextRef.current = {
      address: account?.address as `0x${string}` | undefined,
      chainId: selectedChain,
    }
    fetchData()
  }, [account?.address, selectedChain, fetchData])

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    syncSessionIdRef.current += 1
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = null
    }
    setIsClaimOptimistic(false)
  }, [account?.address, selectedChain])

  // Fetch token price
  useEffect(() => {
    const fetchPrice = async () => {
      const coingeckoId =
        STAKING_POOLS[selectedChain]?.GIVPOWER?.coingeckoId ?? 'giveth'
      if (!coingeckoId) {
        setTokenPriceUsd(0)
        return
      }
      const price = await getTokenPriceInUSDByCoingeckoId(coingeckoId)
      setTokenPriceUsd(price || 0)
    }

    fetchPrice()
  }, [selectedChain])

  if (error) {
    console.error(error)
  }

  const tokenDecimals = STAKING_POOLS[selectedChain]?.GIVPOWER?.decimals ?? 18
  const tokenSymbol = STAKING_POOLS[selectedChain]?.GIVPOWER?.unit || 'GIV'
  const stakingClaimable = data?.staking?.claimable ?? 0n
  const givbacksLiquid = data?.givbacks?.givbackLiquidPart ?? 0n
  const givfarmAmount = stakingClaimable
  const givbacksAmount = givbacksLiquid
  const givstreamAmount = data?.givbacks?.streamableAmount ?? 0n
  const totalClaimableRaw = givbacksAmount + givfarmAmount + givstreamAmount
  const totalClaimable = isClaimOptimistic ? 0n : totalClaimableRaw
  const givstreamRate = data?.givbacks?.streaming ?? 0n
  const givbacksRate = data?.givbacks?.givbackStream ?? 0n
  const givfarmRate = data?.staking?.streaming ?? 0n

  useEffect(() => {
    latestTotalClaimableRef.current = totalClaimableRaw
  }, [totalClaimableRaw])

  // Convert once to human units
  const totalClaimableGiv = parseFloat(
    formatUnits(totalClaimable, tokenDecimals),
  )
  const totalClaimableUsd = totalClaimableGiv * tokenPriceUsd

  const totalClaimableLabel = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalClaimableGiv)

  const totalUsdLabel = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalClaimableUsd)

  const formatTokenRate = (value: bigint) => {
    const numeric = parseFloat(formatUnits(value, tokenDecimals))
    if (numeric > 0 && numeric < 0.0001) {
      return `<0.0001 ${tokenSymbol}/week`
    }
    return `${new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric)} ${tokenSymbol}/week`
  }

  const tokenDistroAddress = STAKING_POOLS[selectedChain]?.TOKEN_DISTRO_ADDRESS
  const givpowerLmAddress =
    STAKING_POOLS[selectedChain]?.GIVPOWER?.LM_ADDRESS || undefined
  const stakedAmount = data?.staking?.staked ?? 0n

  const handleClaimSuccess = useCallback(() => {
    // Show zero immediately after successful claim; backend/indexer sync can lag.
    setIsClaimOptimistic(true)
    const baselineClaimable = latestTotalClaimableRef.current
    const claimSessionId = syncSessionIdRef.current + 1
    syncSessionIdRef.current = claimSessionId

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = null
    }

    const runSync = async (attempt: number) => {
      if (syncSessionIdRef.current !== claimSessionId) {
        return
      }

      const refreshed = await latestFetchDataRef.current?.()
      if (syncSessionIdRef.current !== claimSessionId) {
        return
      }

      if (refreshed) {
        const refreshedClaimable =
          (refreshed.staking?.claimable ?? 0n) +
          (refreshed.givbacks?.givbackLiquidPart ?? 0n) +
          (refreshed.givbacks?.streamableAmount ?? 0n)

        if (refreshedClaimable < baselineClaimable) {
          setIsClaimOptimistic(false)
          return
        }
      }

      if (attempt >= CLAIM_SYNC_MAX_ATTEMPTS) {
        setIsClaimOptimistic(false)
        return
      }

      syncTimeoutRef.current = setTimeout(() => {
        void runSync(attempt + 1)
      }, CLAIM_SYNC_RETRY_MS)
    }

    syncTimeoutRef.current = setTimeout(() => {
      void runSync(0)
    }, CLAIM_SYNC_DELAY_MS)
  }, [])

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
        onClaimSuccess={handleClaimSuccess}
        account={account}
        chainId={selectedChain}
        tokenDistroAddress={tokenDistroAddress as Address | undefined}
        givpowerLmAddress={givpowerLmAddress as Address | undefined}
        stakedAmount={stakedAmount}
        totalGiv={totalClaimableLabel}
        totalUsd={`$${totalUsdLabel}`}
        streamRate={formatTokenRate(givstreamRate + givfarmRate)}
        givstreamAmount={`${formatToken(givstreamAmount, tokenDecimals)} ${tokenSymbol}`}
        givstreamRate={formatTokenRate(givstreamRate)}
        givbacksAmount={`${formatToken(givbacksAmount, tokenDecimals)} ${tokenSymbol}`}
        givbacksRate={formatTokenRate(givbacksRate)}
        givfarmAmount={`${formatToken(givfarmAmount, tokenDecimals)} ${tokenSymbol}`}
        givfarmRate={`+${formatTokenRate(givfarmRate)}`}
        totalRate={formatTokenRate(givstreamRate + givfarmRate)}
      />
    </div>
  )
}
