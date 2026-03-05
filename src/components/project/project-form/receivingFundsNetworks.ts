import { isProd } from '@/lib/env'

const DEV_RECEIVING_FUNDS_NETWORKS = [
  { id: 11155111, name: 'Sepolia' },
  { id: 11155420, name: 'Optimism Sepolia' },
  { id: 84532, name: 'Base Sepolia' },
] as const

const PROD_RECEIVING_FUNDS_NETWORKS = [
  { id: 1, name: 'Ethereum' },
  { id: 137, name: 'Polygon' },
  { id: 100, name: 'Gnosis' },
  { id: 10, name: 'Optimism' },
  { id: 8453, name: 'Base' },
] as const

export const RECEIVING_FUNDS_NETWORKS = isProd
  ? PROD_RECEIVING_FUNDS_NETWORKS
  : [...DEV_RECEIVING_FUNDS_NETWORKS, ...PROD_RECEIVING_FUNDS_NETWORKS]

export const RECEIVING_FUNDS_NETWORK_IDS = RECEIVING_FUNDS_NETWORKS.map(
  network => network.id,
)
