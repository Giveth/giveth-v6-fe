import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'

interface AmountInputProps {
  defaultAmount: string
  defaultUsdValue: string
}

export const AmountInput = ({
  defaultAmount,
  defaultUsdValue,
}: AmountInputProps) => {
  const [amount, setAmount] = useState(defaultAmount)
  return (
    <div className="flex-wrap md:flex-nowrap flex items-center gap-2 rounded-md border border-giv-gray-100 px-3 py-2">
      <input
        type="text"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="w-full max-[480px]:w-24 md:w-16 focus:w-28 transition-[width] duration-200 ease-outtext-base p-0 font-medium text-left text-giv-gray-900 focus:outline-none"
      />
      <ArrowLeftRight className="w-4 h-4 text-giv-gray-800" />
      <span className="px-2 py-1 bg-giv-gray-300 rounded-lg text-xs text-giv-gray-700">
        $ {defaultUsdValue}
      </span>
    </div>
  )
}
