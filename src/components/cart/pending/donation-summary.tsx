'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Gift,
  HelpCircle,
  Loader2,
} from 'lucide-react'

interface Transaction {
  id: string
  amount: string
  usdValue: string
  projectName: string
  status: 'completed' | 'processing'
}

interface DonationRound {
  id: string
  cryptoAmount: string
  cryptoSymbol: string
  usdValue: string
  projectCount: number
  roundName: string
  chain: string
  matchingAmount: string
  transactions: Transaction[]
}

const donationRounds: DonationRound[] = [
  {
    id: '1',
    cryptoAmount: '0.00026',
    cryptoSymbol: 'BTC',
    usdValue: '$70',
    projectCount: 2,
    roundName: 'Super duper round',
    chain: 'Polygon',
    matchingAmount: '0.000018 BTC',
    transactions: [
      {
        id: 'tx1',
        amount: '0.000052 BTC',
        usdValue: '$14.00',
        projectName: 'Geode Labs',
        status: 'completed',
      },
      {
        id: 'tx2',
        amount: '0.000012 BTC',
        usdValue: '$4.45',
        projectName: 'PEP Master - build trust in DIY medical instruments',
        status: 'processing',
      },
    ],
  },
  {
    id: '2',
    cryptoAmount: '1200',
    cryptoSymbol: 'USDT',
    usdValue: '$ 1200.00',
    projectCount: 2,
    roundName: 'The best round ever',
    chain: 'Optimism',
    matchingAmount: '0.000018 BTC',
    transactions: [
      {
        id: 'tx3',
        amount: '0.000052 BTC',
        usdValue: '$14.00',
        projectName: 'Geode Labs',
        status: 'processing',
      },
      {
        id: 'tx4',
        amount: '0.000012 BTC',
        usdValue: '$4.45',
        projectName: 'PEP Master - build trust in DIY medical instruments',
        status: 'processing',
      },
    ],
  },
]

export function DonationSummary() {
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(
    new Set(donationRounds.map(r => r.id)),
  )

  const toggleRound = (roundId: string) => {
    setExpandedRounds(prev => {
      const next = new Set(prev)
      if (next.has(roundId)) {
        next.delete(roundId)
      } else {
        next.add(roundId)
      }
      return next
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-[#ebecf2] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#ebecf2]">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-[#5326ec]" />
          <h2 className="text-lg font-bold text-[#1f2333]">
            Your donation summary
          </h2>
        </div>
        <p className="text-[#4f576a]">
          You are donating{' '}
          <span className="font-semibold text-[#37b4a9]">~$1270</span> to{' '}
          <span className="font-semibold text-[#5326ec]">4 projects.</span>
        </p>
      </div>

      {/* Donation Rounds */}
      <div className="p-6 space-y-4">
        {donationRounds.map(round => (
          <div
            key={round.id}
            className="border border-[#ebecf2] rounded-xl overflow-hidden"
          >
            {/* Round Header */}
            <div className="bg-gradient-to-r from-[#5326ec] to-[#8668fc] px-4 py-3">
              <p className="text-white text-sm">
                <span className="font-semibold">
                  {round.cryptoAmount} {round.cryptoSymbol}
                </span>{' '}
                (~{round.usdValue}) to{' '}
                <span className="font-semibold">
                  {round.projectCount} projects
                </span>{' '}
                in <span className="font-semibold">{round.roundName}</span> on{' '}
                <span className="font-semibold">{round.chain}</span>
              </p>
            </div>

            {/* Badges and Toggle */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#e7f9f7] text-xs font-medium text-[#1b8c82]">
                  <Gift className="w-3 h-3" />
                  GIVbacks eligible
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-[#37b4a9] text-xs font-medium text-[#1b8c82]">
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <rect
                      x="1"
                      y="1"
                      width="10"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M3 6h6M6 3v6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {round.matchingAmount} in matching
                </span>
              </div>

              {/* Processing Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#ebecf2]">
                  <span className="flex items-center justify-center w-4 h-4">
                    <span className="text-[#82899a]">•••</span>
                  </span>
                  <span className="text-sm text-[#5326ec]">
                    Your transactions are processing.
                  </span>
                </div>
                <button
                  onClick={() => toggleRound(round.id)}
                  className="flex items-center gap-1 text-sm font-medium text-[#1f2333] hover:text-[#5326ec] transition-colors"
                >
                  {expandedRounds.has(round.id) ? 'Hide' : 'Show'} Transaction
                  details
                  {expandedRounds.has(round.id) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Transactions */}
              {expandedRounds.has(round.id) && (
                <div className="space-y-2">
                  {round.transactions.map(tx => (
                    <div key={tx.id} className="flex items-center gap-3 py-2">
                      {/* Status Icon */}
                      {tx.status === 'completed' ? (
                        <div className="w-5 h-5 rounded-full bg-[#37b4a9] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <Loader2 className="w-5 h-5 text-[#82899a] animate-spin" />
                      )}

                      {/* Link Icon */}
                      <ExternalLink className="w-4 h-4 text-[#82899a]" />

                      {/* Amount */}
                      <span
                        className={`text-sm ${tx.status === 'completed' ? 'text-[#1f2333]' : 'text-[#82899a]'}`}
                      >
                        {tx.amount} ({tx.usdValue})
                      </span>

                      {/* Arrow */}
                      <span className="text-[#82899a]">→</span>

                      {/* Project Name */}
                      <span
                        className={`text-sm font-medium ${
                          tx.status === 'completed'
                            ? 'text-[#1f2333]'
                            : 'text-[#82899a]'
                        }`}
                      >
                        {tx.projectName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Help Links */}
      <div className="px-6 pb-6 flex items-center justify-end gap-6">
        <Link
          href="#"
          className="flex items-center gap-1 text-sm font-medium text-[#5326ec] hover:underline"
        >
          See How Matching Works
          <HelpCircle className="w-4 h-4" />
        </Link>
        <Link
          href="#"
          className="flex items-center gap-1 text-sm font-medium text-[#5326ec] hover:underline"
        >
          Learn More about GIVbacks
          <HelpCircle className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
