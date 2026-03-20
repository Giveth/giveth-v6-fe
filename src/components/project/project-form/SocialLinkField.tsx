'use client'

interface SocialLinkFieldProps {
  id: string
  label: string
  icon: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function SocialLinkField({
  id,
  label,
  icon,
  placeholder,
  value,
  onChange,
}: SocialLinkFieldProps) {
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
          {icon}
        </div>
        <input
          type="url"
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-giv-brand-500/20 focus:border-giv-brand-500 text-sm text-giv-neutral-900"
        />
      </div>
    </div>
  )
}
