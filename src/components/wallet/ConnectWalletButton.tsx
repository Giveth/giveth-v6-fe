'use client'

import {
  ConnectButton,
  lightTheme,
  useActiveAccount,
  useActiveWalletChain,
} from 'thirdweb/react'
import { supportedWallets, thirdwebClient } from '@/lib/thirdweb/client'
import { cn } from '@/lib/utils/cn'

const shortenAddress = (address?: string) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const WalletBadge = () => {
  const account = useActiveAccount()
  const chain = useActiveWalletChain()

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full bg-white px-4 py-2.5',
        'shadow-[0_10px_24px_rgba(83,38,236,0.08)] ring-1 ring-[#ebe9ff]',
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-lime-300 via-green-500 to-amber-400 shadow-inner" />
      <div className="leading-tight">
        <div className="text-base font-semibold text-[#1f1f2d]">
          {shortenAddress(account?.address)}
        </div>
        <div className="text-xs font-medium text-[#2c1b8b]">
          Connected to {chain?.name || 'Network'}
        </div>
      </div>
    </div>
  )
}

const customTheme = lightTheme({
  colors: {
    accentButtonBg: '#d81a72', // Giveth pink
    accentButtonText: '#ffffff',
  },
})

export function ConnectWalletButton() {
  return (
    <ConnectButton
      client={thirdwebClient}
      wallets={supportedWallets}
      theme={customTheme}
      connectButton={{
        label: 'Connect Wallet',
        className:
          'rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#d81a72] shadow-[0_10px_24px_rgba(83,38,236,0.08)] ring-1 ring-[#ebe9ff]',
      }}
      detailsButton={{
        render: () => <WalletBadge />,
      }}
      connectModal={{
        size: 'compact',
        title: 'Connect to Giveth',
        showThirdwebBranding: false,
      }}
    />
  )
}
