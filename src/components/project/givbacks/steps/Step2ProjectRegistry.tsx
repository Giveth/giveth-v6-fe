'use client'

import { useEffect, useState } from 'react'
import { useAllowedCountries } from '@/hooks/useGivbacksEligibility'
import type { ProjectRegistryEntity } from '@/lib/graphql/generated/graphql'
import { FormField, inputClass, textareaClass } from './FormField'
import { StepFooter } from './StepFooter'
import { UrlListInput } from './UrlListInput'

export function Step2ProjectRegistry({
  data,
  onSave,
  onNext,
  onBack,
  isLoading,
}: {
  data?: ProjectRegistryEntity | null
  onSave: (data: {
    isNonProfitOrganization: boolean
    organizationCountry: string
    organizationWebsite: string
    organizationDescription: string
    organizationName: string
    attachments: string[]
  }) => Promise<void>
  onNext: () => void
  onBack: () => void
  isLoading: boolean
}) {
  const { data: countriesData } = useAllowedCountries()
  const countries = countriesData?.getAllowedCountries ?? []

  const [isNonProfitOrganization, setIsNonProfitOrganization] = useState(
    data?.isNonProfitOrganization ?? false,
  )
  const [organizationCountry, setOrganizationCountry] = useState(
    data?.organizationCountry ?? '',
  )
  const [organizationWebsite, setOrganizationWebsite] = useState(
    data?.organizationWebsite ?? '',
  )
  const [organizationDescription, setOrganizationDescription] = useState(
    data?.organizationDescription ?? '',
  )
  const [organizationName, setOrganizationName] = useState(
    data?.organizationName ?? '',
  )
  const [attachments, setAttachments] = useState<string[]>(data?.attachments ?? [])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setIsNonProfitOrganization(data?.isNonProfitOrganization ?? false)
    setOrganizationCountry(data?.organizationCountry ?? '')
    setOrganizationWebsite(data?.organizationWebsite ?? '')
    setOrganizationDescription(data?.organizationDescription ?? '')
    setOrganizationName(data?.organizationName ?? '')
    setAttachments(data?.attachments ?? [])
  }, [data])

  const handleNext = async () => {
    const nextErrors: Record<string, string> = {}
    if (!organizationName.trim()) {
      nextErrors.organizationName = 'Organization name is required'
    }
    if (!organizationCountry) nextErrors.organizationCountry = 'Country is required'

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    try {
      await onSave({
        isNonProfitOrganization,
        organizationCountry,
        organizationWebsite: organizationWebsite.trim(),
        organizationDescription: organizationDescription.trim(),
        organizationName: organizationName.trim(),
        attachments,
      })
      onNext()
    } catch {
      setErrors({ submit: 'Failed to save. Please try again.' })
    }
  }

  return (
    <div className="space-y-5">
      <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-giv-neutral-900">
        <input
          type="checkbox"
          checked={isNonProfitOrganization}
          onChange={e => setIsNonProfitOrganization(e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-giv-brand-500"
        />
        This is a registered non-profit organization
      </label>

      <FormField
        label="Organization Name"
        required
        error={errors.organizationName}
      >
        <input
          type="text"
          value={organizationName}
          onChange={e => setOrganizationName(e.target.value)}
          className={inputClass}
          placeholder="My Organization"
        />
      </FormField>

      <FormField label="Country" required error={errors.organizationCountry}>
        <select
          value={organizationCountry}
          onChange={e => setOrganizationCountry(e.target.value)}
          className={`${inputClass} bg-white`}
        >
          <option value="">Select a country…</option>
          {countries.map((country: { name: string; code: string }) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Website">
        <input
          type="url"
          value={organizationWebsite}
          onChange={e => setOrganizationWebsite(e.target.value)}
          className={inputClass}
          placeholder="https://myorg.com"
        />
      </FormField>

      <FormField label="Organization Description">
        <textarea
          rows={3}
          value={organizationDescription}
          onChange={e => setOrganizationDescription(e.target.value)}
          className={textareaClass}
          placeholder="Brief description of your organization"
        />
      </FormField>

      <UrlListInput
        label="Supporting Documents (URLs)"
        hint="Paste links to documents that support your application."
        value={attachments}
        onChange={setAttachments}
      />

      {errors.submit && <p className="text-xs text-red-500">{errors.submit}</p>}
      <StepFooter onBack={onBack} onNext={handleNext} isLoading={isLoading} />
    </div>
  )
}
