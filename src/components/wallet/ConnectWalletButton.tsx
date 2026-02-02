'use client'

import { Wallet } from 'lucide-react'
import { ConnectButton } from 'thirdweb/react'
import {
  supportedChains,
  supportedWallets,
  thirdwebClient,
} from '@/lib/thirdweb/client'

const ConnectWalletButton = ({
  className,
  textColor,
  backgroundColor,
  showIcon = false,
}: {
  className?: string
  textColor?: string
  backgroundColor?: string
  showIcon?: boolean
  showLabel?: boolean
}) => {
  return (
    <ConnectButton
      client={thirdwebClient}
      connectButton={{
        label: (
          <span className="inline-flex items-center gap-2 hover:opacity-80">
            {showIcon && <Wallet className="h-4 w-4" />}
            Connect Wallet
          </span>
        ),
        className: `rounded-full transition-all duration-200 shadow-sm cursor-pointer ${className}`,
        style: {
          height: 'auto',
          backgroundColor: backgroundColor || '#8668fc',
          color: textColor || 'white',
          padding: '14px 20px',
          fontSize: '14px',
          fontWeight: '600',
        },
      }}
      wallets={supportedWallets}
      chains={supportedChains}
      connectModal={{
        size: 'compact',
        showThirdwebBranding: false,
      }}
    />
  )
}

export default ConnectWalletButton
