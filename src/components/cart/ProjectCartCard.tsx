import { useEffect, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { X } from 'lucide-react'
import { ProjectBadges } from '@/components/cart/ProjectBadges'
import { ProjectImage } from '@/components/project/ProjectImage'
import { TokenIcon } from '@/components/TokenIcon'
import { useSiweAuth } from '@/context/AuthContext'
import { useCart, type ProjectCartItem } from '@/context/CartContext'
import { type ActiveQfRoundsQuery } from '@/lib/graphql/generated/graphql'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { normalizeDecimalInput } from '@/lib/helpers/numbersHelper'
import { OPTIMISM_CHAIN_ID, OPTIMISM_USDC_ADDRESS } from '@/lib/thirdweb/client'

export const ProjectCartCard = ({
  roundData,
  project,
  selectedAmountVsDollars,
  showMissingAmountErrors,
}: {
  roundData: ActiveQfRoundsQuery['activeQfRounds'][0]
  project: ProjectCartItem
  selectedAmountVsDollars: number
  showMissingAmountErrors: boolean
}) => {
  const { isAAWallet } = useSiweAuth()
  const { updateProjectDonation, removeFromCart } = useCart()
  const hasMissingAmount = Number(project.donationAmount) <= 0
  const shouldShowMissingAmount = showMissingAmountErrors && hasMissingAmount
  const [usdInputValue, setUsdInputValue] = useState('')
  const [isUsdInputFocused, setIsUsdInputFocused] = useState(false)
  const isUsdEntry = isAAWallet || selectedAmountVsDollars === 1
  const normalizeAmount = (value: number, decimals = 18) => {
    if (!Number.isFinite(value)) return '0'
    return value.toFixed(decimals).replace(/\.?0+$/, '')
  }
  const conversionDecimals = Math.min(project.selectedToken?.decimals ?? 18, 6)
  const formatUsdInputValue = () => {
    const normalizedAmount = Number(project.donationAmount ?? 0)
    const priceInUSD = isAAWallet ? 1 : (project.selectedToken?.priceInUSD ?? 0)
    if (!Number.isFinite(normalizedAmount) || !priceInUSD) return '0'
    return normalizeAmount(normalizedAmount * priceInUSD, 6)
  }

  useEffect(() => {
    if (!isUsdEntry || isUsdInputFocused) return
    setUsdInputValue(formatUsdInputValue())
  }, [
    isAAWallet,
    isUsdEntry,
    isUsdInputFocused,
    project.donationAmount,
    project.selectedToken?.priceInUSD,
  ])

  const handleRemoveItem = (roundId: number, itemId: string) => {
    removeFromCart(roundId, itemId)
  }

  return (
    <div className="px-4 py-4 border border-giv-neutral-300 mb-4 mn-last:mb-0 rounded-xl hover:bg-giv-neutral-200 transition-colors">
      {/* Project Info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link
            href={`/project/${project.slug}`}
            target="_blank"
            className="hover:opacity-80 transition-opacity duration-300"
          >
            <ProjectImage
              src={project.image}
              alt={project.title}
              className="w-14 h-[45px] rounded-md overflow-hidden"
            />
          </Link>
          <Link href={`/project/${project.slug}`} target="_blank">
            <h4 className="text-base font-medium text-giv-neutral-900 hover:text-giv-brand-500 transition-colors duration-300">
              {project.title}
            </h4>
          </Link>
        </div>
        <button
          onClick={() =>
            handleRemoveItem(Number(roundData?.id ?? 0), project.id)
          }
          className={clsx(
            'w-6 h-6 rounded border border-giv-neutral-500',
            'flex items-center justify-center text-giv-neutral-500 hover:border-giv-pink-500 hover:text-giv-pink-500',
            'transition-colors shrink-0 bg-white cursor-pointer',
          )}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Amount Row */}
      <div className="max-[480px]:flex-wrap flex items-center justify-between mt-8 gap-2">
        <div className="flex flex-wrap max-[480px]:w-full md:w-auto gap-2">
          <ProjectBadges project={project} roundData={roundData} />
        </div>

        <div
          className={`flex items-center text-base font-medium gap-2 border rounded-md pr-3 pl-2 py-2 ${
            shouldShowMissingAmount
              ? 'border-red-400'
              : 'border-giv-neutral-100'
          }`}
        >
          {!isAAWallet &&
            project.selectedToken?.symbol &&
            project.selectedToken?.address && (
              <TokenIcon
                tokenSymbol={project.selectedToken.symbol}
                networkId={project.selectedToken.chainId}
                address={project.selectedToken.address}
                height={20}
                width={20}
                isGivbackEligible={project.selectedToken?.isGivbackEligible}
              />
            )}

          {/* If selectedAmountVsDollars is 0, show token amount input */}
          {!isUsdEntry && (
            <>
              <span className="text-giv-neutral-700">
                {project.selectedToken?.symbol ?? ''}
              </span>
              <input
                type="text"
                value={project.donationAmount ?? '0'}
                onChange={e => {
                  updateProjectDonation(
                    Number(roundData?.id ?? 0),
                    project.id,
                    String(e.target.value),
                    project.selectedToken?.symbol ?? '',
                    project.selectedToken?.address ?? '',
                    project.selectedToken?.chainId ?? 0,
                  )
                }}
                autoComplete="off"
                className={clsx(
                  'w-full max-[480px]:w-24 md:w-16 focus:w-28',
                  'transition-[width] duration-200 ease-out text-base p-0',
                  'font-medium text-left text-giv-neutral-900 focus:outline-none',
                )}
              />
            </>
          )}
          {/* If selectedAmountVsDollars is 1 (or AA mode), show amount input in dollars */}
          {isUsdEntry && (
            <>
              $
              <input
                type="text"
                value={usdInputValue}
                onFocus={() => setIsUsdInputFocused(true)}
                onBlur={() => setIsUsdInputFocused(false)}
                onChange={e => {
                  const normalized = normalizeDecimalInput(e.target.value)
                  setUsdInputValue(normalized)
                  if (isAAWallet) {
                    updateProjectDonation(
                      Number(roundData?.id ?? 0),
                      project.id,
                      normalized,
                      project.tokenSymbol ?? 'USDC',
                      project.tokenAddress ??
                        (OPTIMISM_USDC_ADDRESS as `0x${string}`),
                      project.chainId ?? OPTIMISM_CHAIN_ID,
                    )
                    return
                  }

                  const parsed = Number(normalized)
                  if (!Number.isFinite(parsed)) return
                  const priceInUSD = project.selectedToken?.priceInUSD ?? 0
                  if (!priceInUSD) return
                  updateProjectDonation(
                    Number(roundData?.id ?? 0),
                    project.id,
                    normalizeAmount(parsed / priceInUSD, conversionDecimals),
                    project.selectedToken?.symbol ?? '',
                    project.selectedToken?.address ?? '',
                    project.selectedToken?.chainId ?? 0,
                  )
                }}
                autoComplete="off"
                className={clsx(
                  'w-full max-[480px]:w-24 md:w-16 focus:w-28',
                  'transition-[width] duration-200 ease-out text-base p-0',
                  'font-medium text-left text-giv-neutral-900 focus:outline-none',
                )}
              />
            </>
          )}
          <span className="px-2 py-1 bg-giv-neutral-300 rounded-lg text-xs text-giv-neutral-700">
            {isAAWallet && (
              <>
                ${' '}
                {formatNumber(Number(project.donationAmount ?? 0), {
                  minDecimals: 2,
                  maxDecimals: 2,
                })}
              </>
            )}
            {!isAAWallet && selectedAmountVsDollars === 1 && (
              <>
                <span className="text-giv-neutral-700">
                  {project.selectedToken?.symbol ?? ''}
                </span>{' '}
                {formatNumber(Number(project.donationAmount ?? 0))}
              </>
            )}
            {!isAAWallet && selectedAmountVsDollars === 0 && (
              <>
                ${' '}
                {formatNumber(
                  (project.selectedToken?.priceInUSD ?? 0) *
                    Number(project.donationAmount ?? 0),
                )}
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
