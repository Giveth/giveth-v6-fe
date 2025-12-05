'use client'

import { ConnectButton, lightTheme } from 'thirdweb/react'
import { supportedWallets, thirdwebClient } from '@/lib/thirdweb/client'

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
      connectButton={{ label: 'Connect Wallet' }}
      connectModal={{
        size: 'compact',
        title: 'Connect to Giveth',
        showThirdwebBranding: false,
      }}
    />
  )
}
