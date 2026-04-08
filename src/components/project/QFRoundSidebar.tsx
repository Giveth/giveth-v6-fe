import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { type Address } from 'thirdweb'
import { EnsName } from '@/components/account/EnsName'
import { ChainIcon } from '@/components/ChainIcon'
import { getTransactionExplorerUrl } from '@/lib/constants/chain'
import type { ProjectBySlugQuery } from '@/lib/graphql/generated/graphql'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { useProjectQfRoundHistory } from '@/lib/helpers/projectHelper'

interface QFRoundSidebarProps {
  project: {
    id: string
    totalDonations: number
    countUniqueDonors?: number | null | undefined
    addresses?: Array<{
      address: string
      networkId: number
      chainType: string
    }> | null
  }
  selectedRound?: NonNullable<
    NonNullable<ProjectBySlugQuery['projectBySlug']['projectQfRounds']>[number]
  >
}

export function QFRoundSidebar({
  project,
  selectedRound,
}: QFRoundSidebarProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  // Transform addresses to match expected format
  const recipientAddresses = (project.addresses || []).map(addr => ({
    address: addr.address,
    networkId: addr.networkId,
  }))

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }
  const totalDonations =
    selectedRound?.sumDonationValueUsd ?? project.totalDonations

  const countUniqueDonors =
    (selectedRound?.countUniqueDonors ?? project.countUniqueDonors) || 0

  const { data: qfRoundHistory } = useProjectQfRoundHistory(
    Number(project.id ?? 0),
    Number(selectedRound?.qfRound?.id ?? 0),
  )

  const isRoundActive = selectedRound?.qfRound?.isActive
  const hasDistributedFund = qfRoundHistory?.distributedFund?.amount != null
  const notDistributedFund = !hasDistributedFund && !isRoundActive
  const showMatchingFunds = !isRoundActive && hasDistributedFund

  return (
    <div className="bg-white rounded-xl shadow-[0px_3px_20px_rgba(212,218,238,0.4)] p-4">
      <h3 className="text-base font-medium text-giv-neutral-900 border-b border-giv-neutral-300 pb-2 mb-4">
        {selectedRound?.qfRound?.name
          ? `${selectedRound.qfRound.name} donations`
          : 'All donations'}
      </h3>

      <div className="mb-4">
        <span className="text-[52px] font-bold text-giv-neutral-900">
          $
          {formatNumber(totalDonations, {
            minDecimals: 2,
            maxDecimals: 2,
          })}
        </span>
        <p className="text-base text-giv-neutral-700">
          Raised from{' '}
          <span className="text-giv-neutral-900 font-medium">
            {countUniqueDonors || 0}
          </span>{' '}
          contributors
        </p>
      </div>

      {notDistributedFund && selectedRound && (
        <div className="mb-2">
          <div className="flex bg-gray-200 py-4 px-2.5 rounded-xl mt-2">
            <div className="flex flex-col gap-2">
              <h6 className="font-bold text-base">
                Matching funds coming soon...
              </h6>
              <div className="border-t border-gray-300 pt-2">
                <span className="inline-block font-bold text-gray-900 whitespace-nowrap">
                  {selectedRound?.qfRound?.name}&nbsp;
                </span>
                <p className="inline text-gray-900">
                  funds have not yet been sent. Please check back later.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMatchingFunds && selectedRound && (
        <div className="flex flex-col bg-gray-200 py-4 pb-1 px-2 rounded-xl mt-2">
          <div className="flex justify-between">
            <h5 className="text-green-600 font-bold text-xl">
              +
              {qfRoundHistory?.allocatedFundUSDPreferred
                ? '$' +
                  formatNumber(
                    qfRoundHistory?.distributedFund?.amountUsd ?? 0,
                    {
                      minDecimals: 2,
                      maxDecimals: 3,
                    },
                  )
                : formatNumber(qfRoundHistory?.distributedFund?.amount ?? 0, {
                    minDecimals: 2,
                    maxDecimals: 3,
                  })}{' '}
              {qfRoundHistory?.allocatedFundUSDPreferred
                ? ''
                : qfRoundHistory?.distributedFund?.currency}
            </h5>
            <span className="text-green-600 font-semibold text-sm max-w-[80px] leading-tight">
              Matching Funds
            </span>
          </div>

          {qfRoundHistory?.distributedFund?.txHash && (
            <div className="mt-2 pt-2 border-t border-gray-300">
              <Link
                href={{
                  pathname: getTransactionExplorerUrl(
                    Number(qfRoundHistory.distributedFund?.networkId),
                    qfRoundHistory.distributedFund?.txHash,
                  ),
                }}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center w-full text-giv-pink-400! hover:text-giv-brand-700! transition-colors"
              >
                View transaction &nbsp;
                <ExternalLink className="w-3.5 h-3.5 text-current" />
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="pt-4">
        <p className="text-base text-giv-neutral-700 mb-3">
          Project recipient address
        </p>
        <div className="space-y-2">
          {recipientAddresses.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 p-2 bg-giv-neutral-200 rounded-lg"
            >
              <span className="text-xs text-giv-neutral-700 truncate flex-1">
                <EnsName
                  address={item.address as Address as `0x${string}`}
                  startLength={10}
                  endLength={8}
                />
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyAddress(item.address)}
                  className={`transition-colors cursor-pointer ${
                    copiedAddress === item.address
                      ? 'text-giv-success-500'
                      : 'text-giv-neutral-800 hover:text-giv-brand-500'
                  }`}
                  title={
                    copiedAddress === item.address ? 'Copied!' : 'Copy address'
                  }
                >
                  {copiedAddress === item.address ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <ChainIcon networkId={item.networkId} height={20} width={20} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
