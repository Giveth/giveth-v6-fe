'use client'

import { QuillEditor } from '@/components/editor'

interface ProjectDescriptionSectionProps {
  description: string
  error?: string
  minDescriptionChars: number
  onDescriptionChange: (value: string) => void
  onActivate: () => void
}

export function ProjectDescriptionSection({
  description,
  error,
  minDescriptionChars,
  onDescriptionChange,
  onActivate,
}: ProjectDescriptionSectionProps) {
  return (
    <section
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <label
        htmlFor="description"
        className="block text-base font-semibold text-giv-neutral-900 mb-2"
      >
        Tell us about your project...
      </label>
      <p className="text-sm text-gray-500 mb-4">
        Aim for 200-500 words. You can also use formatting to organize your
        text.
      </p>

      <QuillEditor
        id="description"
        value={description}
        onChange={onDescriptionChange}
        placeholder="Tell us what your project does and how it creates impact. What problem does it solve? Who benefits from it? What are your goals?"
        error={Boolean(error)}
        minHeight="200px"
        aria-label="Project description"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-sm text-gray-500 text-right">
        Aim for at least {minDescriptionChars} characters
      </p>
    </section>
  )
}
