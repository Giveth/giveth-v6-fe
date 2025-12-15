'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Copy, LogOut } from 'lucide-react'
import {
  useActiveAccount,
  useActiveWallet,
  useActiveWalletChain,
  useConnect,
  useDisconnect,
} from 'thirdweb/react'
import { supportedWallets, thirdwebClient } from '@/lib/thirdweb/client'

const shortenAddress = (address?: string) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-5)}`
}

// Generate a deterministic color based on address
const getAvatarGradient = (address?: string) => {
  if (!address) return 'from-emerald-400 via-lime-500 to-amber-400'

  const hash = address.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  const hue1 = Math.abs(hash % 360)
  const hue2 = Math.abs((hash * 2) % 360)
  const hue3 = Math.abs((hash * 3) % 360)

  return `from-[hsl(${hue1},70%,60%)] via-[hsl(${hue2},70%,55%)] to-[hsl(${hue3},70%,50%)]`
}

export function CustomConnectWallet() {
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const chain = useActiveWalletChain()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [isOpen, setIsOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCopyAddress = async () => {
    if (account?.address) {
      await navigator.clipboard.writeText(account.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = () => {
    if (wallet) {
      disconnect(wallet)
    }
    setIsOpen(false)
  }

  const handleConnect = async (walletId: string) => {
    setIsConnecting(true)
    try {
      const wallet = supportedWallets.find(w => {
        if (typeof w === 'string') return w === walletId
        return w.id === walletId
      })

      if (wallet) {
        await connect(async () => {
          const walletInstance =
            typeof wallet === 'string'
              ? await import('thirdweb/wallets').then(m =>
                  m.createWallet(wallet),
                )
              : wallet

          await walletInstance.connect({ client: thirdwebClient })
          return walletInstance
        })
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  // If wallet is connected, show the wallet badge
  if (account) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
        >
          {/* Avatar */}
          <div
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient(account.address)} flex items-center justify-center shadow-inner`}
          >
            <span className="text-white text-xl font-bold">
              {account.address.slice(2, 4).toUpperCase()}
            </span>
          </div>

          {/* Address and Network Info */}
          <div className="flex flex-col items-start">
            <span className="text-base font-semibold text-[#1f2333]">
              {shortenAddress(account.address)}
            </span>
            <span className="text-sm font-medium text-[#5326ec]">
              Connected to {chain?.name || 'Network'}
            </span>
          </div>

          {/* Dropdown Arrow */}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(account.address)} flex items-center justify-center`}
                >
                  <span className="text-white text-lg font-bold">
                    {account.address.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {shortenAddress(account.address)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {chain?.name || 'Unknown Network'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopyAddress}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  // If wallet is not connected, show connect button
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isConnecting}
        className="px-6 py-2.5 bg-[#5326ec] text-white font-semibold rounded-full hover:bg-[#6b3dff] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {/* Wallet Selection Dropdown */}
      {isOpen && !account && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              Connect Wallet
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Choose how you want to connect
            </p>
          </div>

          <div className="p-2">
            {/* MetaMask */}
            <button
              onClick={() => handleConnect('io.metamask')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <span className="text-2xl">🦊</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                MetaMask
              </span>
            </button>

            {/* Trust Wallet */}
            <button
              onClick={() => handleConnect('com.trustwallet.app')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">🛡️</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                Trust Wallet
              </span>
            </button>

            {/* Coinbase Wallet */}
            <button
              onClick={() => handleConnect('com.coinbase.wallet')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xl font-bold">C</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                Coinbase Wallet
              </span>
            </button>

            {/* WalletConnect */}
            <button
              onClick={() => handleConnect('walletConnect')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xl">⚡</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                WalletConnect
              </span>
            </button>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              By connecting, you agree to our Terms of Service
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
