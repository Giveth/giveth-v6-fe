'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { defineChain, getContract } from 'thirdweb'
import { balanceOf } from 'thirdweb/extensions/erc20'
import { useActiveAccount } from 'thirdweb/react'
import { formatUnits } from 'viem'
import { thirdwebClient } from '@/lib/thirdweb/client'

// tokens.ts
export interface Token {
  address: `0x${string}`
  symbol: string
  decimals: number
  name: string
}

export const TOKENS_BY_CHAIN: Record<number, Token[]> = {
  1: [
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin',
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      decimals: 18,
      name: 'Dai',
    },
  ],
}

export function useWalletTokens(chainId: number) {
  const account = useActiveAccount()
  const address = account?.address
  const tokens = TOKENS_BY_CHAIN[chainId] ?? []
  const chain = defineChain(chainId)

  return useQuery({
    queryKey: ['walletTokens', chainId, address],
    enabled: !!address && tokens.length > 0,
    queryFn: async () => {
      const balances = await Promise.all(
        tokens.map(async token => {
          const contract = getContract({
            client: thirdwebClient,
            chain,
            address: token.address,
          })

          const balance = await balanceOf({
            contract,
            address: address!,
          })

          return {
            ...token,
            balance,
            formatted: formatUnits(balance, token.decimals),
          }
        }),
      )

      return balances.filter(t => t.balance > 0n)
    },
  })
}

export const TokenDropdown = ({ chainId }: { chainId: number }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 rounded-md border border-giv-gray-100 px-3 py-2 transition-colors hover:bg-giv-gray-200 cursor-pointer">
          <span className="text-base font-medium text-giv-gray-900">
            Wallet tokens
          </span>
          <ChevronDown className="w-7 h-5 mt-0.5 text-giv-gray-900" />
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
          <TokenDropdownItems chainId={chainId} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function TokenDropdownItems({ chainId }: { chainId: number }) {
  const { data, isLoading } = useWalletTokens(chainId)

  if (isLoading) {
    return <div className="px-3 py-2 text-sm text-[#82899a]">Loading...</div>
  }

  if (!data || data.length === 0) {
    return <div className="px-3 py-2 text-sm text-[#82899a]">No tokens</div>
  }

  return (
    <>
      {data.map(t => (
        <DropdownMenu.Item
          key={t.address}
          onSelect={() => {
            // TODO: wire token selection into cart state
          }}
          className="
            cursor-pointer rounded-lg px-3 py-2 text-sm
            text-[#1f2333] outline-none
            hover:bg-[#f7f7f9]
            focus:bg-[#f7f7f9]
          "
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium">{t.symbol}</span>
            <span className="text-[#82899a] tabular-nums">{t.formatted}</span>
          </div>
        </DropdownMenu.Item>
      ))}
    </>
  )
}
