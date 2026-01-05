'use client'

import { useState } from 'react'
import { CircleDashed, Ellipsis, Eye, EyeClosed } from 'lucide-react'
import { IconPraiseHand } from '@/components/icons/IconPraiseHand'

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
  state: 'waiting' | 'processing'
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
    state: 'waiting',
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
    state: 'processing',
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
    <div className="p-4 bg-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="mb-6 mt-2">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-giv-gray-300">
          <IconPraiseHand />
          <h2 className="text-2xl font-bold text-giv-gray-900">
            Your donation summary
          </h2>
        </div>
        <p className="text-giv-gray-700 text-lg font-medium">
          You are donating <span className="text-giv-primary-700">~$1270</span>{' '}
          to <span className="text-giv-primary-700">4 projects.</span>
        </p>
      </div>

      {/* Donation Rounds */}
      <div className="space-y-4">
        {donationRounds.map(round => (
          <div
            key={round.id}
            className="p-4 border-4 border-giv-gray-300 rounded-xl overflow-hidden"
          >
            {/* Round Header */}
            <div className="bg-giv-gray-300 px-4 py-2 rounded-xl">
              <p className="text-giv-gray-800 text-base font-normal">
                <span className="font-medium">
                  {round.cryptoAmount} {round.cryptoSymbol}
                </span>{' '}
                (~{round.usdValue}) to{' '}
                <span className="font-medium">
                  {round.projectCount} projects
                </span>{' '}
                in <span className="font-medium">{round.roundName}</span> on{' '}
                <span className="font-medium">{round.chain}</span>
              </p>
            </div>

            {/* Toggle */}
            <div className="py-3">
              {/* Processing Status */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 ${round.state === 'waiting' ? 'text-giv-gray-900' : 'text-giv-gray-700'} bg-giv-gray-200 rounded-md border border-giv-gray-400`}
                >
                  <span className="flex items-center justify-center w-4 h-4">
                    {round.state === 'waiting' ? (
                      <Ellipsis />
                    ) : (
                      <CircleDashed />
                    )}
                  </span>
                  <span className="text-sm">
                    Your transactions are processing.
                  </span>
                </div>
                <button
                  onClick={() => toggleRound(round.id)}
                  className="flex items-center gap-1 text-base font-medium text-giv-gray-900 hover:text-giv-primary-500 bg-giv-gray-200 rounded-md px-3 py-2 transition-colors cursor-pointer"
                >
                  {expandedRounds.has(round.id) ? 'Hide' : 'Show'} Transaction
                  details
                  {expandedRounds.has(round.id) ? (
                    <EyeClosed className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Transactions */}
              {expandedRounds.has(round.id) && (
                <div className="space-y-2 flex flex-col items-start gap-2">
                  {round.transactions.map(tx => (
                    <div
                      key={tx.id}
                      className="w-auto inline-flex items-center gap-3 py-2 px-3 bg-giv-gray-200 rounded-md text-base text-giv-gray-800 font-normal"
                    >
                      {/* Amount */}
                      <span className="font-medium">{tx.amount}</span>

                      <span>to</span>

                      {/* Project Name */}
                      <span className="font-medium">{tx.projectName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
