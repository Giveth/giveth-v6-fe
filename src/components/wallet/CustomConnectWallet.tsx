'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Check, Copy, LogOut } from 'lucide-react'
import {
  useActiveAccount,
  useActiveWallet,
  useActiveWalletChain,
  useConnect,
  useDisconnect,
} from 'thirdweb/react'
import { useProfile } from '@/hooks/useAccount'
import { useSiweAuth } from '@/hooks/useSiweAuth'
import { getUserName, shortenAddress } from '@/lib/helpers/userHelper'
import { supportedWallets, thirdwebClient } from '@/lib/thirdweb/client'

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

  const { token } = useSiweAuth()
  const { data: profileData } = useProfile(token || undefined)

  const user = profileData?.me

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
          className="flex items-center gap-3 px-4 py-1 bg-white rounded-full font-normal shadow-[0px_3px_20px_rgba(212,218,238,0.4)] hover:opacity-85 transition-all duration-200 border border-gray-100 cursor-pointer"
        >
          {/* Avatar */}
          <div
            className={`w-auto h-auto rounded-fullflex items-center justify-center`}
          >
            <Image
              src={user?.avatar || '/images/user/default-avatar.png'}
              alt="Avatar"
              width={24}
              height={24}
              className="object-cover rounded-full"
            />
          </div>

          {/* Address and Network Info */}
          <div className="flex flex-col items-start">
            <span className="font-normal text-giv-gray-900 text-sm">
              {(user && getUserName(user)) || shortenAddress(account.address)}
            </span>
            <span className="font-normal text-giv-gray-900 text-[10px]">
              Connected to {chain?.name || 'Network'}
            </span>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center`}
                >
                  <Image
                    src={user?.avatar || '/images/user/default-avatar.png'}
                    alt="Avatar"
                    width={24}
                    height={24}
                    className="object-cover rounded-full"
                  />
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
        className="px-6 py-2.5 bg-giv-pinky-500 text-white font-semibold rounded-full hover:bg-giv-pinky-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
