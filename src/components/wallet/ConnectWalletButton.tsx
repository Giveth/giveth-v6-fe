'use client'

import { ConnectButton } from 'thirdweb/react'
import {
  supportedChains,
  supportedWallets,
  thirdwebClient,
} from '@/lib/thirdweb/client'

const ConnectWalletButton = () => {
  return (
    <ConnectButton
      client={thirdwebClient}
      connectButton={{
        label: 'Connect Wallet',
        className:
          'px-6 py-2.5 font-semibold rounded-full transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer',
        style: {
          backgroundColor: '#E1458D',
          color: 'white',
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
