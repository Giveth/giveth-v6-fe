'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CircleCheck,
  CircleX,
  Eye,
  EyeClosed,
  Link as LinkIcon,
} from 'lucide-react'
import { EligibilityBanner } from '@/components/eligibility/EligibilityBanner'
import { IconPraiseHand } from '@/components/icons/IconPraiseHand'

interface Transaction {
  id: string
  amount: string
  usdValue: string
  projectName: string
  txHash: string
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
  state: 'completed' | 'failed'
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
    state: 'completed',
    transactions: [
      {
        id: 'tx1',
        amount: '0.000052 BTC',
        usdValue: '$14.00',
        projectName: 'Geode Labs',
        txHash: '0x1234...5678',
      },
      {
        id: 'tx2',
        amount: '0.000012 BTC',
        usdValue: '$4.45',
        projectName: 'PEP Master - build trust in DIY medical instruments',
        txHash: '0x8765...4321',
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
    state: 'failed',
    transactions: [
      {
        id: 'tx3',
        amount: '0.000052 BTC',
        usdValue: '$14.00',
        projectName: 'Geode Labs',
        txHash: '0xabcd...efgh',
      },
      {
        id: 'tx4',
        amount: '0.000012 BTC',
        usdValue: '$4.45',
        projectName: 'PEP Master - build trust in DIY medical instruments',
        txHash: '0xijkl...mnop',
      },
    ],
  },
]

export function SuccessDonationSummary() {
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(
    new Set(['2']),
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
          You’ve donated <span className="text-giv-primary-700">~$1270</span> to{' '}
          <span className="text-giv-primary-700">4 projects.</span>
        </p>
      </div>

      {/* Donation Rounds */}
      <div className="space-y-4">
        {donationRounds.map(round => (
          <div
            key={round.id}
            className="p-4 pb-0 border-4 border-giv-gray-300 rounded-xl overflow-hidden"
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
            <div className="py-3 mt-2">
              <div className="flex justify-between mb-3">
                <div className="flex flex-col items-start gap-2">
                  {round.state === 'completed' ? (
                    <>
                      <div
                        className={`inline-flex w-auto items-center gap-2 px-3 py-2.5 bg-giv-gray-200 rounded-md border border-giv-gray-400`}
                      >
                        <div className="flex items-center gap-2 text-sm font-medium text-giv-jade-500">
                          <span>
                            <CircleCheck className="w-4 h-4" />
                          </span>
                          <span>Donation successful</span>
                        </div>
                      </div>
                      <Link
                        href="#"
                        className="mt-2 inline-flex items-center gap-2 text-base font-medium text-giv-primary-500 bg-giv-gray-200 rounded-md px-3 py-2 border border-giv-primary-500 hover:opacity-85"
                      >
                        <LinkIcon className="w-4 h-4 text-giv-primary-500" />
                        <span className="text-giv-primary-500">
                          View on block explorer
                        </span>
                        <ArrowRight className="w-4 h-4 text-giv-primary-500" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <div
                        className={`flex items-center gap-2 px-3 py-2.5 bg-giv-gray-200 rounded-md border border-giv-gray-400`}
                      >
                        <div className="flex items-center gap-2 text-sm font-medium text-(--color-danger)">
                          <span>
                            <CircleX className="w-4 h-4" />
                          </span>
                          <span>Donation failed</span>
                        </div>
                      </div>
                      <Link
                        href="#"
                        className="mt-2 inline-flex items-center gap-2 text-base font-medium text-giv-primary-500 bg-giv-gray-200 rounded-md px-3 py-2 border border-giv-primary-500 hover:opacity-85"
                      >
                        <LinkIcon className="w-4 h-4 text-giv-primary-500" />
                        <span className="text-giv-primary-500">
                          Check on block explorer
                        </span>
                        <ArrowRight className="w-4 h-4 text-giv-primary-500" />
                      </Link>
                    </>
                  )}
                </div>
                <button
                  onClick={() => toggleRound(round.id)}
                  className="flex items-center gap-1 h-12 px-3 py-2 text-base font-medium text-giv-gray-900 hover:text-giv-primary-500 bg-giv-gray-200 rounded-md transition-colors cursor-pointer"
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

        <EligibilityBanner />
      </div>
    </div>
  )
}
