import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { ArrowLeftRight } from 'lucide-react'
import { useCart, type ProjectCartItem } from '@/context/CartContext'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { normalizeDecimalInput } from '@/lib/helpers/numbersHelper'
import { type WalletTokenWithBalance } from '@/lib/types/chain'

interface AmountInputProps {
  roundId: number
  selectedToken: WalletTokenWithBalance | undefined
  cartItems: ProjectCartItem[]
  setSelectedAmountVsDollars: (amount: number) => void
}

export const AmountInput = ({
  roundId: _roundId,
  selectedToken,
  cartItems,
  setSelectedAmountVsDollars,
}: AmountInputProps) => {
  const { updateProjectDonation, updateSelectedToken } = useCart()

  const [enteringType, setEnteringType] = useState<'amount' | 'usd'>('amount')
  const [enteredValue, setEnteredValue] = useState('0')
  const [enteredUsdValue, setEnteredUsdValue] = useState('0')

  const usdValue = useMemo(() => {
    return selectedToken?.priceInUSD ? selectedToken.priceInUSD : 0
  }, [selectedToken, enteredValue])

  // First load set `enteringType` to amount
  useEffect(() => {
    setEnteringType('amount')
  }, [])

  // If selectedToken changes, set the entered value to the selected token's balance
  useEffect(() => {
    setEnteredValue('0')
    setEnteredUsdValue('0')
  }, [selectedToken])

  const setEnteredAmount = (value: string, type: 'amount' | 'usd') => {
    const valueToken =
      type === 'amount'
        ? value
        : String(Number.parseFloat(value) / (usdValue ?? 1))
    const valueTokenUsd =
      type === 'usd' ? value : String(Number.parseFloat(value) * usdValue)

    setEnteredValue(normalizeDecimalInput(valueToken))
    setEnteredUsdValue(normalizeDecimalInput(valueTokenUsd))
  }

  // Update each cart item in round with same token amount
  const handleApplyToAll = (roundId: number) => {
    const round = cartItems.find(item => item.roundId === roundId)

    if (round) {
      if (!selectedToken) return
      cartItems.forEach(item => {
        updateProjectDonation(
          roundId,
          item.id,
          enteredValue,
          selectedToken?.symbol ?? '',
          selectedToken?.address ?? '',
          selectedToken?.chainId ?? 0,
        )
        updateSelectedToken(
          roundId,
          selectedToken,
          selectedToken.symbol,
          selectedToken.address as `0x${string}`,
          selectedToken.decimals,
          selectedToken.isGivbackEligible,
        )
      })
    }
  }

  return (
    <>
      <div className="flex-wrap flex items-center gap-2 rounded-md border border-giv-neutral-100 px-3 py-2">
        {enteringType === 'usd' && <span>$</span>}
        <input
          type="text"
          value={enteringType === 'amount' ? enteredValue : enteredUsdValue}
          onChange={e => setEnteredAmount(e.target.value, enteringType)}
          className={clsx(
            'w-full max-[480px]:w-24 md:w-16 focus:w-28',
            'transition-[width] duration-200 ease-out text-base p-0',
            'font-medium text-left text-giv-neutral-900 focus:outline-none',
          )}
        />
        <ArrowLeftRight
          className={clsx('w-4 h-4', 'text-giv-neutral-800 cursor-pointer')}
          onClick={() => {
            const newEnteringType = enteringType === 'amount' ? 'usd' : 'amount'
            setEnteringType(newEnteringType)
            setSelectedAmountVsDollars(newEnteringType === 'amount' ? 0 : 1)
          }}
        />
        <span
          className={clsx(
            'px-2 py-1 bg-giv-neutral-300 rounded-lg text-xs',
            'text-giv-neutral-700',
          )}
        >
          {enteringType === 'amount' ? '$' : selectedToken?.symbol}{' '}
          {enteringType === 'amount'
            ? formatNumber(enteredUsdValue)
            : formatNumber(enteredValue)}
        </span>
      </div>
      {/* Apply to all */}
      <button
        className={clsx(
          'ml-1 text-base font-medium text-giv-brand-500 hover:text-giv-brand-700',
          'transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        )}
        onClick={() => handleApplyToAll(_roundId)}
      >
        Apply to all
      </button>
    </>
  )
}
