'use client'

import { memo, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { defineChain } from 'thirdweb/chains'
import { TokenIcon, TokenProvider, useActiveAccount } from 'thirdweb/react'
import { formatNumber, useWalletTokens } from '@/lib/helpers/cartHelper'
import { thirdwebClient } from '@/lib/thirdweb/client'
import type { WalletTokenWithBalance } from '@/lib/types/chain'

const chainCache = new Map<number, ReturnType<typeof defineChain>>()
function getCachedChain(chainId: number) {
  const cached = chainCache.get(chainId)
  if (cached) return cached
  const chain = defineChain(chainId)
  chainCache.set(chainId, chain)
  return chain
}

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
  const handleSelectToken = (token: WalletTokenWithBalance) => {
    setSelectedToken(token)
    setRoundSelectedToken(token)
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="max-[480px]:w-full md:w-auto md:ml-auto flex items-center gap-2 rounded-md border border-giv-gray-100 px-3 py-2 transition-colors hover:bg-giv-gray-200 cursor-pointer">
          {selectedToken?.address && (
            <div className="flex items-center gap-2">
              <TokenIconCached
                address={selectedToken.address}
                chainId={selectedChainId}
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
            <TokenIconCached
              address={t.address as `0x${string}`}
              chainId={t.chainId}
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

const TokenIconCached = memo(function TokenIconCached({
  address,
  chainId,
}: {
  address: `0x${string}`
  chainId: number
}) {
  // thirdweb TokenIcon -> TokenProvider calls bridge.thirdweb.com/v1/tokens.
  // Guard against invalid chain ids (e.g. 0) to avoid 400s.
  if (!Number.isFinite(chainId) || chainId <= 0) {
    return <div className="h-5 w-5 rounded-full bg-giv-gray-300" />
  }

  return (
    <TokenProvider
      address={address}
      chain={getCachedChain(chainId)}
      client={thirdwebClient}
    >
      <TokenIcon className="h-5 w-5" />
    </TokenProvider>
  )
})

TokenIconCached.displayName = 'TokenIconCached'
