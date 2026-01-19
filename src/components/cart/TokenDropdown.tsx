'use client'

import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'
import { TokenIcon } from '@/components/TokenIcon'
import {
  formatNumber,
  getTokenPriceInUSDByCoingeckoId,
  useWalletTokens,
} from '@/lib/helpers/cartHelper'
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
  setRoundSelectedToken,
}: {
  selectedChainId: number
  setRoundSelectedToken: (token: WalletTokenWithBalance) => void
}) => {
  const account = useActiveAccount()
  const accountAddress = account?.address

  const { data: walletTokens, isLoading } = useWalletTokens(
    selectedChainId,
    accountAddress,
  )

  const [selectedToken, setSelectedToken] = useState<
    WalletTokenWithBalance | undefined
  >(undefined)

  // Select choosed token when clicking on the dropdown item
  const handleSelectToken = async (token: WalletTokenWithBalance) => {
    // Set token price in USD
    const priceInUSD = await getTokenPriceInUSDByCoingeckoId(token.coingeckoId)
    token.priceInUSD = priceInUSD

    setSelectedToken(token)
    setRoundSelectedToken(token)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="max-[480px]:w-full md:w-auto md:ml-auto flex items-center gap-2 rounded-md border border-giv-gray-100 px-3 py-2 transition-colors hover:bg-giv-gray-200 cursor-pointer">
          {selectedToken?.address && (
            <div className="flex items-center gap-2">
              <TokenIcon
                tokenSymbol={selectedToken.symbol}
                networkId={selectedChainId}
                address={selectedToken.address}
                height={20}
                width={20}
              />
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
            <TokenIcon
              tokenSymbol={t.symbol}
              networkId={t.chainId}
              address={t.address as `0x${string}`}
              height={20}
              width={20}
            />
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
