'use client'

import { useCallback, useMemo, useState } from 'react'
import { ChainIcon } from '@/components/ChainIcon'
import { ChainType } from '@/lib/graphql/generated/graphql'
import { RECEIVING_FUNDS_NETWORKS } from './receivingFundsNetworks'

export type ReceivingAddress = {
  address: string
  networkId: number
  chainType: ChainType
}

interface ReceivingFundsSectionProps {
  addresses: ReceivingAddress[]
  connectedAddress?: string
  error?: string
  onAddressesChange: (addresses: ReceivingAddress[]) => void
  onActivate: () => void
}

export function ReceivingFundsSection({
  addresses,
  connectedAddress,
  error,
  onAddressesChange,
  onActivate,
}: ReceivingFundsSectionProps) {
  const [editingNetworkId, setEditingNetworkId] = useState<number | null>(null)
  const [draftAddress, setDraftAddress] = useState('')

  const addressesByNetwork = useMemo(() => {
    return new Map(addresses.map(item => [item.networkId, item]))
  }, [addresses])

  const startEditing = useCallback(
    (networkId: number) => {
      const current = addressesByNetwork.get(networkId)?.address || ''
      setEditingNetworkId(networkId)
      setDraftAddress(current)
    },
    [addressesByNetwork],
  )

  const cancelEditing = useCallback(() => {
    setEditingNetworkId(null)
    setDraftAddress('')
  }, [])

  const upsertAddress = useCallback(
    (networkId: number, value: string) => {
      const trimmed = value.trim()
      const remaining = addresses.filter(item => item.networkId !== networkId)
      if (!trimmed) {
        onAddressesChange(remaining)
        return
      }

      onAddressesChange([
        ...remaining,
        {
          networkId,
          address: trimmed,
          chainType: ChainType.Evm,
        },
      ])
    },
    [addresses, onAddressesChange],
  )

  const removeAddress = useCallback(
    (networkId: number) => {
      onAddressesChange(addresses.filter(item => item.networkId !== networkId))
      if (editingNetworkId === networkId) {
        cancelEditing()
      }
    },
    [addresses, cancelEditing, editingNetworkId, onAddressesChange],
  )

  return (
    <section
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <h2 className="text-base font-semibold text-giv-neutral-900 mb-2">
        Receiving funds
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        You can set a custom Ethereum address or ENS to receive donations. The
        more chains your project can accept funds on, the more likely it is to
        receive donations.
      </p>

      <div className="space-y-3">
        {RECEIVING_FUNDS_NETWORKS.map(network => {
          const current = addressesByNetwork.get(network.id)
          const hasAddress = Boolean(current?.address?.trim())
          const isEditing = editingNetworkId === network.id

          return (
            <div
              key={network.id}
              className="rounded-lg border border-gray-200 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <ChainIcon networkId={network.id} height={18} width={18} />
                    <p className="text-sm font-medium text-giv-neutral-900">
                      {network.name} address
                    </p>
                  </div>
                  <p
                    className={`text-sm ${
                      hasAddress
                        ? 'font-mono break-all text-giv-neutral-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {hasAddress ? current?.address : 'No address added yet!'}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(network.id)}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-giv-brand-600 hover:bg-giv-brand-050"
                  >
                    {hasAddress ? 'Edit Address' : 'Add Address'}
                  </button>
                  {hasAddress && (
                    <button
                      type="button"
                      onClick={() => removeAddress(network.id)}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={draftAddress}
                    onChange={e => setDraftAddress(e.target.value)}
                    placeholder={`Enter ${network.name} address or ENS`}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-giv-neutral-900 focus:border-giv-brand-500 focus:outline-none focus:ring-2 focus:ring-giv-brand-500/20"
                  />
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {connectedAddress && (
                      <button
                        type="button"
                        onClick={() => setDraftAddress(connectedAddress)}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-giv-brand-600 hover:bg-giv-brand-050"
                      >
                        Use connected wallet
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        upsertAddress(network.id, draftAddress)
                        cancelEditing()
                      }}
                      className="rounded-md bg-giv-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  )
}
