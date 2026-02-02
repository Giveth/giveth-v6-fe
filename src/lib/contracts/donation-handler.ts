/**
 * Donation Handler Contract Integration
 * Contract Address: 0x6e349c56f512cb4250276bf36335c8dd618944a1 (Polygon)
 *
 * This service provides utilities for interacting with the donation handler contract
 * and supports EIP-7702 and EIP-5792 for batch transactions.
 */

import { prepareContractCall, type ThirdwebContract } from 'thirdweb'
import { getContract } from 'thirdweb'
import { defineChain } from 'thirdweb/chains'
import { thirdwebClient } from '@/lib/thirdweb/client'

/**
 * Contract addresses by chain ID
 */
export const DONATION_HANDLER_ADDRESSES: Record<number, string> = {
  137: '0x6e349c56f512cb4250276bf36335c8dd618944a1', // Polygon Mainnet
  100: '0x97b2cb568e0880B99Cd16EFc6edFF5272Aa02676', // Gnosis Mainnet
  10: '0x8D685A56C51Cf54685d3dB0Ea50748D3A2c2e0dC', // Optimism Mainnet
  1: '0x97b2cb568e0880B99Cd16EFc6edFF5272Aa02676', // Ethereum Mainnet
  42220: '0x97b2cb568e0880B99Cd16EFc6edFF5272Aa02676', // Celo Mainnet
  42161: '0x97b2cb568e0880B99Cd16EFc6edFF5272Aa02676', // Arbitrum One Mainnet
  8453: '0x7a5D2A00a25b95fd8739bc52Cd79f8F971C37Ca1', // Base Mainnet
  // Add other chains as needed
}

/**
 * Donation Handler Contract ABI
 * Based on actual contract at 0x6e349c56f512cb4250276bf36335c8dd618944a1 on Polygon Mainnet
 */
export const DONATION_HANDLER_ABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'totalAmount',
        type: 'uint256',
      },
      {
        internalType: 'address[]',
        name: 'recipientAddresses',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes[]',
        name: 'data',
        type: 'bytes[]',
      },
    ],
    name: 'donateManyERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'totalAmount',
        type: 'uint256',
      },
      {
        internalType: 'address[]',
        name: 'recipientAddresses',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes[]',
        name: 'data',
        type: 'bytes[]',
      },
    ],
    name: 'donateManyETH',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const

/**
 * Standard ERC20 ABI for token approval
 */
export const ERC20_ABI = [
  {
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

/**
 * Get donation handler contract instance
 */
export function getDonationHandlerContract(chainId: number): ThirdwebContract {
  const address = DONATION_HANDLER_ADDRESSES[chainId]
  if (!address) {
    throw new Error(`Donation handler not supported on chain ${chainId}`)
  }

  return getContract({
    client: thirdwebClient,
    chain: defineChain(chainId),
    address,
  })
}

/**
 * Get ERC20 token contract instance
 */
export function getERC20Contract(
  chainId: number,
  tokenAddress: string,
): ThirdwebContract {
  return getContract({
    client: thirdwebClient,
    chain: defineChain(chainId),
    address: tokenAddress,
  })
}

/**
 * Prepare a batch ERC20 donation transaction
 */
export function prepareDonateManyERC20(
  contract: ThirdwebContract,
  tokenAddress: string,
  totalAmount: bigint,
  recipients: string[],
  amounts: bigint[],
  data: `0x${string}`[] = [],
) {
  // If no data provided, create empty bytes for each recipient
  const dataBytes: `0x${string}`[] =
    data.length > 0 ? data : recipients.map(() => '0x' as `0x${string}`)

  return prepareContractCall({
    contract,
    method:
      'function donateManyERC20(address tokenAddress, uint256 totalAmount, address[] recipientAddresses, uint256[] amounts, bytes[] data)',
    params: [tokenAddress, totalAmount, recipients, amounts, dataBytes],
  })
}

/**
 * Prepare a batch ETH donation transaction
 */
export function prepareDonateManyETH(
  contract: ThirdwebContract,
  totalAmount: bigint,
  recipients: string[],
  amounts: bigint[],
  data: `0x${string}`[] = [],
) {
  // If no data provided, create empty bytes for each recipient
  const dataBytes: `0x${string}`[] =
    data.length > 0 ? data : recipients.map(() => '0x' as `0x${string}`)

  return prepareContractCall({
    contract,
    method:
      'function donateManyETH(uint256 totalAmount, address[] recipientAddresses, uint256[] amounts, bytes[] data) payable',
    params: [totalAmount, recipients, amounts, dataBytes],
    value: totalAmount, // Send ETH with the transaction
  })
}

/**
 * Prepare token approval transaction
 */
export function prepareTokenApproval(
  tokenContract: ThirdwebContract,
  spenderAddress: string,
  amount: bigint,
) {
  return prepareContractCall({
    contract: tokenContract,
    method: 'function approve(address _spender, uint256 _value) returns (bool)',
    params: [spenderAddress, amount],
  })
}

/**
 * Token Configuration
 *
 * Token addresses and configuration are managed in the backend database
 * and should be fetched using the GraphQL API.
 *
 * @see useTokens hook in @/hooks/useTokens for fetching token data
 * @see TokenService in backend (giveth-v6-core/src/services/token)
 *
 * To add/update tokens:
 * 1. Update the Token table in the backend database
 * 2. Frontend will automatically fetch the latest configuration
 *
 * GraphQL Queries Available:
 * - tokens: Fetch all active tokens
 * - tokensByNetwork(networkId: Int!): Fetch tokens for a specific network
 */

/**
 * Donation details for transaction
 */
export interface DonationDetails {
  projectAddress: string
  amount: bigint
  tokenAddress: string
  tokenSymbol: string
  chainId: number
}

/**
 * Batch donation details
 */
export interface BatchDonationDetails {
  donations: DonationDetails[]
  chainId: number
  tokenAddress: string
  totalAmount: bigint
}
