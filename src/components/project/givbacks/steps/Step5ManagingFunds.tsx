'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { ChainType, ManagingFundsEntity } from '@/lib/graphql/generated/graphql'
import { ChainType as ChainTypeEnum } from '@/lib/graphql/generated/graphql'
import { FormField, textareaClass } from './FormField'
import { StepFooter } from './StepFooter'

type RelatedAddress = {
  title: string
  address: string
  memo: string
  networkId: string
  chainType: ChainType
}

const emptyAddress = (): RelatedAddress => ({
  title: '',
  address: '',
  memo: '',
  networkId: '',
  chainType: ChainTypeEnum.Evm,
})

export function Step5ManagingFunds({
  data,
  onSave,
  onNext,
  onBack,
  isLoading,
}: {
  data?: ManagingFundsEntity | null
  onSave: (data: {
    description: string
    relatedAddresses: {
      title: string
      address: string
      memo?: string
      networkId: number
      chainType: ChainType
    }[]
  }) => Promise<void>
  onNext: () => void
  onBack: () => void
  isLoading: boolean
}) {
  const [description, setDescription] = useState('')
  const [relatedAddresses, setRelatedAddresses] = useState<RelatedAddress[]>([
    emptyAddress(),
  ])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setDescription(data?.description ?? '')
    setRelatedAddresses(
      data?.relatedAddresses?.length
        ? data.relatedAddresses.map(item => ({
            title: item.title ?? '',
            address: item.address ?? '',
            memo: item.memo ?? '',
            networkId: String(item.networkId ?? ''),
            chainType: (item.chainType as ChainType) ?? ChainTypeEnum.Evm,
          }))
        : [emptyAddress()],
    )
  }, [data])

  const update = (i: number, field: keyof RelatedAddress, value: string) => {
    setRelatedAddresses(prev => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)))
  }

  const handleNext = async () => {
    const nextErrors: Record<string, string> = {}
    if (!description.trim()) nextErrors.description = 'Description is required'

    relatedAddresses.forEach((item, i) => {
      if (!item.title.trim() && !item.address.trim() && !item.networkId.trim() && !item.memo.trim()) {
        return
      }
      if (!item.title.trim()) nextErrors[`title_${i}`] = 'Title required'
      if (!item.address.trim()) nextErrors[`address_${i}`] = 'Address required'
      if (item.networkId.trim() && Number.isNaN(Number(item.networkId))) {
        nextErrors[`networkId_${i}`] = 'Must be a number'
      }
    })

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    try {
      await onSave({
        description: description.trim(),
        relatedAddresses: relatedAddresses
          .filter(item => item.title.trim() || item.address.trim())
          .map(item => ({
            title: item.title.trim(),
            address: item.address.trim(),
            memo: item.memo.trim() || undefined,
            networkId: Number(item.networkId) || 0,
            chainType: item.chainType,
          })),
      })
      onNext()
    } catch {
      setErrors({ submit: 'Failed to save. Please try again.' })
    }
  }

  return (
    <div className="space-y-6">
      <FormField label="How will funds be managed?" required error={errors.description}>
        <textarea
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          className={textareaClass}
          placeholder="Describe how donations will be received, managed, and used"
        />
      </FormField>

      <div>
        <label className="mb-2 block text-sm font-semibold text-giv-neutral-900">
          Related Addresses
        </label>
        <div className="space-y-4">
          {relatedAddresses.map((addr, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-giv-neutral-200 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-giv-neutral-600">
                  Address #{i + 1}
                </span>
                {relatedAddresses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setRelatedAddresses(prev => prev.filter((_, idx) => idx !== i))}
                    className="cursor-pointer text-giv-neutral-400 transition-colors hover:text-red-500"
                    aria-label="Remove address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={addr.title}
                    onChange={e => update(i, 'title', e.target.value)}
                    placeholder="Title"
                    className="w-full rounded-lg border border-giv-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-giv-brand-500"
                  />
                  {errors[`title_${i}`] && <p className="mt-1 text-xs text-red-500">{errors[`title_${i}`]}</p>}
                </div>
                <div>
                  <input
                    type="number"
                    value={addr.networkId}
                    onChange={e => update(i, 'networkId', e.target.value)}
                    placeholder="Network ID"
                    className="w-full rounded-lg border border-giv-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-giv-brand-500"
                  />
                  {errors[`networkId_${i}`] && <p className="mt-1 text-xs text-red-500">{errors[`networkId_${i}`]}</p>}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={addr.address}
                  onChange={e => update(i, 'address', e.target.value)}
                  placeholder="Wallet address"
                  className="w-full rounded-lg border border-giv-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-giv-brand-500"
                />
                {errors[`address_${i}`] && <p className="mt-1 text-xs text-red-500">{errors[`address_${i}`]}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={addr.chainType}
                  onChange={e => update(i, 'chainType', e.target.value)}
                  className="rounded-lg border border-giv-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-giv-brand-500"
                >
                  <option value={ChainTypeEnum.Evm}>EVM</option>
                  <option value={ChainTypeEnum.Solana}>Solana</option>
                  <option value={ChainTypeEnum.Stellar}>Stellar</option>
                </select>
                <input
                  type="text"
                  value={addr.memo}
                  onChange={e => update(i, 'memo', e.target.value)}
                  placeholder="Memo / tag (optional)"
                  className="rounded-lg border border-giv-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-giv-brand-500"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setRelatedAddresses(prev => [...prev, emptyAddress()])}
          className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-semibold text-giv-brand-500 transition-colors hover:text-giv-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add another address
        </button>
      </div>

      {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}
      <StepFooter onBack={onBack} onNext={handleNext} isLoading={isLoading} />
    </div>
  )
}
