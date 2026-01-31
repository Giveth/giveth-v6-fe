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
import { useSiweAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import type { DonationRound } from '@/context/CartContext'
import { useProjectById } from '@/hooks/useProject'
import { GIVETH_PROJECT_ID } from '@/lib/constants/app-main'
import type { BatchDonationDetails } from '@/lib/contracts/donation-handler'
import { createGraphQLClient } from '@/lib/graphql/client'
import type { CreateDonationInput } from '@/lib/graphql/generated/graphql'
import { createDonationMutation } from '@/lib/graphql/queries'
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
  checkoutAllRounds: (
    rounds: DonationRound[],
    options?: { anonymous?: boolean },
  ) => Promise<void>
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
  const { token } = useSiweAuth()
  const { givethPercentage, setGivethPercentage } = useCart()
  const { data: givethProjectData } = useProjectById(GIVETH_PROJECT_ID)
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

      if (projectChains.size === 0 || !round.selectedChainId) {
        errors.push(`Round "${round.roundName}" has no chain selected.`)
      }

      // Check that projects have wallet addresses
      const projectsWithoutAddress = round.projects.filter(p => {
        const hasDirect = Boolean(p.walletAddress)
        const hasByChain = Boolean(
          p.recipientAddresses?.some(
            a => a.networkId === round.selectedChainId,
          ),
        )
        return !hasDirect && !hasByChain
      })
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
    async (rounds: DonationRound[], options?: { anonymous?: boolean }) => {
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
          chainId: round.selectedChainId,
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
          if (currentChainId !== round.selectedChainId) {
            setState(prev => {
              const newStatuses = new Map(prev.roundStatuses)
              newStatuses.set(round.roundId, {
                ...newStatuses.get(round.roundId)!,
                status: 'awaiting_approval',
              })
              return { ...prev, roundStatuses: newStatuses }
            })

            await switchChain(defineChain(round.selectedChainId))
          }

          // Prepare batch donation details
          const tokenDecimals = getTokenDecimals(round.tokenSymbol)

          const donations = round.projects.map(project => {
            const resolvedRecipient =
              project.walletAddress ??
              project.recipientAddresses?.find(
                a => a.networkId === round.selectedChainId,
              )?.address

            if (!resolvedRecipient) {
              throw new Error(
                `Missing recipient address for project "${project.title}" on chain ${round.selectedChainId}`,
              )
            }

            return {
              projectAddress: resolvedRecipient,
              amount: parseUnits(project.donationAmount || '0', tokenDecimals),
              tokenAddress: round.tokenAddress,
              tokenSymbol: round.tokenSymbol,
              chainId: round.selectedChainId,
            }
          })

          const shouldAddGivethDonation =
            givethPercentage > 0 && givethPercentage < 100

          if (shouldAddGivethDonation) {
            const givethRecipient = givethProjectData?.project?.addresses?.find(
              address => address.networkId === round.selectedChainId,
            )?.address

            if (!givethRecipient) {
              console.warn(
                `Missing Giveth recipient address for chain ${round.selectedChainId}. Skipping Giveth percentage donation.`,
              )
            } else {
              const roundTotalAmount = Number(round.totalAmount || '0')
              const givethAmount =
                roundTotalAmount * (givethPercentage / (100 - givethPercentage))

              if (givethAmount > 0) {
                donations.push({
                  projectAddress: givethRecipient,
                  amount: parseUnits(givethAmount.toString(), tokenDecimals),
                  tokenAddress: round.tokenAddress,
                  tokenSymbol: round.tokenSymbol,
                  chainId: round.selectedChainId,
                })
              }
            }
          }

          const totalAmount = donations.reduce(
            (sum, d) => sum + d.amount,
            BigInt(0),
          )

          const batchDetails: BatchDonationDetails = {
            donations,
            chainId: round.selectedChainId,
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
          const result = await batchDonate(batchDetails)
          if (!result.success) {
            throw new Error(result.error || 'Transaction failed')
          }

          // Persist donation records in backend (one per project) after tx succeeds.
          // NOTE: We don't fail the on-chain donation if this step fails; we log and continue.
          const txHash = result.transactionHash
          if (txHash) {
            // Backend requires auth for createDonation (UNAUTHENTICATED otherwise).
            // If user isn't signed in, skip persistence without affecting on-chain donation.
            if (!token) {
              console.warn(
                'Skipping createDonation persistence: missing JWT token (user not signed in).',
              )
            } else {
              const createInputs: CreateDonationInput[] = round.projects.map(
                project => ({
                  amount: Number(project.donationAmount || 0),
                  anonymous: options?.anonymous,
                  chainType: 'EVM',
                  currency: round.tokenSymbol,
                  fromWalletAddress: account.address,
                  projectId: Number(project.id),
                  qfRoundId: round.roundId,
                  toWalletAddress:
                    project.walletAddress ??
                    project.recipientAddresses?.find(
                      a => a.networkId === round.selectedChainId,
                    )?.address ??
                    '',
                  tokenAddress:
                    round.tokenAddress ===
                      '0x0000000000000000000000000000000000000000' ||
                    !round.tokenAddress
                      ? undefined
                      : round.tokenAddress,
                  transactionId: txHash,
                  transactionNetworkId: round.selectedChainId,
                }),
              )

              if (shouldAddGivethDonation) {
                const givethRecipient =
                  givethProjectData?.project?.addresses?.find(
                    address => address.networkId === round.selectedChainId,
                  )?.address
                const roundTotalAmount = Number(round.totalAmount || '0')
                const givethAmount =
                  roundTotalAmount *
                  (givethPercentage / (100 - givethPercentage))

                if (givethRecipient && givethAmount > 0) {
                  createInputs.push({
                    amount: givethAmount,
                    anonymous: options?.anonymous,
                    chainType: 'EVM',
                    currency: round.tokenSymbol,
                    fromWalletAddress: account.address,
                    projectId: GIVETH_PROJECT_ID,
                    qfRoundId: round.roundId,
                    toWalletAddress: givethRecipient,
                    tokenAddress:
                      round.tokenAddress ===
                        '0x0000000000000000000000000000000000000000' ||
                      !round.tokenAddress
                        ? undefined
                        : round.tokenAddress,
                    transactionId: txHash,
                    transactionNetworkId: round.selectedChainId,
                  })
                }
              }

              const saveResults = await Promise.allSettled(
                createInputs.map(input =>
                  createGraphQLClient({
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }).request(createDonationMutation, { input }),
                ),
              )

              const failedSaves = saveResults.filter(
                r => r.status === 'rejected',
              )
              if (failedSaves.length > 0) {
                console.error(
                  `Failed to persist ${failedSaves.length} donation record(s) for round ${round.roundId}`,
                  failedSaves.map(r =>
                    r.status === 'rejected' ? r.reason : undefined,
                  ),
                )
              }
            }
          }

          // Success! Update status
          completed++
          setState(prev => {
            const newStatuses = new Map(prev.roundStatuses)
            newStatuses.set(round.roundId, {
              ...newStatuses.get(round.roundId)!,
              status: 'success',
              transactionHash: result.transactionHash,
              bundleId: result.bundleId,
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
            ? rounds.length > 1
              ? 'All rounds transactions failed'
              : 'Round transaction failed'
            : failed > 0
              ? `${failed} of ${rounds.length} rounds failed`
              : undefined,
      }))
    },
    [
      account,
      activeChain,
      switchChain,
      batchDonate,
      validateRounds,
      token,
      givethPercentage,
      givethProjectData?.project,
      setGivethPercentage,
    ],
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
