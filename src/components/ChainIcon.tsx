'use client'

import { memo, useState } from 'react'
import { getChainIcon } from '@/lib/helpers/chainHelper'

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
  height = 'h-5',
  width = 'w-5',
}: {
  networkId: number
  height?: string
  width?: string
}) {
  const [imgError, setImgError] = useState(false)
  const iconData = getCachedChainIcon(networkId)
  return (
    <div
      className={`${height} ${width} rounded-full overflow-hidden bg-white flex items-center justify-center`}
    >
      {!imgError ? (
        <img
          src={iconData.iconUrl}
          alt={`${networkId} icon`}
          className={`${height} ${width} object-contain`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`${height} ${width} rounded-full ${iconData.bg} flex items-center justify-center ${
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
