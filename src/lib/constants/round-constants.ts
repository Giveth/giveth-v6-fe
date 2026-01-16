import { CHAINS } from './chain'

export const NETWROKS_FILTERS = [
  'Arbitrum',
  'Base',
  'Celo',
  'Gnosis',
  'Ethereum Classic',
  'Mainnet',
  'Optimism',
  'Polygon',
]

export const NETWORK_FILTERS_NAME_TO_ID = NETWROKS_FILTERS.reduce<
  Record<string, number>
>((acc, networkName) => {
  const match = Object.entries(CHAINS).find(
    ([, value]) => value.name === networkName,
  )
  if (!match) return acc
  const [id] = match
  acc[networkName] = Number(id)
  return acc
}, {})
