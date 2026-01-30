import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'
import { ProjectBadges } from '@/components/cart/ProjectBadges'
import { ProjectImage } from '@/components/project/ProjectImage'
import { TokenIcon } from '@/components/TokenIcon'
import { useCart, type ProjectCartItem } from '@/context/CartContext'
import { type ActiveQfRoundsQuery } from '@/lib/graphql/generated/graphql'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { normalizeDecimalInput } from '@/lib/helpers/numbersHelper'

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
  const { updateProjectDonation, removeFromCart } = useCart()
  const hasMissingAmount = Number(project.donationAmount) <= 0
  const shouldShowMissingAmount = showMissingAmountErrors && hasMissingAmount
  const [usdInputValue, setUsdInputValue] = useState('')
  const normalizeAmount = (value: number, decimals = 18) => {
    if (!Number.isFinite(value)) return '0'
    return value.toFixed(decimals).replace(/\.?0+$/, '')
  }
  const conversionDecimals = Math.min(project.selectedToken?.decimals ?? 18, 6)
  const formatUsdInputValue = () => {
    const normalizedAmount = Number(project.donationAmount ?? 0)
    const priceInUSD = project.selectedToken?.priceInUSD ?? 0
    if (!Number.isFinite(normalizedAmount) || !priceInUSD) return '0'
    return normalizeAmount(normalizedAmount * priceInUSD, 6)
  }

  useEffect(() => {
    if (selectedAmountVsDollars !== 1) return
    setUsdInputValue(formatUsdInputValue())
  }, [
    selectedAmountVsDollars,
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
          <ProjectImage
            src={project.image}
            alt={project.title}
            className="w-14 h-[45px] rounded-md overflow-hidden"
          />
          <h4 className="text-base font-medium text-giv-neutral-900">
            {project.title}
          </h4>
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
          {project.selectedToken?.symbol && project.selectedToken?.address && (
            <TokenIcon
              tokenSymbol={project.selectedToken.symbol}
              networkId={project.selectedToken.chainId}
              address={project.selectedToken.address}
              height={20}
              width={20}
              isGivbackEligible={project.selectedToken?.isGivbackEligible}
            />
          )}

          {/* If selectedAmountVsDollars is 0, show the amount input */}
          {selectedAmountVsDollars === 0 && (
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
          {/* If selectedAmountVsDollars is 1, show the amount input in dollars */}
          {selectedAmountVsDollars === 1 && (
            <>
              $
              <input
                type="text"
                value={usdInputValue}
                onChange={e => {
                  const normalized = normalizeDecimalInput(e.target.value)
                  setUsdInputValue(normalized)
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
            {selectedAmountVsDollars === 1 && (
              <>
                <span className="text-giv-neutral-700">
                  {project.selectedToken?.symbol ?? ''}
                </span>{' '}
                {formatNumber(Number(project.donationAmount ?? 0))}
              </>
            )}
            {selectedAmountVsDollars === 0 && (
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
