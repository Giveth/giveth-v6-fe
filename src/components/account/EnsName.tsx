'use client'

import { useEffect, useState } from 'react'
import { resolveName } from 'thirdweb/extensions/ens'
import { shortenAddress } from '@/lib/helpers/userHelper'
import { thirdwebClient } from '@/lib/thirdweb/client'
import type { Address } from 'thirdweb'

interface EnsNameProps {
  address?: Address
  className?: string
}

export function EnsName({ address, className }: EnsNameProps) {
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return

    let cancelled = false

    async function load() {
      try {
        if (!address) return
        const ens = await resolveName({
          client: thirdwebClient,
          address: address as Address as `0x${string}`,
        })
        if (!cancelled) setName(ens ?? null)
      } catch {
        if (!cancelled) setName(null)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [address])

  return (
    <span className={className}>
      {name ?? shortenAddress(address as Address as `0x${string}`)}
    </span>
  )
}
