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
        className: `px-6 py-2.5 font-semibold rounded-full transition-all duration-200 shadow-sm cursor-pointer ${className}`,
        style: {
          backgroundColor: backgroundColor || '#E1458D',
          color: textColor || 'white',
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
