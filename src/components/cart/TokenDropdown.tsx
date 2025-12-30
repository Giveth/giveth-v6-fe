'use client'

import { useEffect, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { defineChain } from 'thirdweb/chains'
import { TokenIcon, TokenProvider, useActiveAccount } from 'thirdweb/react'
import { useCart } from '@/context/CartContext'
import { formatNumber, useWalletTokens } from '@/lib/helpers/cartHelper'
import { thirdwebClient } from '@/lib/thirdweb/client'
import type { WalletTokenWithBalance } from '@/lib/types/chain'

// tokens.ts
export interface Token {
  address: `0x${string}`
  symbol: string
  decimals: number
  name: string
}

export const TokenDropdown = ({
  selectedChainId,
  roundId,
}: {
  selectedChainId: number
  roundId: number
}) => {
  const { updateSelectedToken, cartItems, updateProjectDonation } = useCart()
  const account = useActiveAccount()
  const accountAddress = account?.address

  const { data: walletTokens, isLoading } = useWalletTokens(
    selectedChainId,
    accountAddress,
  )

  const [selectedToken, setSelectedToken] = useState<
    WalletTokenWithBalance | undefined
  >(undefined)

  // Select first token by default
  useEffect(() => {
    if (!selectedToken && walletTokens && walletTokens.length > 0) {
      setSelectedToken(walletTokens[0])
      updateSelectedToken(
        roundId,
        walletTokens[0],
        walletTokens[0].symbol,
        walletTokens[0].address as `0x${string}`,
        walletTokens[0].decimals,
        walletTokens[0].isGivbackEligible,
      )
    }
  }, [walletTokens, selectedToken])

  // Select choosed token when clicking on the dropdown item
  const handleSelectToken = (token: WalletTokenWithBalance) => {
    setSelectedToken(token)
    updateSelectedToken(
      roundId,
      token,
      token.symbol,
      token.address as `0x${string}`,
      token.decimals,
      token.isGivbackEligible,
    )

    // Update all projects in the round with the same token and reset donation amount
    cartItems.forEach(item => {
      if (item.roundId === roundId) {
        updateProjectDonation(
          roundId,
          item.id,
          String(0),
          token.symbol,
          token.address as `0x${string}`,
          token.decimals,
        )
      }
    })
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="max-[480px]:w-full md:w-auto md:ml-auto flex items-center gap-2 rounded-md border border-giv-gray-100 px-3 py-2 transition-colors hover:bg-giv-gray-200 cursor-pointer">
          {selectedToken?.address && (
            <div className="flex items-center gap-2">
              <TokenProvider
                address={selectedToken.address}
                chain={defineChain(selectedChainId)}
                client={thirdwebClient}
              >
                <TokenIcon className="h-5 w-5" />
              </TokenProvider>
              <span className="text-base font-medium text-giv-gray-900">
                {selectedToken.symbol}
              </span>
            </div>
          )}
          {!selectedToken && (
            <span className="text-base font-medium text-giv-gray-900">
              Select a token
            </span>
          )}
          <ChevronDown className="w-7 h-5 mt-0.5 text-giv-gray-900 max-[480px]:ml-auto" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="start"
          className="
            z-50 min-w-[220px] rounded-xl border border-[#ebecf2] bg-white p-1
            shadow-[0px_6px_24px_rgba(0,0,0,0.06)]
          "
        >
          <TokenDropdownItems
            walletTokens={walletTokens}
            isLoading={isLoading}
            onSelectToken={handleSelectToken}
          />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function TokenDropdownItems({
  walletTokens,
  isLoading,
  onSelectToken,
}: {
  walletTokens: WalletTokenWithBalance[] | undefined
  isLoading: boolean
  onSelectToken: (t: WalletTokenWithBalance) => void
}) {
  if (isLoading) {
    return <div className="px-3 py-2 text-sm text-[#82899a]">Loading...</div>
  }

  if (!walletTokens || walletTokens.length === 0) {
    return <div className="px-3 py-2 text-sm text-[#82899a]">No tokens</div>
  }

  return (
    <>
      {walletTokens.map(t => (
        <DropdownMenu.Item
          key={t.address}
          onSelect={() => {
            onSelectToken(t)
          }}
          className="
            cursor-pointer rounded-lg px-3 py-2 text-sm
            text-[#1f2333] outline-none
            hover:bg-[#f7f7f9]
            focus:bg-[#f7f7f9]
          "
        >
          <div className="flex items-center justify-start gap-4">
            <TokenProvider
              address={t.address as `0x${string}`}
              chain={defineChain(t.chainId)}
              client={thirdwebClient}
            >
              <TokenIcon className="h-5 w-5" />
            </TokenProvider>
            <span className="font-medium">{t.symbol}</span>
            <span className="text-[#82899a] tabular-nums ml-auto">
              {formatNumber(t.formattedBalance, {
                minDecimals: 2,
                maxDecimals: 2,
              })}
            </span>
          </div>
        </DropdownMenu.Item>
      ))}
    </>
  )
}
