'use client'

/**
 * useAAWalletBalance Hook
 *
 * Fetches the USDC balance on Optimism for AA wallet users.
 * Returns the balance formatted as a USD amount.
 */

import { useQuery } from '@tanstack/react-query'
import { getContract, readContract } from 'thirdweb'
import { optimism } from 'thirdweb/chains'
import { useActiveAccount } from 'thirdweb/react'
import { formatUnits } from 'viem'
import { OPTIMISM_USDC_ADDRESS, thirdwebClient } from '@/lib/thirdweb/client'
import { useAAWalletStore } from '@/store/aa-wallet'

/** USDC has 6 decimals */
const USDC_DECIMALS = 6

/**
 * Fetch USDC balance on Optimism for a given address
 */
async function fetchUSDCBalance(address: string): Promise<string> {
  const contract = getContract({
    client: thirdwebClient,
    chain: optimism,
    address: OPTIMISM_USDC_ADDRESS,
  })

  const balance = await readContract({
    contract,
    method: 'function balanceOf(address) view returns (uint256)',
    params: [address],
  })

  return formatUnits(balance, USDC_DECIMALS)
}

/**
 * Hook to get USDC balance on Optimism for the connected AA wallet
 */
export function useAAWalletBalance() {
  const account = useActiveAccount()
  const { isAAWallet } = useAAWalletStore()

  const {
    data: balance,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['aa-wallet-balance', account?.address],
    queryFn: () => fetchUSDCBalance(account!.address),
    enabled: !!account?.address && isAAWallet,
    refetchInterval: 15_000, // Refetch every 15 seconds
    staleTime: 10_000,
  })

  const balanceNumber = balance ? parseFloat(balance) : 0
  const formattedBalance = balanceNumber.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return {
    /** Raw USDC balance string (e.g. "123.456789") */
    rawBalance: balance ?? '0',
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
