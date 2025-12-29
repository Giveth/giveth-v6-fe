import { useEffect, useMemo, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { useCart, type Project } from '@/context/CartContext'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { normalizeDecimalInput } from '@/lib/helpers/numbersHelper'
import { type WalletTokenWithBalance } from '@/lib/types/chain'

interface AmountInputProps {
  roundId: number
  selectedToken: WalletTokenWithBalance | undefined
  cartItems: Project[]
}

export const AmountInput = ({
  roundId: _roundId,
  selectedToken,
  cartItems,
}: AmountInputProps) => {
  const { updateProjectDonation } = useCart()

  const [enteringType, setEnteringType] = useState<'amount' | 'usd'>('amount')
  const [enteredValue, setEnteredValue] = useState('0')
  const [enteredUsdValue, setEnteredUsdValue] = useState('0')
  const [balanceError, setBalanceError] = useState<string | null>(null)

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

    // Add 2 seconds delay to the function
    const timeout = setTimeout(() => {
      if (valueToken) {
        const totalAmount = cartItems.length * Number.parseFloat(valueToken)
        const walletBalance = selectedToken
          ? Number.parseFloat(selectedToken.formattedBalance)
          : Number.POSITIVE_INFINITY

        if (Number.isFinite(walletBalance) && totalAmount > walletBalance) {
          setBalanceError('Insufficient balance')
        } else {
          setBalanceError(null)
        }
      } else {
      }
    }, 2000)

    // NOTE: returning a cleanup function here does nothing because this isn't a useEffect.
    // Cleanup should be handled by debouncing or by using useEffect.
    void timeout
  }

  // Update each cart item in round with same token amount
  const handleApplyToAll = (roundId: number) => {
    const round = cartItems.find(item => item.roundId === roundId)
    if (round) {
      cartItems.forEach(item => {
        updateProjectDonation(
          item.id,
          enteredValue,
          selectedToken?.symbol ?? '',
          selectedToken?.address ?? '',
          selectedToken?.chainId ?? 0,
        )
      })
    }
  }

  return (
    <>
      <div className="flex-wrap flex items-center gap-2 rounded-md border border-giv-gray-100 px-3 py-2">
        {enteringType === 'usd' && <span>$</span>}
        <input
          type="text"
          value={enteringType === 'amount' ? enteredValue : enteredUsdValue}
          onChange={e => setEnteredAmount(e.target.value, enteringType)}
          className="w-full max-[480px]:w-24 md:w-16 focus:w-28 transition-[width] duration-200 ease-out text-base p-0 font-medium text-left text-giv-gray-900 focus:outline-none"
        />
        <ArrowLeftRight
          className="w-4 h-4 text-giv-gray-800 cursor-pointer"
          onClick={() =>
            setEnteringType(enteringType === 'amount' ? 'usd' : 'amount')
          }
        />
        <span className="px-2 py-1 bg-giv-gray-300 rounded-lg text-xs text-giv-gray-700">
          {enteringType === 'amount' ? '$' : selectedToken?.symbol}{' '}
          {enteringType === 'amount'
            ? formatNumber(enteredUsdValue)
            : formatNumber(enteredValue)}
        </span>
      </div>
      {/* Apply to all */}
      <button
        className="ml-1 text-base font-medium text-giv-primary-500 hover:text-giv-primary-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!!balanceError}
        onClick={() => handleApplyToAll(_roundId)}
      >
        Apply to all
      </button>
      {balanceError && (
        <span className="d-block w-full text-red-500 text-xs text-right transition-opacity duration-200 ease-out">
          {balanceError}
        </span>
      )}
      {enteredValue} -- {enteredUsdValue}
    </>
  )
}
