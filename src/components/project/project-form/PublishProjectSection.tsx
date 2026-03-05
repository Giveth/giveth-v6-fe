'use client'

import { Button } from '@/components/ui/button'

interface PublishProjectSectionProps {
  mode: 'create' | 'edit'
  isSubmitting: boolean
  submitError?: string
  onCancel: () => void
  onActivate: () => void
}

const EDIT_BULLETS = [
  "Edited projects will be 'unlisted' until reviewed by our team again.",
  'You can still access your project from your account and share it with your friends via the project link!',
  "You'll receive an email from us once your project is listed.",
] as const

export function PublishProjectSection({
  mode,
  isSubmitting,
  submitError,
  onCancel,
  onActivate,
}: PublishProjectSectionProps) {
  const isEdit = mode === 'edit'

  return (
    <section
      className="rounded-xl border border-giv-brand-200 bg-white p-6 shadow-sm"
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <h2 className="mb-4 text-4xl font-bold text-giv-neutral-900">
        {isEdit ? 'Publish edited project' : 'Publish your project'}
      </h2>

      {isEdit ? (
        <ul className="mb-8 list-disc space-y-2 pl-5 text-base text-giv-neutral-800">
          {EDIT_BULLETS.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mb-8 text-base text-gray-600">
          Your project will be reviewed by our team before going live. This
          usually takes 1-2 business days.
        </p>
      )}

      {submitError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {submitError}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="h-12 flex-1 rounded-full bg-giv-brand-500 text-white hover:bg-giv-brand-600"
        >
          {isSubmitting
            ? isEdit
              ? 'Publishing...'
              : 'Publishing...'
            : isEdit
              ? 'Publish'
              : 'Publish Project'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-12 flex-1 rounded-full border-giv-brand-500 text-giv-brand-500 hover:bg-giv-brand-050"
        >
          Cancel
        </Button>
      </div>
    </section>
  )
}
