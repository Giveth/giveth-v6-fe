'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { ProjectContactsEntity } from '@/lib/graphql/generated/graphql'
import { StepFooter } from './StepFooter'

type Contact = { name: string; url: string }

export function Step3ProjectContacts({
  data,
  onSave,
  onNext,
  onBack,
  isLoading,
}: {
  data?: ProjectContactsEntity[] | null
  onSave: (contacts: { name?: string; url?: string }[]) => Promise<void>
  onNext: () => void
  onBack: () => void
  isLoading: boolean
}) {
  const [contacts, setContacts] = useState<Contact[]>([{ name: '', url: '' }])
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    setContacts(
      data?.length
        ? data.map(item => ({ name: item.name ?? '', url: item.url ?? '' }))
        : [{ name: '', url: '' }],
    )
  }, [data])

  const update = (i: number, field: keyof Contact, value: string) => {
    setContacts(prev => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)))
  }

  const handleNext = async () => {
    setSubmitError('')
    try {
      await onSave(
        contacts
          .filter(c => c.name.trim() || c.url.trim())
          .map(c => ({
            name: c.name.trim() || undefined,
            url: c.url.trim() || undefined,
          })),
      )
      onNext()
    } catch {
      setSubmitError('Failed to save. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-giv-neutral-600">
        Add social profiles, websites, or other project contact channels.
      </p>

      {contacts.map((contact, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="grid flex-1 grid-cols-2 gap-2">
            <input
              type="text"
              value={contact.name}
              onChange={e => update(i, 'name', e.target.value)}
              placeholder="Platform (e.g. Twitter)"
              className="rounded-xl border border-giv-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-giv-brand-500"
            />
            <input
              type="url"
              value={contact.url}
              onChange={e => update(i, 'url', e.target.value)}
              placeholder="https://twitter.com/..."
              className="rounded-xl border border-giv-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-giv-brand-500"
            />
          </div>
          {contacts.length > 1 && (
            <button
              type="button"
              onClick={() => setContacts(prev => prev.filter((_, idx) => idx !== i))}
              className="cursor-pointer p-2.5 text-giv-neutral-400 transition-colors hover:text-red-500"
              aria-label="Remove contact"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => setContacts(prev => [...prev, { name: '', url: '' }])}
        className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-giv-brand-500 transition-colors hover:text-giv-brand-700"
      >
        <Plus className="h-4 w-4" />
        Add another contact
      </button>

      {submitError && <p className="text-xs text-red-500">{submitError}</p>}
      <StepFooter onBack={onBack} onNext={handleNext} isLoading={isLoading} />
    </div>
  )
}
