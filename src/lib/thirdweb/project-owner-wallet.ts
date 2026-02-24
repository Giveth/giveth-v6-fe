import { defineChain } from 'thirdweb'
import { smartWallet, type Account, type Wallet } from 'thirdweb/wallets'
import { thirdwebClient } from '@/lib/thirdweb/client'

export const PROJECT_OWNER_EVM_NETWORK_IDS = [
  1, // Ethereum
  10, // Optimism
  100, // Gnosis
  137, // Polygon
  42161, // Arbitrum One
  42220, // Celo
  8453, // Base
] as const

const CHAIN_LABELS: Record<number, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  100: 'Gnosis',
  137: 'Polygon',
  42161: 'Arbitrum',
  42220: 'Celo',
  8453: 'Base',
}

export type ProjectOwnerRecipientAddress = {
  chainType: 'EVM'
  networkId: number
  address: string
  title?: string
}

export function resolveProjectOwnerAdminAccount(
  wallet: Wallet | undefined,
  activeAccount: Account | undefined,
): Account | null {
  return wallet?.getAdminAccount?.() ?? activeAccount ?? null
}

export function createProjectAccountSalt(
  projectIdentity: string | number,
): string {
  return `project:${projectIdentity}`
}

export async function deriveProjectOwnerRecipientAddresses(args: {
  adminAccount: Account
  accountSalt: string
  networkIds?: readonly number[]
}): Promise<ProjectOwnerRecipientAddress[]> {
  const { adminAccount, accountSalt } = args
  const networkIds = args.networkIds ?? PROJECT_OWNER_EVM_NETWORK_IDS

  const results = await Promise.all(
    networkIds.map(async networkId => {
      const wallet = smartWallet({
        chain: defineChain(networkId),
        sponsorGas: true,
        overrides: {
          accountSalt,
        },
      })

      try {
        const account = await wallet.connect({
          client: thirdwebClient,
          personalAccount: adminAccount,
        })

        return {
          chainType: 'EVM' as const,
          networkId,
          address: account.address,
          title: `${CHAIN_LABELS[networkId] || `Chain ${networkId}`} recipient`,
        }
      } catch (error) {
        console.error(
          `Failed to derive smart account on chain ${networkId}, falling back to admin account`,
          error,
        )

        return {
          chainType: 'EVM' as const,
          networkId,
          address: adminAccount.address,
          title: `${CHAIN_LABELS[networkId] || `Chain ${networkId}`} recipient`,
        }
      } finally {
        await wallet.disconnect().catch(() => undefined)
      }
    }),
  )

  return results
}
