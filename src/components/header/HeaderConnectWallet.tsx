'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, Copy, LogOut } from 'lucide-react'
import { type Route } from 'next'
import {
  useActiveAccount,
  useActiveWallet,
  useActiveWalletChain,
} from 'thirdweb/react'
import ConnectWalletButton from '@/components/wallet/ConnectWalletButton'
import { useSiweAuth } from '@/context/AuthContext'
import { useProfile } from '@/hooks/useAccount'
import {
  createProjectLink,
  myCausesLink,
  myGIVPowerLink,
  myProjectsLink,
  reportBugLink,
  supportLink,
} from '@/lib/constants/menu-links'
import { getUserName, shortenAddress } from '@/lib/helpers/userHelper'

export function HeaderConnectWallet() {
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const chain = useActiveWalletChain()
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { token, signOut } = useSiweAuth()
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

  const handleDisconnect = async () => {
    // Sign out and invalidate token on auth service
    await signOut()

    // Disconnect wallet
    if (wallet) {
      wallet.disconnect()
    }
    setIsOpen(false)
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
            className={`w-4 h-4 lg:w-6 lg:h-6 rounded-full flex items-center justify-center`}
          >
            <Image
              src={user?.avatar || '/images/user/default-avatar.png'}
              alt="Avatar"
              width={24}
              height={24}
              className="w-4 h-4 lg:w-6 lg:h-6 object-cover rounded-full"
            />
          </div>

          {/* Address and Network Info */}
          <div className="flex flex-col items-start">
            <span className="font-normal text-giv-gray-900 text-xs lg:text-sm">
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

            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              My Account
            </Link>

            <Link
              href={myProjectsLink.href as Route}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              {myProjectsLink.label}
            </Link>

            <Link
              href={myCausesLink.href as Route}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              {myCausesLink.label}
            </Link>

            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              My Donations
            </Link>

            <Link
              href={myGIVPowerLink.href as Route}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              {myGIVPowerLink.label}
            </Link>

            <Link
              href={createProjectLink.href as Route}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              {createProjectLink.label}
            </Link>

            <Link
              href={reportBugLink.href as unknown as Route}
              target={reportBugLink.target}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              {reportBugLink.label}
            </Link>

            <Link
              href={supportLink.href as Route}
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              {supportLink.label}
            </Link>

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
  return <ConnectWalletButton />
}
