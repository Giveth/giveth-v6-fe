'use client'

import { useState } from 'react'
import { StepFooter } from './StepFooter'

export function Step6TermsAndConditions({
  accepted: initialAccepted,
  onSave,
  onSubmit,
  onBack,
  isLoading,
}: {
  accepted: boolean
  onSave: (accepted: boolean) => Promise<void>
  onSubmit: () => Promise<void> | void
  onBack: () => void
  isLoading: boolean
}) {
  const [accepted, setAccepted] = useState(initialAccepted)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!accepted) {
      setError('You must accept the terms and conditions to submit your application')
      return
    }

    setError('')
    try {
      await onSave(true)
      await onSubmit()
    } catch {
      setError('Failed to submit. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="max-h-48 space-y-3 overflow-y-auto rounded-xl bg-giv-neutral-100 p-4 text-sm text-giv-neutral-700">
        <p className="font-semibold text-giv-neutral-900">GIVbacks Eligibility Terms & Conditions</p>
        <p>
          By submitting this application, you confirm that all information provided is accurate and complete.
          You understand that Giveth may review, approve, or reject your application.
        </p>
        <p>
          You agree that your project must remain active and continue to meet GIVbacks eligibility criteria.
        </p>
        <p>
          False or misleading information may result in disqualification from the GIVbacks program.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-giv-neutral-700">
        <input
          type="checkbox"
          checked={accepted}
          onChange={e => {
            setAccepted(e.target.checked)
            if (e.target.checked) setError('')
          }}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-giv-brand-500"
        />
        I have read and agree to the GIVbacks eligibility terms and conditions. I confirm that the
        information in this application is accurate to the best of my knowledge.
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}
      <StepFooter
        onBack={onBack}
        onNext={handleSubmit}
        isLoading={isLoading}
        nextLabel="Submit Application"
      />
    </div>
  )
}
