import { IconArgent } from '@/components/icons/wallets/IconArgent'
import { IconBinance } from '@/components/icons/wallets/IconBinance'
import { IconBrave } from '@/components/icons/wallets/IconBrave'
import { IconCoinbase } from '@/components/icons/wallets/IconCoinbase'
import { IconLedger } from '@/components/icons/wallets/IconLedger'
import { IconMetamask } from '@/components/icons/wallets/IconMetamask'
import { IconOKX } from '@/components/icons/wallets/IconOKX'
import { IconPhantom } from '@/components/icons/wallets/IconPhantom'
import { IconRabby } from '@/components/icons/wallets/IconRabby'
import { IconRainbow } from '@/components/icons/wallets/IconRainbow'
import { IconSafe } from '@/components/icons/wallets/IconSafe'
import { IconTrust } from '@/components/icons/wallets/IconTrust'
import type { ChainInfo } from '@/lib/types/chain'

export const CHAINS: Record<number, ChainInfo> = {
  // Mainnets
  1: {
    id: 1,
    name: 'Ethereum',
    shortName: 'ETH',
    blockExplorerUrl: 'https://etherscan.io/',
    iconKey: 'ethereum',
    isTestnet: false,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  10: {
    id: 10,
    name: 'Optimism',
    shortName: 'OP',
    blockExplorerUrl: 'https://explorer.optimism.io/',
    iconKey: 'optimism',
    isTestnet: false,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  56: {
    id: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    blockExplorerUrl: 'https://bscscan.com/',
    iconKey: 'bsc',
    isTestnet: false,
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
  },
  61: {
    id: 61,
    name: 'Ethereum Classic',
    shortName: 'ETC',
    blockExplorerUrl: 'https://etc.blockscout.com/',
    iconKey: 'etc',
    isTestnet: false,
    nativeCurrency: {
      name: 'Ethereum Classic',
      symbol: 'ETC',
      decimals: 18,
    },
  },
  100: {
    id: 100,
    name: 'Gnosis Chain',
    shortName: 'GNO',
    blockExplorerUrl: 'https://gnosis.blockscout.com/',
    iconKey: 'gnosis',
    isTestnet: false,
    nativeCurrency: {
      name: 'xDAI',
      symbol: 'XDAI',
      decimals: 18,
    },
  },
  137: {
    id: 137,
    name: 'Polygon',
    shortName: 'MATIC',
    blockExplorerUrl: 'https://polygonscan.com/',
    iconKey: 'polygon',
    isTestnet: false,
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  42220: {
    id: 42220,
    name: 'Celo',
    shortName: 'CELO',
    blockExplorerUrl: 'https://explorer.celo.org/mainnet/',
    iconKey: 'celo',
    isTestnet: false,
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    },
  },
  42161: {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'ARB',
    blockExplorerUrl: 'https://arbiscan.io/',
    iconKey: 'arbitrum',
    isTestnet: false,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  8453: {
    id: 8453,
    name: 'Base',
    shortName: 'BASE',
    blockExplorerUrl: 'https://basescan.org/',
    iconKey: 'base',
    isTestnet: false,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  1101: {
    id: 1101,
    name: 'Polygon zkEVM',
    shortName: 'ZK',
    blockExplorerUrl: 'https://zkevm.polygonscan.com/',
    iconKey: 'zkevm',
    isTestnet: false,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  101: {
    id: 101,
    name: 'Solana',
    shortName: 'SOL',
    blockExplorerUrl: 'https://explorer.solana.com/',
    iconKey: 'solana',
    isTestnet: false,
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
    },
  },
  1500: {
    id: 1500,
    name: 'Stellar',
    shortName: 'XLM',
    blockExplorerUrl: 'https://stellar.expert/explorer/public/',
    iconKey: 'stellar',
    isTestnet: false,
    nativeCurrency: {
      name: 'Stellar Lumens',
      symbol: 'XLM',
      decimals: 7,
    },
  },
  3000: {
    id: 3000,
    name: 'Cardano',
    shortName: 'ADA',
    blockExplorerUrl: 'https://cardanoscan.io/',
    iconKey: 'cardano',
    isTestnet: false,
    nativeCurrency: {
      name: 'Ada',
      symbol: 'ADA',
      decimals: 6,
    },
  },

  // Testnets
  3: {
    id: 3,
    name: 'Ropsten',
    shortName: 'ROP',
    blockExplorerUrl: 'https://ropsten.etherscan.io/',
    iconKey: 'ethereum',
    isTestnet: true,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  11155111: {
    id: 11155111,
    name: 'Sepolia',
    shortName: 'SEP',
    blockExplorerUrl: 'https://sepolia.etherscan.io/',
    iconKey: 'ethereum',
    isTestnet: true,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  63: {
    id: 63,
    name: 'Mordor',
    shortName: 'MOR',
    blockExplorerUrl: 'https://etc-mordor.blockscout.com/',
    iconKey: 'etc',
    isTestnet: true,
    nativeCurrency: {
      name: 'Mordor ETC',
      symbol: 'mETC',
      decimals: 18,
    },
  },
  44787: {
    id: 44787,
    name: 'Celo Alfajores Testnet',
    shortName: 'ALF',
    blockExplorerUrl: 'https://explorer.celo.org/alfajores/',
    iconKey: 'celo',
    isTestnet: true,
    nativeCurrency: {
      name: 'CELO',
      symbol: 'CELO',
      decimals: 18,
    },
  },
  11155420: {
    id: 11155420,
    name: 'Optimism Sepolia',
    shortName: 'OP-SEP',
    blockExplorerUrl: 'https://sepolia-optimism.etherscan.io/',
    iconKey: 'optimism',
    isTestnet: true,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  421614: {
    id: 421614,
    name: 'Arbitrum Sepolia Testnet',
    shortName: 'ARB-SEP',
    blockExplorerUrl: 'https://sepolia.arbiscan.io/',
    iconKey: 'arbitrum',
    isTestnet: true,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  84532: {
    id: 84532,
    name: 'Base Sepolia Testnet',
    shortName: 'BASE-SEP',
    blockExplorerUrl: 'https://sepolia.basescan.org/',
    iconKey: 'base',
    isTestnet: true,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  2442: {
    id: 2442,
    name: 'Polygon zkEVM Cardona',
    shortName: 'ZK-CARD',
    blockExplorerUrl: 'https://cardona-zkevm.polygonscan.com/',
    iconKey: 'zkevm',
    isTestnet: true,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  102: {
    id: 102,
    name: 'Solana Testnet',
    shortName: 'SOL-T',
    blockExplorerUrl: 'https://explorer.solana.com/',
    iconKey: 'solana',
    isTestnet: true,
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
    },
  },
  103: {
    id: 103,
    name: 'Solana Devnet',
    shortName: 'SOL-D',
    blockExplorerUrl: 'https://explorer.solana.com/',
    iconKey: 'solana',
    isTestnet: true,
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
    },
  },
  3001: {
    id: 3001,
    name: 'Cardano Preprod',
    shortName: 'ADA-P',
    blockExplorerUrl: 'https://preprod.cardanoscan.io/',
    iconKey: 'cardano',
    isTestnet: true,
    nativeCurrency: {
      name: 'Ada',
      symbol: 'ADA',
      decimals: 6,
    },
  },
}

// SVG icons from cryptocurrency-icons package via jsDelivr CDN
const ETH_ICON =
  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/eth.svg'
// Optimism icon (use stable public asset)
const OP_ICON =
  'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg?v=010'
const MATIC_ICON =
  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/matic.svg'
const ARB_ICON = 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=025'
const BASE_ICON =
  'https://raw.githubusercontent.com/Aero25x/Cryptocurrencies-Logo/main/Base.svg'
const SOL_ICON =
  'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/svg/color/sol.svg'

export const CHAIN_ICONS: Record<
  string,
  { bg: string; iconUrl: string; fallbackIcon: string; textColor?: string }
> = {
  ethereum: {
    bg: 'bg-blue-50',
    iconUrl: ETH_ICON,
    fallbackIcon: '◆',
    textColor: 'text-white',
  },
  optimism: {
    bg: 'bg-red-50',
    iconUrl: OP_ICON,
    fallbackIcon: '⬤',
    textColor: 'text-white',
  },
  bsc: {
    bg: 'bg-yellow-50',
    iconUrl:
      'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/bnb.svg',
    fallbackIcon: '●',
    textColor: 'text-black',
  },
  etc: {
    bg: 'bg-green-50',
    iconUrl:
      'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/etc.svg',
    fallbackIcon: '◈',
    textColor: 'text-white',
  },
  gnosis: {
    bg: 'bg-teal-50',
    iconUrl:
      'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/gno.svg',
    fallbackIcon: '◎',
    textColor: 'text-white',
  },
  polygon: {
    bg: 'bg-purple-50',
    iconUrl: MATIC_ICON,
    fallbackIcon: '⬡',
    textColor: 'text-white',
  },
  celo: {
    bg: 'bg-emerald-50',
    iconUrl:
      'https://raw.githubusercontent.com/celo-org/celo-token-list/main/assets/celo_logo.svg',
    fallbackIcon: '○',
    textColor: 'text-black',
  },
  arbitrum: {
    bg: 'bg-sky-50',
    iconUrl: ARB_ICON,
    fallbackIcon: '△',
    textColor: 'text-white',
  },
  base: {
    bg: 'bg-blue-50',
    iconUrl: BASE_ICON,
    fallbackIcon: '▽',
    textColor: 'text-white',
  },
  zkevm: {
    bg: 'bg-purple-50',
    iconUrl: MATIC_ICON,
    fallbackIcon: '⬡',
    textColor: 'text-white',
  },
  solana: {
    bg: 'bg-purple-50',
    iconUrl: SOL_ICON,
    fallbackIcon: '◎',
    textColor: 'text-white',
  },
  stellar: {
    bg: 'bg-cyan-50',
    iconUrl:
      'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/xlm.svg',
    fallbackIcon: '☆',
    textColor: 'text-black',
  },
  cardano: {
    bg: 'bg-blue-50',
    iconUrl:
      'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/ada.svg',
    fallbackIcon: '◇',
    textColor: 'text-white',
  },
}

export const EXPLORER_BY_CHAIN_ID: Record<number, string> = {
  // Ethereum
  1: 'https://eth.blockscout.com/',
  11155111: 'https://eth-sepolia.blockscout.com/',

  // Optimism
  10: 'https://optimistic.blockscout.com/',
  11155420: 'https://optimism-sepolia.blockscout.com/',

  // Gnosis
  100: 'https://gnosis.blockscout.com/',

  // Polygon
  137: 'https://polygon.blockscout.com/',

  // Base
  8453: 'https://base.blockscout.com/',
  84532: 'https://base-sepolia.blockscout.com/',

  // Arbitrum
  42161: 'https://arbitrum.blockscout.com/',
  421614: 'https://arbitrum-sepolia.blockscout.com/',

  // Celo
  42220: 'https://explorer.celo.org/mainnet/',
  44787: 'https://explorer.celo.org/alfajores/',

  // Polygon zkEVM
  1101: 'https://zkevm.blockscout.com/',
  2442: 'https://cardona-zkevm.blockscout.com/',

  // Ethereum Classic
  63: 'https://etc-mordor.blockscout.com/',

  // Solana (no Blockscout)
  101: 'https://explorer.solana.com/',
  102: 'https://explorer.solana.com/',
  103: 'https://explorer.solana.com/',

  // Stellar (no Blockscout)
  1500: 'https://stellar.expert/explorer/public/',

  // Cardano (no Blockscout)
  3000: 'https://cardanoscan.io/',
  3001: 'https://preprod.cardanoscan.io/',

  // Deprecated / legacy
  3: 'https://ropsten.etherscan.io/',
}

/**
 * Get the explorer URL for a given chain ID and transaction hash
 * If the chain ID is not found, it will return the Polygon explorer URL
 *
 * @param chainId - The chain ID
 * @param hash - The transaction hash
 * @returns The explorer URL
 */
export const getTransactionExplorerUrl = (chainId: number, hash: string) => {
  const base = EXPLORER_BY_CHAIN_ID[chainId] || 'https://polygonscan.com'
  return `${base}/tx/${hash}`
}

export const cryptoWallets: Record<
  string,
  {
    icon: React.FC<{ width?: number; height?: number; className?: string }>
    name: string
  }
> = {
  'io.metamask': { icon: IconMetamask, name: 'MetaMask' },
  'com.trustwallet.app': { icon: IconTrust, name: 'Trust Wallet' },
  'com.coinbase.wallet': { icon: IconCoinbase, name: 'Coinbase Wallet' },
  'me.rainbow': { icon: IconRainbow, name: 'Rainbow' },
  'app.phantom': { icon: IconPhantom, name: 'Phantom' },
  'im.argent': { icon: IconArgent, name: 'Argent' },
  'com.okex.wallet': { icon: IconOKX, name: 'OKX Wallet' },
  'io.gnosis.safe': { icon: IconSafe, name: 'Safe Wallet' },
  'io.rabby': { icon: IconRabby, name: 'Rabby' },
  'com.wallet.brave': { icon: IconBrave, name: 'Brave' },
  ledger: { icon: IconLedger, name: 'Ledger' },
  'com.binance.wallet': { icon: IconBinance, name: 'Binance' },
}
