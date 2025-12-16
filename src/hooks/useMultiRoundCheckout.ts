/**
 * useMultiRoundCheckout Hook
 *
 * Orchestrates donations across multiple QF rounds with different chains.
 * Each round executes as its own transaction, but the user experiences
 * a unified checkout flow.
 *
 * Features:
 * - Multiple rounds, one transaction per round
 * - Automatic chain switching between rounds
 * - Failure isolation (one round fails, others continue)
 * - Progress tracking for each round
 * - Validation: one chain per round
 */

import { useState, useCallback } from 'react'
import { defineChain } from 'thirdweb'
import {
  useActiveAccount,
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from 'thirdweb/react'
import { parseUnits } from 'viem'
import type { DonationRound } from '@/context/CartContext'
import type { BatchDonationDetails } from '@/lib/contracts/donation-handler'
import { useDonation, type DonationStatus } from './useDonation'

export interface RoundCheckoutStatus {
  roundId: number
  roundName: string
  chainId: number
  status: DonationStatus
  transactionHash?: string
  error?: string
  bundleId?: string
}

export interface MultiRoundCheckoutState {
  status: 'idle' | 'preparing' | 'in_progress' | 'completed' | 'failed'
  currentRoundIndex: number
  totalRounds: number
  roundStatuses: Map<number, RoundCheckoutStatus>
  overallError?: string
  completedRounds: number
  failedRounds: number
}

export interface UseMultiRoundCheckoutReturn {
  state: MultiRoundCheckoutState
  checkoutAllRounds: (rounds: DonationRound[]) => Promise<void>
  reset: () => void
  validateRounds: (rounds: DonationRound[]) => {
    valid: boolean
    errors: string[]
  }
}

/**
 * Hook for handling multi-round donation checkout
 */
export function useMultiRoundCheckout(): UseMultiRoundCheckoutReturn {
  const account = useActiveAccount()
  const activeChain = useActiveWalletChain()
  const switchChain = useSwitchActiveWalletChain()
  const { batchDonate, reset: resetDonation } = useDonation()

  const [state, setState] = useState<MultiRoundCheckoutState>({
    status: 'idle',
    currentRoundIndex: 0,
    totalRounds: 0,
    roundStatuses: new Map(),
    completedRounds: 0,
    failedRounds: 0,
  })

  /**
   * Validate that each round uses only one chain
   */
  const validateRounds = useCallback((rounds: DonationRound[]) => {
    const errors: string[] = []

    if (rounds.length === 0) {
      errors.push('Cart is empty')
      return { valid: false, errors }
    }

    rounds.forEach(round => {
      // Check that all projects in the round have the same chain
      const projectChains = new Set(
        round.projects.map(p => p.chainId).filter(Boolean),
      )

      if (projectChains.size > 1) {
        errors.push(
          `Round "${round.roundName}" contains projects from multiple chains. Please select one chain per round.`,
        )
      }

      if (projectChains.size === 0 || !round.chainId) {
        errors.push(`Round "${round.roundName}" has no chain selected.`)
      }

      // Check that projects have wallet addresses
      const projectsWithoutAddress = round.projects.filter(
        p => !p.walletAddress,
      )
      if (projectsWithoutAddress.length > 0) {
        errors.push(
          `Round "${round.roundName}" has ${projectsWithoutAddress.length} project(s) without wallet addresses.`,
        )
      }

      // Check that projects have donation amounts
      const projectsWithoutAmount = round.projects.filter(
        p => !p.donationAmount || parseFloat(p.donationAmount) <= 0,
      )
      if (projectsWithoutAmount.length > 0) {
        errors.push(
          `Round "${round.roundName}" has ${projectsWithoutAmount.length} project(s) without donation amounts.`,
        )
      }
    })

    return {
      valid: errors.length === 0,
      errors,
    }
  }, [])

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      currentRoundIndex: 0,
      totalRounds: 0,
      roundStatuses: new Map(),
      completedRounds: 0,
      failedRounds: 0,
    })
    resetDonation()
  }, [resetDonation])

  /**
   * Execute checkout for all rounds
   */
  const checkoutAllRounds = useCallback(
    async (rounds: DonationRound[]) => {
      if (!account) {
        setState(prev => ({
          ...prev,
          status: 'failed',
          overallError: 'Please connect your wallet',
        }))
        return
      }

      // Validate rounds first
      const validation = validateRounds(rounds)
      if (!validation.valid) {
        setState(prev => ({
          ...prev,
          status: 'failed',
          overallError: validation.errors.join(' '),
        }))
        return
      }

      // Initialize state
      const initialStatuses = new Map<number, RoundCheckoutStatus>()
      rounds.forEach(round => {
        initialStatuses.set(round.roundId, {
          roundId: round.roundId,
          roundName: round.roundName,
          chainId: round.chainId,
          status: 'idle',
        })
      })

      setState({
        status: 'preparing',
        currentRoundIndex: 0,
        totalRounds: rounds.length,
        roundStatuses: initialStatuses,
        completedRounds: 0,
        failedRounds: 0,
      })

      let completed = 0
      let failed = 0

      // Execute each round sequentially
      for (let i = 0; i < rounds.length; i++) {
        const round = rounds[i]

        try {
          // Update current round
          setState(prev => ({
            ...prev,
            status: 'in_progress',
            currentRoundIndex: i,
          }))

          // Update round status to preparing
          setState(prev => {
            const newStatuses = new Map(prev.roundStatuses)
            newStatuses.set(round.roundId, {
              ...newStatuses.get(round.roundId)!,
              status: 'preparing',
            })
            return { ...prev, roundStatuses: newStatuses }
          })

          // Get current chain from active wallet
          const currentChainId = activeChain?.id

          // Switch chain if needed
          if (currentChainId !== round.chainId) {
            setState(prev => {
              const newStatuses = new Map(prev.roundStatuses)
              newStatuses.set(round.roundId, {
                ...newStatuses.get(round.roundId)!,
                status: 'awaiting_approval',
              })
              return { ...prev, roundStatuses: newStatuses }
            })

            await switchChain(defineChain(round.chainId))
          }

          // Prepare batch donation details
          const tokenDecimals = getTokenDecimals(round.token)

          const donations = round.projects.map(project => ({
            projectAddress:
              project.walletAddress ||
              '0x0000000000000000000000000000000000000000',
            amount: parseUnits(project.donationAmount || '0', tokenDecimals),
            tokenAddress: round.tokenAddress,
            tokenSymbol: round.token,
            chainId: round.chainId,
          }))

          const totalAmount = donations.reduce(
            (sum, d) => sum + d.amount,
            BigInt(0),
          )

          const batchDetails: BatchDonationDetails = {
            donations,
            chainId: round.chainId,
            tokenAddress: round.tokenAddress,
            totalAmount,
          }

          // Update status to processing
          setState(prev => {
            const newStatuses = new Map(prev.roundStatuses)
            newStatuses.set(round.roundId, {
              ...newStatuses.get(round.roundId)!,
              status: 'processing',
            })
            return { ...prev, roundStatuses: newStatuses }
          })

          // Execute the donation
          await batchDonate(batchDetails)

          // Success! Update status
          completed++
          setState(prev => {
            const newStatuses = new Map(prev.roundStatuses)
            newStatuses.set(round.roundId, {
              ...newStatuses.get(round.roundId)!,
              status: 'success',
              // Note: transactionHash would need to be returned from batchDonate
            })
            return {
              ...prev,
              roundStatuses: newStatuses,
              completedRounds: completed,
            }
          })
        } catch (error) {
          // Round failed, but continue with others
          failed++
          console.error(`Round ${round.roundName} failed:`, error)

          setState(prev => {
            const newStatuses = new Map(prev.roundStatuses)
            newStatuses.set(round.roundId, {
              ...newStatuses.get(round.roundId)!,
              status: 'error',
              error:
                error instanceof Error ? error.message : 'Transaction failed',
            })
            return {
              ...prev,
              roundStatuses: newStatuses,
              failedRounds: failed,
            }
          })
        }
      }

      // All rounds processed - update final state
      setState(prev => ({
        ...prev,
        status: failed === rounds.length ? 'failed' : 'completed',
        currentRoundIndex: rounds.length,
        overallError:
          failed === rounds.length
            ? 'All rounds failed'
            : failed > 0
              ? `${failed} of ${rounds.length} rounds failed`
              : undefined,
      }))
    },
    [account, activeChain, switchChain, batchDonate, validateRounds],
  )

  return {
    state,
    checkoutAllRounds,
    reset,
    validateRounds,
  }
}

/**
 * Helper to get token decimals
 * TODO: Get from backend or token contract
 */
function getTokenDecimals(symbol: string): number {
  const decimalsMap: Record<string, number> = {
    USDT: 6,
    USDC: 6,
    DAI: 18,
    WETH: 18,
    ETH: 18,
    MATIC: 18,
    BTC: 8,
    WBTC: 8,
  }

  return decimalsMap[symbol.toUpperCase()] || 18
}
