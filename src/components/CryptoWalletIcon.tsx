'use client'

import { memo } from 'react'
import { cryptoWallets } from '@/lib/constants/chain'

export const CryptoWalletIcon = memo(function CryptoWalletIcon({
  walletId,
}: {
  walletId: string
}) {
  const wallet = cryptoWallets[walletId]
  if (!wallet) return null
  return (
    <div className="h-6 w-6 rounded-full overflow-hidden bg-white inline-flex items-center justify-center">
      {wallet?.icon && <wallet.icon />}
    </div>
  )
})

CryptoWalletIcon.displayName = 'CryptoWalletIcon'
