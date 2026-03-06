'use client'

import { useCallback, useMemo, useState } from 'react'
import { isAddress } from 'viem'
import { ChainIcon } from '@/components/ChainIcon'
import { CHAINS } from '@/lib/constants/chain'
import { ChainType } from '@/lib/graphql/generated/graphql'
import { validateProjectRecipientAddress } from '@/lib/helpers/projectHelper'

export type ReceivingAddress = {
  address: string
  networkId: number
  chainType: ChainType
  title?: string
  memo?: string
  isRecipient?: boolean
}

interface ReceivingFundsSectionProps {
  projectId?: number
  addresses: ReceivingAddress[]
  connectedAddress?: string
  error?: string
  onAddressesChange: (addresses: ReceivingAddress[]) => void
  onActivate: () => void
}

const ENS_ADDRESS_REGEX = /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i

export function ReceivingFundsSection({
  projectId,
  addresses,
  connectedAddress,
  error,
  onAddressesChange,
  onActivate,
}: ReceivingFundsSectionProps) {
  const [editingNetworkId, setEditingNetworkId] = useState<number | null>(null)
  const [draftAddress, setDraftAddress] = useState('')
  const [addressError, setAddressError] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const addressesByNetwork = useMemo(() => {
    return new Map(addresses.map(item => [item.networkId, item]))
  }, [addresses])

  // Start editing the address for a given network, setting the draft address to the current address.
  const startEditing = useCallback(
    (networkId: number) => {
      const current = addressesByNetwork.get(networkId)?.address || ''
      setEditingNetworkId(networkId)
      setDraftAddress(current)
      setAddressError('')
      setIsValidating(false)
    },
    [addressesByNetwork],
  )

  // Cancel editing the address for a given network, resetting the draft address, address error, and is validating state.
  const cancelEditing = useCallback(() => {
    setEditingNetworkId(null)
    setDraftAddress('')
    setAddressError('')
    setIsValidating(false)
  }, [])

  // Validate the address for a given network, returning an error message if the address is not valid.
  const validateAddress = useCallback(
    async (value: string, networkId: number, previousAddress?: string) => {
      const trimmed = value.trim()
      if (!trimmed) return 'Address is required.'
      if (!isAddress(trimmed) && !ENS_ADDRESS_REGEX.test(trimmed)) {
        return 'Not a valid address.'
      }
      if (
        previousAddress &&
        trimmed.toLowerCase() === previousAddress.trim().toLowerCase()
      ) {
        return ''
      }
      if (!projectId) {
        return ''
      }

      setIsValidating(true)
      try {
        const result = await validateProjectRecipientAddress({
          projectId,
          address: trimmed,
        })
        return result === true ? '' : result
      } finally {
        setIsValidating(false)
      }
    },
    [projectId],
  )

  // Upsert the address for a given network, updating the address if it already exists, otherwise adding a new address.
  const upsertAddress = useCallback(
    (networkId: number, value: string) => {
      const trimmed = value.trim()
      const existing = addresses.find(item => item.networkId === networkId)
      const remaining = addresses.filter(item => item.networkId !== networkId)
      if (!trimmed) {
        onAddressesChange(remaining)
        return
      }

      onAddressesChange([
        ...remaining,
        {
          ...existing,
          networkId,
          address: trimmed,
          chainType: existing?.chainType || ChainType.Evm,
        },
      ])
    },
    [addresses, onAddressesChange],
  )

  // Remove the address for a given network, removing the address from the list of addresses.
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
        {Object.values(CHAINS).map(network => {
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
                    onChange={e => {
                      setDraftAddress(e.target.value)
                      setAddressError('')
                    }}
                    onBlur={async () => {
                      const previousAddress = addressesByNetwork.get(
                        network.id,
                      )?.address
                      const validationMessage = await validateAddress(
                        draftAddress,
                        network.id,
                        previousAddress,
                      )
                      setAddressError(validationMessage)
                    }}
                    placeholder={`Enter ${network.name} address or ENS`}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-giv-neutral-900 focus:border-giv-brand-500 focus:outline-none focus:ring-2 focus:ring-giv-brand-500/20"
                  />
                  {addressError && (
                    <p className="text-xs text-red-600">{addressError}</p>
                  )}
                  {isValidating && (
                    <p className="text-xs text-gray-500">
                      Validating address...
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {connectedAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          setDraftAddress(connectedAddress)
                          setAddressError('')
                        }}
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
                      onClick={async () => {
                        const previousAddress = addressesByNetwork.get(
                          network.id,
                        )?.address
                        const validationMessage = await validateAddress(
                          draftAddress,
                          network.id,
                          previousAddress,
                        )
                        if (validationMessage) {
                          setAddressError(validationMessage)
                          return
                        }
                        upsertAddress(network.id, draftAddress.trim())
                        cancelEditing()
                      }}
                      disabled={isValidating}
                      className="rounded-md bg-giv-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
