'use client'

import { useState } from 'react'

export function UrlListInput({
  label,
  hint,
  value,
  onChange,
  placeholder = 'https://…',
}: {
  label: string
  hint?: string
  value: string[]
  onChange: (urls: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')

  const add = () => {
    const url = input.trim()
    if (!url) return
    onChange([...value, url])
    setInput('')
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-giv-neutral-900">
        {label}
      </label>
      {hint && <p className="mb-2 text-xs text-giv-neutral-500">{hint}</p>}
      <div className="flex gap-2">
        <input
          type="url"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          className="flex-1 rounded-xl border border-giv-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-giv-brand-500"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={add}
          className="cursor-pointer rounded-xl border border-giv-brand-500 px-4 py-2.5 text-sm font-semibold text-giv-brand-500 transition-colors hover:bg-giv-brand-50"
        >
          Add
        </button>
      </div>
      {!!value.length && (
        <ul className="mt-2 space-y-1">
          {value.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="flex items-center justify-between rounded-lg bg-giv-neutral-100 px-3 py-2 text-xs"
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[80%] truncate text-giv-link-500"
              >
                {url}
              </a>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                aria-label="Remove URL"
                className="ml-2 shrink-0 cursor-pointer text-giv-neutral-500 hover:text-red-500"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
