'use client'

interface ProjectNameSectionProps {
  title: string
  error?: string
  onTitleChange: (value: string) => void
  onActivate: () => void
}

export function ProjectNameSection({
  title,
  error,
  onTitleChange,
  onActivate,
}: ProjectNameSectionProps) {
  return (
    <section
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <div className="flex items-center justify-between mb-4">
        <label
          htmlFor="title"
          className="text-base font-semibold text-giv-neutral-900"
        >
          Project Name
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{title.length}/55</span>
        </div>
      </div>
      <input
        type="text"
        id="title"
        value={title}
        onChange={e => onTitleChange(e.target.value)}
        placeholder="My Amazing Project"
        maxLength={55}
        aria-invalid={!!error}
        aria-describedby={error ? 'title-error' : undefined}
        className={`w-full px-4 py-3 rounded-lg border ${
          error ? 'border-red-500' : 'border-gray-200'
        } focus:outline-none focus:ring-2 focus:ring-giv-brand-500/20 focus:border-giv-brand-500 text-giv-neutral-900`}
      />
      {error && (
        <p id="title-error" role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  )
}
