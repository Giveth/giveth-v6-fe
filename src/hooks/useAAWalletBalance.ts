'use client'

/**
 * useAAWalletBalance Hook
 *
 * Fetches the USDC balance on Optimism for AA wallet users.
 * Returns the balance formatted as a USD amount.
 */

import { optimism } from 'thirdweb/chains'
import { useActiveAccount, useWalletBalance } from 'thirdweb/react'
import { OPTIMISM_USDC_ADDRESS, thirdwebClient } from '@/lib/thirdweb/client'
import { useAAWalletStore } from '@/store/aa-wallet'

/**
 * Hook to get USDC balance on Optimism for the connected AA wallet
 */
export function useAAWalletBalance() {
  const account = useActiveAccount()
  const { isAAWallet } = useAAWalletStore()

  const {
    data: balanceData,
    isLoading,
    error,
    refetch,
  } = useWalletBalance(
    {
      client: thirdwebClient,
      chain: optimism,
      address: account?.address,
      tokenAddress: OPTIMISM_USDC_ADDRESS,
    },
    {
      enabled: !!account?.address && isAAWallet,
      refetchInterval: 15_000, // Refetch every 15 seconds
      staleTime: 10_000,
    },
  )

  const rawBalance = balanceData?.displayValue ?? '0'
  const parsedBalance = Number(rawBalance)
  const balanceNumber = Number.isFinite(parsedBalance) ? parsedBalance : 0
  const formattedBalance = balanceNumber.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return {
    /** Raw USDC balance string (e.g. "123.456789") */
    rawBalance,
    /** Numeric balance */
    balanceNumber,
    /** Formatted as USD (e.g. "$123.46") */
    formattedBalance,
    /** Whether the balance is loading */
    isLoading,
    /** Any error fetching balance */
    error,
    /** Manually refetch the balance */
    refetch,
  }
}
