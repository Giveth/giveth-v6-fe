'use client'

import { memo, useState } from 'react'
import { IconArbitrum } from '@/components/icons/chain-networks/IconArbitrum'
import { IconBase } from '@/components/icons/chain-networks/IconBase'
import { IconCelo } from '@/components/icons/chain-networks/IconCelo'
import { IconEthereumClassic } from '@/components/icons/chain-networks/IconEthereumClassic'
import { IconGnosis } from '@/components/icons/chain-networks/IconGnosis'
import { IconMainnet } from '@/components/icons/chain-networks/IconMainnet'
import { IconOptimism } from '@/components/icons/chain-networks/IconOptimism'
import { IconPolygon } from '@/components/icons/chain-networks/IconPolygon'
import { IconPolygonzkEVM } from '@/components/icons/chain-networks/IconPolygonzkEVM'
import { IconSolana } from '@/components/icons/chain-networks/IconSolana'
import { getChainIcon } from '@/lib/helpers/chainHelper'

const CHAIN_ICON_COMPONENTS: Record<
  number,
  React.FC<{ height?: string; width?: string; className?: string }>
> = {
  10: IconOptimism, // Optimism
  11155420: IconOptimism, // Optimism Sepolia
  1: IconMainnet, // Ethereum Mainnet
  11155111: IconMainnet, // Sepolia Mainnet
  5: IconMainnet, // Ethereum Goerli Testnet
  100: IconGnosis, // Gnosis Mainnet
  137: IconPolygon, // Polygon Mainnet
  42220: IconCelo, // Celo Mainnet
  44787: IconCelo, // Celo Alfajores Testnet
  42161: IconArbitrum, // Arbitrum Mainnet
  421614: IconArbitrum, // Arbitrum Sepolia Testnet
  8453: IconBase, // Base Mainnet
  84532: IconBase, // Base Sepolia Testnet
  1101: IconPolygonzkEVM, // Polygon zkEVM Mainnet
  2442: IconPolygonzkEVM, // Polygon zkEVM Cardona Testnet
  61: IconEthereumClassic, // Ethereum Classic Mainnet
  63: IconEthereumClassic, // Ethereum Classic Mordor Testnet
  101: IconSolana, // Solana Mainnet
}

const iconCache = new Map<number, ReturnType<typeof getChainIcon>>()
function getCachedChainIcon(networkId: number) {
  const cached = iconCache.get(networkId)
  if (cached) return cached
  const iconData = getChainIcon(networkId)
  iconCache.set(networkId, iconData)
  return iconData
}

export const ChainIcon = memo(function ChainIcon({
  networkId,
  height = 20,
  width = 20,
  className,
}: {
  networkId: number
  height?: number
  width?: number
  className?: string
}) {
  const [imgError, setImgError] = useState(false)

  // Prefer component if exists
  const IconComponent = CHAIN_ICON_COMPONENTS[networkId]
  if (IconComponent) {
    return (
      <IconComponent
        height={String(height)}
        width={String(width)}
        className={className ?? ''}
      />
    )
  }

  // Fallback to cached image
  const iconData = getCachedChainIcon(networkId)

  return (
    <div
      style={{ height: `${height}px`, width: `${width}px` }}
      className={`h-[${height}px] w-[${width}px] rounded-full overflow-hidden bg-white inline-flex items-center justify-center`}
    >
      {!imgError ? (
        <img
          src={iconData.iconUrl}
          alt={`${networkId} icon`}
          style={{ height: `${height}px`, width: `${width}px` }}
          className={`block h-full w-full object-contain`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`h-[${height}px] w-[${width}px] rounded-full ${iconData.bg} flex items-center justify-center ${
            iconData.textColor || 'text-white'
          } text-xs`}
        >
          {iconData.fallbackIcon}
        </div>
      )}
    </div>
  )
})

ChainIcon.displayName = 'ChainIcon'
