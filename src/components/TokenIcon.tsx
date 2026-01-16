'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import { defineChain } from 'thirdweb/chains'
import { TokenIcon as ThirdwebTokenIcon, TokenProvider } from 'thirdweb/react'
import { thirdwebClient } from '@/lib/thirdweb/client'

const tokenIconCache = new Map<string, string | null>()
const tokenImageExtensions = ['svg', 'png']
const chainCache = new Map<number, ReturnType<typeof defineChain>>()
function getCachedChain(chainId: number) {
  const cached = chainCache.get(chainId)
  if (cached) return cached
  const chain = defineChain(chainId)
  chainCache.set(chainId, chain)
  return chain
}

export const TokenIcon = memo(function TokenIcon({
  tokenSymbol,
  networkId,
  chainId,
  address,
  height = 20,
  width = 20,
  className,
}: {
  tokenSymbol: string
  networkId?: number
  chainId?: number
  address?: `0x${string}`
  height?: number
  width?: number
  className?: string
}) {
  const [localIconUrl, setLocalIconUrl] = useState<string | null>(null)
  const tokenKey = tokenSymbol?.trim()

  const candidateNames = useMemo(() => {
    if (!tokenKey) return []
    const variants = new Set<string>([
      tokenKey,
      tokenKey.toUpperCase(),
      tokenKey.toLowerCase(),
    ])
    return Array.from(variants)
  }, [tokenKey])

  useEffect(() => {
    if (!tokenKey) {
      setLocalIconUrl(null)
      return
    }

    const cached = tokenIconCache.get(tokenKey)
    if (cached !== undefined) {
      setLocalIconUrl(cached)
      return
    }

    let isActive = true
    const candidates: string[] = []
    for (const name of candidateNames) {
      for (const ext of tokenImageExtensions) {
        candidates.push(`/images/tokens/${name}.${ext}`)
      }
    }

    const tryLoad = (index: number) => {
      if (!isActive) return
      if (index >= candidates.length) {
        tokenIconCache.set(tokenKey, null)
        setLocalIconUrl(null)
        return
      }

      const img = new Image()
      img.onload = () => {
        if (!isActive) return
        tokenIconCache.set(tokenKey, candidates[index])
        setLocalIconUrl(candidates[index])
      }
      img.onerror = () => {
        tryLoad(index + 1)
      }
      img.src = candidates[index]
    }

    tryLoad(0)
    return () => {
      isActive = false
    }
  }, [candidateNames, tokenKey])

  const effectiveChainId = chainId ?? networkId
  const fallbackLabel =
    tokenSymbol?.slice(0, 4) || (effectiveChainId ? `${effectiveChainId}` : '?')

  return (
    <div
      style={{ height: `${height}px`, width: `${width}px` }}
      className={`h-[${height}px] w-[${width}px] rounded-full overflow-hidden bg-white inline-flex items-center justify-center ${className ?? ''}`}
    >
      {localIconUrl ? (
        <img
          src={localIconUrl}
          alt={`${tokenSymbol || 'Token'} icon`}
          style={{ height: `${height}px`, width: `${width}px` }}
          className="block h-full w-full object-contain"
        />
      ) : address && effectiveChainId ? (
        <TokenProvider
          address={address}
          chain={getCachedChain(effectiveChainId)}
          client={thirdwebClient}
        >
          <ThirdwebTokenIcon className="h-5 w-5" />
        </TokenProvider>
      ) : (
        <div className="text-[10px] font-medium text-giv-gray-600">
          {fallbackLabel}
        </div>
      )}
    </div>
  )
})

TokenIcon.displayName = 'TokenIcon'
