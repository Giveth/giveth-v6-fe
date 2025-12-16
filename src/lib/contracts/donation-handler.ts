/**
 * Donation Handler Contract Integration
 * Contract Address: 0x6e349c56f512cb4250276bf36335c8dd618944a1 (Polygon)
 *
 * This service provides utilities for interacting with the donation handler contract
 * and supports EIP-7702 and EIP-5792 for batch transactions.
 */

import { prepareContractCall, type ThirdwebContract } from 'thirdweb'
import { getContract } from 'thirdweb'
import { polygon } from 'thirdweb/chains'
import { thirdwebClient } from '@/lib/thirdweb/client'

/**
 * Contract addresses by chain ID
 */
export const DONATION_HANDLER_ADDRESSES: Record<number, string> = {
  137: '0x6e349c56f512cb4250276bf36335c8dd618944a1', // Polygon Mainnet
  // Add other chains as needed
}

/**
 * Donation Handler Contract ABI
 * Based on actual contract at 0x6e349c56f512cb4250276bf36335c8dd618944a1
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
    chain: polygon, // Update based on chainId
    address,
  })
}

/**
 * Get ERC20 token contract instance
 */
export function getERC20Contract(tokenAddress: string): ThirdwebContract {
  return getContract({
    client: thirdwebClient,
    chain: polygon,
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
 * Common token addresses by chain
 * Note: In production, these should come from the backend/QF round configuration
 */
export const TOKEN_ADDRESSES: Record<number, Record<string, string>> = {
  137: {
    // Polygon
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
  },
  10: {
    // Optimism
    USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    WETH: '0x4200000000000000000000000000000000000006',
  },
  1: {
    // Ethereum Mainnet
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  100: {
    // Gnosis
    USDT: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
    USDC: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
    DAI: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
    WETH: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
  },
}

/**
 * Get token address by symbol and chain
 * Falls back to TOKEN_ADDRESSES if not provided from backend
 */
export function getTokenAddress(
  chainId: number,
  symbol: string,
  customAddress?: string,
): string {
  // If custom address provided (from backend), use that
  if (customAddress) {
    return customAddress
  }

  // Otherwise fallback to hardcoded addresses
  const chainTokens = TOKEN_ADDRESSES[chainId]
  if (!chainTokens) {
    throw new Error(`Chain ${chainId} not supported`)
  }

  const tokenAddress = chainTokens[symbol]
  if (!tokenAddress) {
    throw new Error(`Token ${symbol} not found on chain ${chainId}`)
  }

  return tokenAddress
}

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
