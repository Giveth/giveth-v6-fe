'use client'

import { useEffect, useState } from 'react'
import type { PersonalInfoEntity } from '@/lib/graphql/generated/graphql'
import { FormField, inputClass } from './FormField'
import { StepFooter } from './StepFooter'

export function Step1PersonalInfo({
  data,
  walletAddress,
  onSave,
  onNext,
  isLoading,
}: {
  data?: PersonalInfoEntity | null
  walletAddress?: string
  onSave: (data: {
    fullName: string
    walletAddress: string
    email: string
  }) => Promise<void>
  onNext: () => void
  isLoading: boolean
}) {
  const [fullName, setFullName] = useState(data?.fullName ?? '')
  const [email, setEmail] = useState(data?.email ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFullName(data?.fullName ?? '')
    setEmail(data?.email ?? '')
  }, [data?.email, data?.fullName])

  const handleNext = async () => {
    const nextErrors: Record<string, string> = {}
    if (!fullName.trim()) nextErrors.fullName = 'Full name is required'
    if (!email.trim()) nextErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Invalid email address'
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    try {
      await onSave({
        fullName: fullName.trim(),
        walletAddress: walletAddress ?? data?.walletAddress ?? '',
        email: email.trim(),
      })
      onNext()
    } catch {
      setErrors({ submit: 'Failed to save. Please try again.' })
    }
  }

  return (
    <div className="space-y-5">
      <FormField label="Full Name" required error={errors.fullName}>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className={inputClass}
          placeholder="Your full name"
        />
      </FormField>

      <FormField label="Wallet Address" hint="Pre-filled from your connected wallet">
        <input
          type="text"
          disabled
          value={walletAddress ?? data?.walletAddress ?? ''}
          className="w-full cursor-not-allowed rounded-xl border border-giv-neutral-100 bg-giv-neutral-100 px-4 py-2.5 text-sm text-giv-neutral-500"
        />
      </FormField>

      <FormField label="Email Address" required error={errors.email}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
      </FormField>

      {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}
      <StepFooter onNext={handleNext} isLoading={isLoading} />
    </div>
  )
}
