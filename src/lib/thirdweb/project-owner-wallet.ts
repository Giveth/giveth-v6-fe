import { defineChain } from 'thirdweb'
import { smartWallet, type Account, type Wallet } from 'thirdweb/wallets'
import { CHAINS } from '@/lib/constants/chain'
import { thirdwebClient } from '@/lib/thirdweb/client'

export const PROJECT_OWNER_EVM_NETWORK_IDS = [
  CHAINS[1].id, // Ethereum
  CHAINS[10].id, // Optimism
  CHAINS[100].id, // Gnosis Chain
  CHAINS[137].id, // Polygon
  CHAINS[42161].id, // Arbitrum One
  CHAINS[42220].id, // Celo
  CHAINS[8453].id, // Base
] as const

const getRecipientTitle = (networkId: number): string => {
  return `${CHAINS[networkId]?.name ?? `Chain ${networkId}`} recipient`
}

export type ProjectOwnerRecipientAddress = {
  chainType: 'EVM'
  networkId: number
  address: string
  title?: string
}

export function resolveProjectOwnerAdminAccount(
  wallet: Wallet | undefined,
  fallbackAccount: Account | undefined,
): Account | null {
  return wallet?.getAdminAccount?.() ?? fallbackAccount ?? null
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
          title: getRecipientTitle(networkId),
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
          title: getRecipientTitle(networkId),
        }
      } finally {
        await wallet.disconnect().catch(() => undefined)
      }
    }),
  )

  return results
}
