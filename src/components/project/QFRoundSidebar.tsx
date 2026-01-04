import { useState, type SyntheticEvent } from 'react'
import { Check, Copy } from 'lucide-react'
import { getChainIcon } from '@/lib/helpers/chainHelper'

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
}

function ChainIcon({ networkId }: { networkId: number }) {
  const iconData = getChainIcon(networkId)
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden bg-white flex items-center justify-center">
      <img
        src={iconData.iconUrl}
        alt={`${networkId} icon`}
        className="w-4 h-4 object-contain"
        onError={(event: SyntheticEvent<HTMLImageElement>) => {
          const target = event.currentTarget
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `<div class="w-5 h-5 rounded-full ${iconData.bg} flex items-center justify-center ${iconData.textColor || 'text-white'} text-xs">${iconData.fallbackIcon}</div>`
          }
        }}
      />
    </div>
  )
}

export function QFRoundSidebar({ project }: QFRoundSidebarProps) {
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
  return (
    <div className="bg-white rounded-xl border border-[#ebecf2] p-6">
      <h3 className="text-sm font-medium text-[#1f2333] mb-4">
        QF round 3 donations
      </h3>

      <div className="mb-4">
        <span className="text-3xl font-bold text-[#1f2333]">
          ${project.totalDonations.toFixed(2)}
        </span>
        <p className="text-sm text-[#82899a]">
          Raised from{' '}
          <span className="text-[#5326ec] font-medium">
            {project.countUniqueDonors || 0}
          </span>{' '}
          contributors
        </p>
      </div>

      <div className="border-t border-[#ebecf2] pt-4">
        <p className="text-sm text-[#82899a] mb-3">Project recipient address</p>
        <div className="space-y-2">
          {recipientAddresses.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 p-2 bg-[#f7f7f9] rounded-lg"
            >
              <span className="text-xs text-[#82899a] font-mono truncate flex-1">
                {item.address.slice(0, 10)}...{item.address.slice(-8)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyAddress(item.address)}
                  className={`transition-colors ${
                    copiedAddress === item.address
                      ? 'text-green-500'
                      : 'text-[#82899a] hover:text-[#5326ec]'
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
                <ChainIcon networkId={item.networkId} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
