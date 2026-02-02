'use client'

import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'
import { TokenIcon } from '@/components/TokenIcon'
import { useCart } from '@/context/CartContext'
import {
  formatNumber,
  getPriceFromUniswapV2,
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
  roundId,
}: {
  selectedChainId: number
  setRoundSelectedToken: (token: WalletTokenWithBalance) => void
  roundId: number
}) => {
  const [hide0BalanceTokens, setHide0BalanceTokens] = useState(false)

  const { updateSelectedToken } = useCart()

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
    let priceInUSD = await getTokenPriceInUSDByCoingeckoId(token.coingeckoId)

    if (!priceInUSD || priceInUSD === 0) {
      priceInUSD =
        (await getPriceFromUniswapV2(
          token.address as `0x${string}`,
          token.decimals,
          selectedChainId,
        )) ?? 0
    }

    token.priceInUSD = priceInUSD

    setSelectedToken(token)
    setRoundSelectedToken(token)

    // Update to all projects in the round same token
    updateSelectedToken(
      roundId,
      token,
      token.symbol,
      (token.address as `0x${string}`) ?? '',
      token.decimals,
      token.isGivbackEligible,
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={clsx(
            'max-[480px]:w-full md:w-auto md:ml-auto flex items-center gap-2 rounded-md border border-giv-neutral-100 px-3 py-2',
            'transition-colors hover:bg-giv-neutral-200 cursor-pointer',
            'text-giv-neutral-900',
          )}
        >
          {selectedToken?.address && (
            <div className="flex items-center gap-2">
              <TokenIcon
                tokenSymbol={selectedToken.symbol}
                networkId={selectedChainId}
                address={selectedToken.address}
                height={20}
                width={20}
                isGivbackEligible={selectedToken.isGivbackEligible}
              />
              <span className="text-base font-medium text-giv-neutral-900">
                {selectedToken.symbol}
              </span>
            </div>
          )}
          {!selectedToken && (
            <span className="text-base font-medium text-giv-neutral-900">
              Select a token
            </span>
          )}
          <ChevronDown className="w-7 h-5 mt-0.5 text-giv-neutral-900 max-[480px]:ml-auto" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="start"
          className="
            z-50 min-w-[220px] max-h-[500px] overflow-y-auto rounded-xl border border-giv-neutral-300 bg-white p-1
            shadow-[0px_6px_24px_rgba(0,0,0,0.06)]
          "
        >
          {walletTokens && walletTokens.length > 0 && (
            <DropdownMenu.Item
              onSelect={event => event.preventDefault()}
              className="
                cursor-default rounded-lg px-3 py-2 text-sm
                text-giv-deep-blue-800 outline-none
                hover:-giv-neutral-200
                focus:-giv-neutral-200
              "
            >
              <div className="flex items-center justify-start gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hide0BalanceTokens}
                    onChange={e => setHide0BalanceTokens(e.target.checked)}
                  />
                  Hide 0 balance tokens
                </label>
              </div>
            </DropdownMenu.Item>
          )}
          <TokenDropdownItems
            walletTokens={walletTokens}
            isLoading={isLoading}
            onSelectToken={handleSelectToken}
            hide0BalanceTokens={hide0BalanceTokens}
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
  hide0BalanceTokens,
}: {
  walletTokens: WalletTokenWithBalance[] | undefined
  isLoading: boolean
  onSelectToken: (t: WalletTokenWithBalance) => void
  hide0BalanceTokens: boolean
}) {
  if (isLoading) {
    return (
      <div className="px-3 py-2 text-sm text-giv-neutral-700">Loading...</div>
    )
  }

  if (!walletTokens || walletTokens.length === 0) {
    return (
      <div className="px-3 py-2 text-sm text-giv-neutral-700">No tokens</div>
    )
  }

  let filteredWalletTokens = walletTokens

  if (hide0BalanceTokens) {
    filteredWalletTokens = filteredWalletTokens.filter(
      t => t.formattedBalance !== '0',
    )
  }

  return (
    <>
      {filteredWalletTokens.map(t => (
        <DropdownMenu.Item
          key={t.address}
          onSelect={() => {
            onSelectToken(t)
          }}
          className="
            cursor-pointer rounded-lg px-3 py-2 text-sm
            text-giv-deep-blue-800 outline-none
            hover:-giv-neutral-200
            focus:-giv-neutral-200
          "
        >
          <div className="flex items-center justify-start gap-4">
            <TokenIcon
              tokenSymbol={t.symbol}
              networkId={t.chainId}
              address={t.address as `0x${string}`}
              height={20}
              width={20}
              isGivbackEligible={t.isGivbackEligible}
            />
            <span className="font-medium">{t.symbol}</span>
            <span className="text-giv-neutral-700 tabular-nums ml-auto">
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
