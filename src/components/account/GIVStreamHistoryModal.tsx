'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dialog } from '@radix-ui/themes'
import clsx from 'clsx'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useActiveAccount } from 'thirdweb/react'
import { formatUnits, type Address } from 'viem'
import { IconFlash } from '@/components/icons/IconFlash'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { getTransactionUrl } from '@/lib/helpers/chainHelper'
import {
  calculateFlowrateChange,
  fetchGIVstreamHistory,
  formatHistoryDate,
  getSourceLabel,
  shortenTxHash,
  type TokenAllocationEvent,
} from '@/lib/helpers/stakeHelper'
import type { TokenDistroHelper } from '@/lib/helpers/tokenDistroHelper'

type GIVStreamHistoryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  chainId: number
}

export const GIVStreamHistoryModal = ({
  open,
  onOpenChange,
  chainId,
}: GIVStreamHistoryModalProps) => {
  const account = useActiveAccount()
  const [events, setEvents] = useState<TokenAllocationEvent[]>([])
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [helper, setHelper] = useState<TokenDistroHelper | null>(null)

  const itemsPerPage = 6

  useEffect(() => {
    if (!open) {
      setEvents([])
      setPage(0)
      setIsLoading(false)
      setHelper(null)
    }
  }, [open])

  useEffect(() => {
    if (!open || !account?.address || !chainId) return
    let cancelled = false
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchGIVstreamHistory(
          account.address as Address,
          chainId,
          page * itemsPerPage,
          itemsPerPage,
        )
        if (!cancelled) {
          setEvents(data.events)
          setHelper(data.helper)
        }
      } catch (error) {
        console.error('Failed to load GIVstream history:', error)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [account?.address, chainId, open, page])

  const hasNextPage = events.length === itemsPerPage
  const pageNumbers = useMemo(() => {
    const start = Math.max(0, page - 1)
    const end = page + (hasNextPage ? 2 : 1)
    return Array.from({ length: end - start }, (_, idx) => start + idx)
  }, [hasNextPage, page])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 'auto',
          transform: 'none',
        }}
        className={clsx(
          'z-50 h-screen max-h-screen w-[90vw]! md:w-[800px]! md:max-w-[800px]!',
          'bg-white py-10! px-8! overflow-hidden',
          'rounded-none! md:rounded-l-2xl! rounded-r-none!',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3">
            <Dialog.Title className="flex items-center g-2 text-2xl font-bold text-giv-neutral-900 m-0!">
              <IconFlash className="h-5 w-5" fill="var(--giv-brand-900)" />
              <span>GIVStream history</span>
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="text-giv-neutral-900 transition cursor-pointer hover:text-giv-neutral-700"
            >
              <X className="h-6 w-6" />
            </Dialog.Close>
          </div>

          <div className="mt-8 rounded-xl bg-giv-neutral-200 border border-giv-brand-200 p-6 text-base text-giv-neutral-700">
            Every time you claim GIV rewards from GIVbacks, the GIVgarden, or
            the GIVfarm, your GIVstream flowrate increases. Below is a summary.
          </div>

          <div className="mt-8 flex flex-1 min-h-0 flex-col">
            <div className="mt-2 rounded-xl border border-giv-neutral-100 bg-white p-6">
              <div className="grid grid-cols-4 gap-2 text-sm font-bold text-giv-neutral-800 border-b border-giv-neutral-200 pb-3">
                <div>GIVstream Source</div>
                <div>Flowrate Change</div>
                <div>Date</div>
                <div>Tx</div>
              </div>

              <div className="mt-1 flex-1 min-h-0 overflow-y-auto">
                {isLoading ? (
                  <div className="py-6 text-sm text-giv-neutral-600">
                    Loading history...
                  </div>
                ) : events.length === 0 ? (
                  <div className="py-6 text-sm text-giv-neutral-600">
                    No history found.
                  </div>
                ) : (
                  events.map((event, idx) => {
                    const flowrateChange =
                      helper && event.amount
                        ? calculateFlowrateChange(BigInt(event.amount), helper)
                        : 0n
                    const flowrateLabel = formatNumber(
                      formatUnits(flowrateChange, 18),
                      {
                        minDecimals: 4,
                        maxDecimals: 4,
                      },
                    )
                    return (
                      <div
                        key={`${event.txHash}-${idx}`}
                        className="grid grid-cols-4 gap-2 py-4 text-sm font-medium text-giv-neutral-800 border-b border-giv-neutral-100 last:border-b-0"
                      >
                        <div className="text-giv-neutral-900">
                          {getSourceLabel(event.distributor)}
                        </div>
                        <div className="text-giv-green-600 font-semibold">
                          +{flowrateLabel} GIV/week
                        </div>
                        <div className="text-giv-neutral-700">
                          {formatHistoryDate(event.timestamp)}
                        </div>
                        <a
                          href={getTransactionUrl(chainId, event.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-giv-brand-600 hover:text-giv-brand-700"
                        >
                          {shortenTxHash(event.txHash)}
                        </a>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage(prev => Math.max(0, prev - 1))}
                  disabled={page === 0}
                  className={clsx(
                    'inline-flex items-center gap-1 text-sm font-medium text-giv-neutral-700',
                    'disabled:opacity-50',
                    'cursor-pointer',
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Prev
                </button>
                <div className="flex items-center gap-2">
                  {pageNumbers.map(pageNumber => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={clsx(
                        'h-7 min-w-[28px] rounded-md text-sm font-medium cursor-pointer',
                        pageNumber === page
                          ? 'text-giv-brand-700 font-bold'
                          : 'text-giv-neutral-700 hover:bg-giv-neutral-200',
                      )}
                    >
                      {pageNumber + 1}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={!hasNextPage}
                  className={clsx(
                    'inline-flex items-center gap-1 text-sm font-medium text-giv-neutral-700',
                    'disabled:opacity-50',
                    'cursor-pointer',
                  )}
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <Dialog.Close>
              <button
                type="button"
                className={clsx(
                  'w-full mt-6 py-3 px-8 bg-giv-brand-050! text-giv-brand-700! rounded-md text-sm font-bold',
                  'border border-giv-brand-100! text-giv-brand-700!',
                  'flex items-center justify-center gap-2 hover:bg-giv-brand-400! transition-colors cursor-pointer',
                )}
              >
                Close
              </button>
            </Dialog.Close>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
