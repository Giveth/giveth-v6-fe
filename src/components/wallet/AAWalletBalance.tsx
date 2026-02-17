'use client'

import { DollarSign, Loader2, Plus } from 'lucide-react'
import { useAAWalletBalance } from '@/hooks/useAAWalletBalance'
import { useAAWalletStore } from '@/store/aa-wallet'

/**
 * AAWalletBalance Component
 *
 * Displays the USDC balance on Optimism formatted as USD
 * for AA wallet users. Includes a "Deposit" button to add funds.
 */
export function AAWalletBalance() {
  const { formattedBalance, isLoading } = useAAWalletBalance()
  const { setDepositModalOpen } = useAAWalletStore()

  return (
    <div className="flex items-center gap-2">
      {/* Balance Display */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-giv-neutral-200 rounded-lg">
        <DollarSign className="w-4 h-4 text-green-600" />
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-giv-neutral-400" />
        ) : (
          <span className="text-sm font-semibold text-giv-neutral-900">
            {formattedBalance}
          </span>
        )}
      </div>

      {/* Deposit Button */}
      <button
        onClick={() => setDepositModalOpen(true)}
        className="flex items-center gap-1 px-3 py-2 bg-giv-brand-300 text-white rounded-lg text-sm font-semibold hover:bg-giv-brand-400 transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Deposit
      </button>
    </div>
  )
}
