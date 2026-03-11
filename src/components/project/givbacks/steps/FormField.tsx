'use client'

import type { ReactNode } from 'react'

export function FormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-giv-neutral-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-giv-neutral-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export const inputClass =
  'w-full rounded-xl border border-giv-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-giv-brand-500'

export const textareaClass =
  'w-full resize-none rounded-xl border border-giv-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-giv-brand-500'
