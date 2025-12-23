'use client'

import { useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { Button } from '@/components/ui/button'
import { useDonation } from '@/hooks/useDonation'
import { useMultiRoundCheckout } from '@/hooks/useMultiRoundCheckout'

// Mock data for testing
const MOCK_PROJECT = {
  id: '1',
  title: 'Test Project - Save the Whales',
  slug: 'test-project',
  image: 'https://via.placeholder.com/400x300',
}

const MOCK_QF_ROUND = {
  id: '230',
  name: 'Test QF Round',
  slug: 'test-qf-round',
  isActive: true,
}

const NETWORK_TOKENS: Record<number, Array<{ symbol: string; name: string; address: string; isNative: boolean; decimals: number }>> = {
  // Ethereum Mainnet
  1: [
    { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', isNative: true, decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', isNative: false, decimals: 6 },
    { symbol: 'USDT', name: 'Tether', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', isNative: false, decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', isNative: false, decimals: 18 },
  ],
  // Optimism
  10: [
    { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', isNative: true, decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', isNative: false, decimals: 6 },
    { symbol: 'USDT', name: 'Tether', address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', isNative: false, decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', isNative: false, decimals: 18 },
  ],
  // Gnosis
  100: [
    { symbol: 'xDAI', name: 'xDAI', address: '0x0000000000000000000000000000000000000000', isNative: true, decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', isNative: false, decimals: 6 },
    { symbol: 'USDT', name: 'Tether', address: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6', isNative: false, decimals: 6 },
    { symbol: 'GNO', name: 'Gnosis Token', address: '0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb', isNative: false, decimals: 18 },
  ],
  // Polygon
  137: [
    { symbol: 'MATIC', name: 'MATIC', address: '0x0000000000000000000000000000000000000000', isNative: true, decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', isNative: false, decimals: 6 },
    { symbol: 'USDT', name: 'Tether', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', isNative: false, decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', isNative: false, decimals: 18 },
  ],
  // Base
  8453: [
    { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', isNative: true, decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', isNative: false, decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', isNative: false, decimals: 18 },
  ],
  // Arbitrum One
  42161: [
    { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000', isNative: true, decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', isNative: false, decimals: 6 },
    { symbol: 'USDT', name: 'Tether', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', isNative: false, decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', isNative: false, decimals: 18 },
  ],
}

const SUPPORTED_NETWORKS = [
  { id: 100, name: 'Gnosis', nativeCurrency: 'xDAI', explorer: 'https://gnosisscan.io' },
  { id: 10, name: 'Optimism', nativeCurrency: 'ETH', explorer: 'https://optimistic.etherscan.io' },
  { id: 42161, name: 'Arbitrum One', nativeCurrency: 'ETH', explorer: 'https://arbiscan.io' },
  { id: 8453, name: 'Base', nativeCurrency: 'ETH', explorer: 'https://basescan.org' },
  { id: 1, name: 'Ethereum Mainnet', nativeCurrency: 'ETH', explorer: 'https://etherscan.io' },
  { id: 137, name: 'Polygon', nativeCurrency: 'MATIC', explorer: 'https://polygonscan.com' },
]

// Helper function to get block explorer URL
const getExplorerUrl = (chainId: number, type: 'tx' | 'address', value: string) => {
  const network = SUPPORTED_NETWORKS.find(n => n.id === chainId)
  if (!network) return '#'
  return `${network.explorer}/${type}/${value}`
}

export default function TestDonationPage() {
  const account = useActiveAccount()
  const [projectAddress, setProjectAddress] = useState('0x1234567890123456789012345678901234567890')
  const [selectedNetwork, setSelectedNetwork] = useState(100)
  const [selectedToken, setSelectedToken] = useState('xDAI') // Gnosis native token
  const [donationAmount, setDonationAmount] = useState('10')
  const [isInQfRound, setIsInQfRound] = useState(true)

  // Get available tokens for the selected network
  const availableTokens = NETWORK_TOKENS[selectedNetwork] || []

  // Handle network change and update token if needed
  const handleNetworkChange = (networkId: number) => {
    setSelectedNetwork(networkId)
    const newAvailableTokens = NETWORK_TOKENS[networkId] || []
    
    // If current token is not available on the new network, select the native token
    const isTokenAvailable = newAvailableTokens.some(t => t.symbol === selectedToken)
    if (!isTokenAvailable && newAvailableTokens.length > 0) {
      const nativeToken = newAvailableTokens.find(t => t.isNative)
      if (nativeToken) {
        setSelectedToken(nativeToken.symbol)
      }
    }
  }

  // Single donation hook
  const { state: donationState, donate, reset: resetDonation } = useDonation()

  // Cart state (manual management for testing)
  const [cartItems, setCartItems] = useState<Array<{
    id: string
    projectId: string
    projectTitle: string
    projectSlug: string
    projectAddress: string
    amount: string
    chainId: number
    tokenAddress?: string
    qfRoundId?: number
    qfRoundName?: string
  }>>([])

  // Multi-round checkout hook  
  const {
    state: checkoutState,
    checkoutAllRounds,
    reset: resetCheckout,
  } = useMultiRoundCheckout()

  // Cart management functions
  const addToCart = (item: typeof cartItems[0]) => {
    setCartItems(prev => [...prev, { ...item, id: Date.now().toString() }])
  }

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCartItems([])
    resetCheckout()
  }

  const handleSingleDonation = async () => {
    if (!account) {
      alert('Please connect your wallet first!')
      return
    }

    if (!projectAddress || !projectAddress.startsWith('0x')) {
      alert('Please enter a valid project address!')
      return
    }

    const tokenInfo = availableTokens.find(t => t.symbol === selectedToken)
    
    // Convert amount to BigInt with proper decimals
    const decimals = tokenInfo?.decimals || 18
    const amountInWei = BigInt(Math.floor(parseFloat(donationAmount) * 10 ** decimals))
    
    console.log('🎯 Making single donation...', {
      projectAddress,
      amount: donationAmount,
      amountInWei: amountInWei.toString(),
      chainId: selectedNetwork,
      token: selectedToken,
      tokenAddress: tokenInfo?.address,
      qfRoundId: isInQfRound ? MOCK_QF_ROUND.id : undefined,
    })

    await donate({
      projectAddress,
      amount: amountInWei,
      chainId: selectedNetwork,
      tokenAddress: tokenInfo?.address || '0x0000000000000000000000000000000000000000',
      tokenSymbol: selectedToken,
    })
  }

  const handleAddToCart = () => {
    if (!projectAddress || !projectAddress.startsWith('0x')) {
      alert('Please enter a valid project address!')
      return
    }

    addToCart({
      projectId: MOCK_PROJECT.id,
      projectTitle: MOCK_PROJECT.title,
      projectSlug: MOCK_PROJECT.slug,
      projectAddress,
      amount: donationAmount,
      chainId: selectedNetwork,
      tokenAddress: availableTokens.find(t => t.symbol === selectedToken)?.address,
      qfRoundId: isInQfRound ? Number(MOCK_QF_ROUND.id) : undefined,
      qfRoundName: isInQfRound ? MOCK_QF_ROUND.name : undefined,
    })
  }

  const handleCheckout = async () => {
    if (!account) {
      alert('Please connect your wallet first!')
      return
    }

    if (cartItems.length === 0) {
      alert('Cart is empty!')
      return
    }

    console.log('🛒 Starting cart checkout...', { items: cartItems })

    // Group cart items by chain
    const itemsByChain = cartItems.reduce((acc, item) => {
      if (!acc[item.chainId]) {
        acc[item.chainId] = []
      }
      acc[item.chainId].push(item)
      return acc
    }, {} as Record<number, typeof cartItems>)

    // Convert to DonationRound format expected by the hook
    const rounds = Object.entries(itemsByChain).map(([chainId, items], index) => {
      const tokenInfo = NETWORK_TOKENS[Number(chainId)]?.find(
        t => t.address === items[0]?.tokenAddress
      )
      
      // Calculate total amount for this round
      const totalAmount = items.reduce((sum, item) => {
        return sum + parseFloat(item.amount)
      }, 0)
      
      return {
        roundId: index + 1, // Required field
        roundName: items[0]?.qfRoundName || 'Direct Donation', // Required field
        chainId: Number(chainId),
        token: tokenInfo?.symbol || 'UNKNOWN', // Required field
        tokenAddress: items[0]?.tokenAddress || '0x0000000000000000000000000000000000000000', // Required field
        totalAmount: totalAmount.toString(), // Required field
        projects: items.map(item => {
          const projectTokenInfo = NETWORK_TOKENS[item.chainId]?.find(
            t => t.address === item.tokenAddress
          )
          // Convert amount to BigInt with proper decimals
          const decimals = projectTokenInfo?.decimals || 18
          const amountInWei = BigInt(Math.floor(parseFloat(item.amount) * 10 ** decimals))
          
          return {
            id: item.id,
            title: item.projectTitle,
            slug: item.projectSlug,
            walletAddress: item.projectAddress,
            donationAmount: item.amount,
            tokenSymbol: projectTokenInfo?.symbol || 'UNKNOWN',
            chainId: item.chainId,
            roundId: item.qfRoundId,
            roundName: item.qfRoundName,
            // Add these for the donation handler
            projectAddress: item.projectAddress,
            amount: amountInWei,
            tokenAddress: item.tokenAddress || '0x0000000000000000000000000000000000000000',
          }
        }),
      }
    })

    console.log('📦 Donation rounds:', rounds)
    await checkoutAllRounds(rounds)
  }

  return (
    <div className="min-h-screen bg-[#f7f7f9] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Donation Handler Test Page</h1>
        <p className="text-gray-600 mb-8">
          Test your donation handler integration with mock data
        </p>

        {/* Wallet Status */}
        <div className="bg-white rounded-lg p-4 mb-6 border">
          <h2 className="font-semibold mb-2">Wallet Status</h2>
          {account ? (
            <div className="text-sm">
              <p className="text-green-600">✅ Connected: {account.address}</p>
              <p className="text-gray-600">
                Chain ID: {selectedNetwork}
              </p>
            </div>
          ) : (
            <p className="text-red-600">❌ Not connected - Please connect your wallet</p>
          )}
        </div>

        {/* Mock Project Info */}
        <div className="bg-white rounded-lg p-6 mb-6 border">
          <h2 className="font-semibold text-xl mb-4">Mock Project</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <img
                src={MOCK_PROJECT.image}
                alt={MOCK_PROJECT.title}
                className="rounded-lg w-full"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">{MOCK_PROJECT.title}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Project ID: {MOCK_PROJECT.id}
              </p>
              <div className="bg-blue-50 p-3 rounded text-sm">
                <p className="font-semibold text-blue-800 mb-2">
                  💡 Tip: You can customize the project address below
                </p>
                <p className="text-blue-600 text-xs">
                  Use your own project address or test with the default one
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Donation Configuration */}
        <div className="bg-white rounded-lg p-6 mb-6 border">
          <h2 className="font-semibold text-xl mb-4">Configure Donation</h2>

          <div className="space-y-4">
            {/* Project Address */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Project Address *
              </label>
              <input
                type="text"
                value={projectAddress}
                onChange={e => setProjectAddress(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                placeholder="0x..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the recipient address (must start with 0x)
              </p>
            </div>

            {/* Network Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Network (Chain) *
              </label>
              <select
                value={selectedNetwork}
                onChange={e => handleNetworkChange(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {SUPPORTED_NETWORKS.map(network => (
                  <option key={network.id} value={network.id}>
                    {network.name} - {network.nativeCurrency} (Chain ID: {network.id})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Native Currency: {SUPPORTED_NETWORKS.find(n => n.id === selectedNetwork)?.nativeCurrency}
              </p>
            </div>

            {/* Token Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Token *
              </label>
              <select
                value={selectedToken}
                onChange={e => setSelectedToken(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {availableTokens.map(token => (
                  <option key={token.symbol} value={token.symbol}>
                    {token.name} ({token.symbol}){token.isNative ? ' - Native' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {availableTokens.find(t => t.symbol === selectedToken)?.isNative && (
                  <span className="text-green-600 font-semibold">Native Currency • </span>
                )}
                <span className="font-mono">
                  {availableTokens.find(t => t.symbol === selectedToken)?.address}
                </span>
                <span className="ml-2 text-gray-400">
                  • Decimals: {availableTokens.find(t => t.symbol === selectedToken)?.decimals}
                </span>
              </p>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Donation Amount *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={donationAmount}
                  onChange={e => setDonationAmount(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                />
                <div className="px-4 py-2 bg-gray-100 border rounded-lg text-sm font-medium">
                  {selectedToken}
                </div>
              </div>
            </div>

            {/* QF Round Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="qfRound"
                checked={isInQfRound}
                onChange={e => setIsInQfRound(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="qfRound" className="text-sm font-medium">
                Include in QF Round: {MOCK_QF_ROUND.name} (ID: {MOCK_QF_ROUND.id})
              </label>
            </div>
          </div>
        </div>

        {/* Single Donation Section */}
        <div className="bg-white rounded-lg p-6 mb-6 border">
          <h2 className="font-semibold text-xl mb-4">
            Test 1: Single Donation
          </h2>

          <div className="space-y-4">
            <Button
              onClick={handleSingleDonation}
              disabled={donationState.status === 'processing' || !account}
              className="w-full"
            >
              {donationState.status === 'processing'
                ? '⏳ Processing...'
                : donationState.status === 'awaiting_approval'
                ? '⏳ Awaiting Approval...'
                : donationState.status === 'confirming'
                ? '⏳ Confirming...'
                : '🚀 Make Donation'}
            </Button>

            {donationState.status !== 'idle' && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="font-semibold mb-2">Status: {donationState.status}</p>
                {donationState.bundleId && (
                  <p className="text-xs font-mono break-all">
                    Bundle ID: {donationState.bundleId}
                  </p>
                )}
                {donationState.transactionHash && (
                  <p className="text-xs font-mono break-all mt-1">
                    TX Hash: {donationState.transactionHash}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <div className={`w-3 h-3 rounded-full ${
                    donationState.supportsEIP5792 ? 'bg-green-500' : 'bg-gray-300'
                  }`} title="EIP-5792 Support" />
                  <div className={`w-3 h-3 rounded-full ${
                    donationState.supportsEIP7702 ? 'bg-green-500' : 'bg-gray-300'
                  }`} title="EIP-7702 Support" />
                </div>
              </div>
            )}

            {donationState.status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold mb-2">
                  🎉 Donation Successful!
                </p>
                {donationState.transactionHash && (
                  <a
                    href={getExplorerUrl(selectedNetwork, 'tx', donationState.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View on Explorer →
                  </a>
                )}
              </div>
            )}

            {donationState.status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">❌ Error:</p>
                <p className="text-sm text-red-700">{donationState.error}</p>
                <Button
                  onClick={resetDonation}
                  variant="outline"
                  className="w-full mt-3"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Multi-Round Checkout Section */}
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="font-semibold text-xl mb-4">
            Test 2: Multi-Round Checkout (Cart)
          </h2>

          <div className="space-y-4">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              className="w-full"
            >
              ➕ Add to Cart ({cartItems.length} items)
            </Button>

            {cartItems.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Cart Items:</h3>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear Cart
                  </button>
                </div>
                <div className="space-y-2">
                  {cartItems.map(item => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-white p-3 rounded border"
                    >
                      <div>
                        <p className="font-medium text-sm">{item.projectTitle}</p>
                        <p className="text-xs text-gray-500">
                          {item.amount} {selectedToken} • Chain {item.chainId}
                          {item.qfRoundName && ` • ${item.qfRoundName}`}
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          To:{' '}
                          <a
                            href={getExplorerUrl(item.chainId, 'address', item.projectAddress)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 hover:underline"
                          >
                            {item.projectAddress?.slice(0, 10)}...
                          </a>
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={checkoutState.status === 'processing' || !account}
                  className="w-full mt-4"
                >
                  {checkoutState.status === 'processing'
                    ? `⏳ Processing Round ${checkoutState.currentRoundIndex + 1}/${checkoutState.totalRounds}...`
                    : '🚀 Start Batch Checkout'}
                </Button>
              </div>
            )}

            {checkoutState.status !== 'idle' && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="font-semibold mb-2">
                  Checkout Status: {checkoutState.status}
                </p>
                <div className="space-y-2 text-sm">
                  <p>Total Rounds: {checkoutState.totalRounds}</p>
                  <p>Current Round: {checkoutState.currentRoundIndex + 1}</p>
                  <p className="text-green-600">
                    ✅ Completed: {checkoutState.completedRounds}
                  </p>
                  {checkoutState.failedRounds > 0 && (
                    <p className="text-red-600">
                      ❌ Failed: {checkoutState.failedRounds}
                    </p>
                  )}
                </div>
                {Array.from(checkoutState.roundStatuses.entries()).map(
                  ([chainId, status]) => (
                    <div
                      key={chainId}
                      className="mt-2 p-2 bg-white rounded text-xs"
                    >
                      <p className="font-semibold">
                        {SUPPORTED_NETWORKS.find(n => n.id === chainId)?.name || `Chain ${chainId}`}:
                      </p>
                      <p>Status: {status.status}</p>
                      {status.transactionHash && (
                        <a
                          href={getExplorerUrl(chainId, 'tx', status.transactionHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline block mt-1"
                        >
                          View TX: {status.transactionHash.slice(0, 10)}... →
                        </a>
                      )}
                      {status.bundleId && (
                        <p className="text-gray-600 mt-1">
                          Bundle ID: {status.bundleId.slice(0, 10)}...
                        </p>
                      )}
                      {status.error && (
                        <p className="text-red-600 mt-1">Error: {status.error}</p>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}

            {checkoutState.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold mb-2">
                  🎉 Batch Checkout Complete!
                </p>
                <p className="text-sm">
                  Successfully completed {checkoutState.completedRounds} rounds
                </p>
                <Button
                  onClick={clearCart}
                  className="w-full mt-3"
                  variant="outline"
                >
                  Clear Cart
                </Button>
              </div>
            )}

            {checkoutState.status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">❌ Error:</p>
                <p className="text-sm text-red-700">
                  Completed: {checkoutState.completedRounds} / Failed:{' '}
                  {checkoutState.failedRounds}
                </p>
                <Button
                  onClick={resetCheckout}
                  variant="outline"
                  className="w-full mt-3"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">📝 Testing Instructions:</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Connect your wallet using the header button</li>
            <li>
              <strong>Configure:</strong> Enter project address, select chain, token, and
              amount
            </li>
            <li>
              <strong>Test 1 (Single):</strong> Click "Prepare Donation" then "Execute
              Transaction"
            </li>
            <li>
              <strong>Test 2 (Batch):</strong> Add multiple items to cart, then prepare
              and execute batch
            </li>
            <li>Check browser console for detailed logs</li>
            <li>Verify transactions on block explorer</li>
            <li>
              <strong>Tip:</strong> Try different chains and tokens to test cross-chain
              donations
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}

