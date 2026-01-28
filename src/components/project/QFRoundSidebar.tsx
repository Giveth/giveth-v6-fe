import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { type Address } from 'thirdweb'
import { EnsName } from '@/components/account/EnsName'
import { ChainIcon } from '@/components/ChainIcon'
import type { ProjectBySlugQuery } from '@/lib/graphql/generated/graphql'
import { formatNumber } from '@/lib/helpers/cartHelper'

interface QFRoundSidebarProps {
  project: {
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
  return (
    <div className="bg-white rounded-xl shadow-[0px_3px_20px_rgba(212,218,238,0.4)] p-4">
      <h3 className="text-base font-medium text-giv-gray-900 border-b border-giv-gray-300 pb-2 mb-4">
        {selectedRound?.qfRound?.name
          ? `${selectedRound.qfRound.name} donations`
          : 'All donations'}
      </h3>

      <div className="mb-4">
        <span className="text-[52px] font-adventor font-bold text-giv-gray-900">
          $
          {formatNumber(totalDonations, {
            minDecimals: 2,
            maxDecimals: 2,
          })}
        </span>
        <p className="text-base text-giv-gray-700">
          Raised from{' '}
          <span className="text-giv-gray-900 font-medium">
            {countUniqueDonors || 0}
          </span>{' '}
          contributors
        </p>
      </div>

      <div className="pt-4">
        <p className="text-base text-giv-gray-700 mb-3">
          Project recipient address
        </p>
        <div className="space-y-2">
          {recipientAddresses.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 p-2 bg-giv-gray-200 rounded-lg"
            >
              <span className="text-xs text-giv-gray-700 truncate flex-1">
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
                      ? 'text-giv-jade-500'
                      : 'text-giv-gray-800 hover:text-giv-primary-500'
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
