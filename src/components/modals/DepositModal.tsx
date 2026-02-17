'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Dialog, Flex, Text } from '@radix-ui/themes'
import { Check, Copy, CreditCard, QrCode, Wallet } from 'lucide-react'
import { optimism } from 'thirdweb/chains'
import { PayEmbed, useActiveAccount } from 'thirdweb/react'
import { OPTIMISM_USDC_ADDRESS, thirdwebClient } from '@/lib/thirdweb/client'

type DepositModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type DepositView = 'options' | 'crypto' | 'card'

/**
 * Deposit Modal
 *
 * Provides two methods for AA wallet users to add funds:
 * 1. Deposit crypto - Shows wallet address + QR code
 * 2. Credit card - Uses Thirdweb Pay for fiat onramp
 */
export function DepositModal({ open, onOpenChange }: DepositModalProps) {
  const [view, setView] = useState<DepositView>('options')
  const [copied, setCopied] = useState(false)
  const account = useActiveAccount()

  const walletAddress = account?.address ?? ''

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setView('options')
      setCopied(false)
    }
    onOpenChange(open)
  }

  // Generate a simple QR code URL using a public API
  const qrCodeUrl = useMemo(() => {
    if (!walletAddress) return ''
    // Using QR code API to generate QR code for the wallet address
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(walletAddress)}`
  }, [walletAddress])

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content
        size="3"
        className="w-[92vw] max-w-[481px] rounded-3xl p-0 overflow-hidden"
      >
        <Dialog.Title className="sr-only">Deposit Funds</Dialog.Title>
        <Dialog.Description className="sr-only">
          Add funds to your account via crypto or credit card
        </Dialog.Description>

        {/* Header */}
        <Flex align="center" justify="between" className="px-6 pt-6 pb-2">
          <Flex align="center" gap="2">
            {view !== 'options' && (
              <button
                onClick={() => setView('options')}
                className="text-sm text-giv-brand-500 hover:text-giv-brand-600 cursor-pointer mr-2"
              >
                &larr;
              </button>
            )}
            <Text size="5" weight="bold" className="text-giv-neutral-900">
              {view === 'options' && 'Deposit Funds'}
              {view === 'crypto' && 'Deposit Crypto'}
              {view === 'card' && 'Pay with Card'}
            </Text>
          </Flex>
          <Dialog.Close>
            <button
              type="button"
              aria-label="Close"
              className="rounded-full p-2 hover:bg-black/5 cursor-pointer"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Flex>

        <div className="px-6 pb-6">
          {/* Options View */}
          {view === 'options' && (
            <div className="space-y-3 pt-2">
              <Text size="2" className="text-giv-neutral-600 block">
                Choose how you'd like to add funds to your account.
              </Text>

              {/* Deposit Crypto */}
              <button
                onClick={() => setView('crypto')}
                className="w-full p-4 mt-2 rounded-xl border border-giv-neutral-300 hover:border-giv-brand-300 hover:bg-giv-brand-05 transition-all cursor-pointer text-left"
              >
                <Flex align="center" gap="3">
                  <div className="w-10 h-10 rounded-full bg-giv-brand-05 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5 text-giv-brand-500" />
                  </div>
                  <div>
                    <Text
                      size="3"
                      weight="bold"
                      className="text-giv-neutral-900 block"
                    >
                      Deposit Crypto
                    </Text>
                    <Text size="2" className="text-giv-neutral-600">
                      Send crypto to your wallet address
                    </Text>
                  </div>
                </Flex>
              </button>

              {/* Credit Card */}
              <button
                onClick={() => setView('card')}
                className="w-full p-4 rounded-xl border border-giv-neutral-300 hover:border-giv-brand-300 hover:bg-giv-brand-05 transition-all cursor-pointer text-left"
              >
                <Flex align="center" gap="3">
                  <div className="w-10 h-10 rounded-full bg-giv-brand-05 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-giv-brand-500" />
                  </div>
                  <div>
                    <Text
                      size="3"
                      weight="bold"
                      className="text-giv-neutral-900 block"
                    >
                      Pay with Credit Card
                    </Text>
                    <Text size="2" className="text-giv-neutral-600">
                      Buy crypto with your credit or debit card
                    </Text>
                  </div>
                </Flex>
              </button>
            </div>
          )}

          {/* Crypto Deposit View */}
          {view === 'crypto' && (
            <div className="space-y-4 pt-2">
              <div className="bg-giv-brand-05 border border-giv-brand-100 rounded-xl p-3">
                <Text size="2" className="text-giv-brand-600">
                  Send <strong>USDC</strong> on <strong>Optimism</strong> to the
                  address below. Funds sent on other networks may be lost.
                </Text>
              </div>

              {/* QR Code */}
              <Flex justify="center" className="py-2">
                {qrCodeUrl ? (
                  <div className="p-3 bg-white rounded-xl border border-giv-neutral-200 shadow-sm">
                    <Image
                      src={qrCodeUrl}
                      alt="Wallet QR Code"
                      width={180}
                      height={180}
                      className="rounded-lg"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-[180px] h-[180px] bg-giv-neutral-100 rounded-xl flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-giv-neutral-400" />
                  </div>
                )}
              </Flex>

              {/* Wallet Address */}
              <div>
                <Text size="1" className="text-giv-neutral-500 block mb-1">
                  Your deposit address (Optimism)
                </Text>
                <Flex
                  align="center"
                  className="bg-giv-neutral-50 rounded-xl p-3 border border-giv-neutral-200"
                >
                  <Text
                    size="2"
                    className="text-giv-neutral-800 font-mono flex-1 break-all"
                  >
                    {walletAddress}
                  </Text>
                  <button
                    onClick={handleCopyAddress}
                    className="ml-2 p-2 rounded-lg hover:bg-giv-neutral-100 transition-colors cursor-pointer shrink-0"
                    aria-label="Copy address"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-giv-neutral-500" />
                    )}
                  </button>
                </Flex>
              </div>

              <Text size="1" className="text-giv-neutral-500 text-center block">
                Only send USDC on the Optimism network to this address.
              </Text>
            </div>
          )}

          {/* Credit Card View */}
          {view === 'card' && (
            <div className="pt-2">
              <PayEmbed
                client={thirdwebClient}
                payOptions={{
                  mode: 'fund_wallet',
                  prefillBuy: {
                    chain: optimism,
                    token: {
                      address: OPTIMISM_USDC_ADDRESS,
                      name: 'USD Coin',
                      symbol: 'USDC',
                    },
                  },
                }}
                theme="light"
              />
            </div>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
