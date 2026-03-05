'use client'

import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
  DEFAULT_YOUTUBE_IFRAME_HEIGHT,
  DEFAULT_YOUTUBE_IFRAME_WIDTH,
  parseEmbedUrl,
} from './embedBlots'
import type { EmbedPayload, EmbedType } from './embedBlots'

export interface EmbedOption {
  type: EmbedType
  label: string
  icon: React.ReactNode
  placeholder: string
}

/**
 * The options for the embed popover.
 */
const EMBED_OPTIONS: EmbedOption[] = [
  {
    type: 'twitter',
    label: 'X (Tweet)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          fill="currentColor"
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        />
      </svg>
    ),
    placeholder: 'https://x.com/username/status/1234567890',
  },
  {
    type: 'youtube',
    label: 'Youtube Video',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          fill="currentColor"
          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
        />
      </svg>
    ),
    placeholder: 'https://www.youtube.com/watch?v=VIDEO_ID',
  },
  {
    type: 'figma',
    label: 'Figma Document',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          fill="currentColor"
          d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117a2.987 2.987 0 1 0 0-5.974h-3.117V7.51zm0 1.471H8.148a4.505 4.505 0 0 0 4.587 4.49v-4.49zm0 5.974v-4.49a4.505 4.505 0 0 0-4.587 4.49h4.587zM8.148 8.981a4.505 4.505 0 0 0 4.587 4.49V7.51H8.148zm4.587 5.974H8.148a4.505 4.505 0 0 0 4.587 4.49v-4.49zm4.49-4.49a4.505 4.505 0 0 0-4.49-4.49v4.49h4.49zm0 1.471a2.987 2.987 0 0 1-2.984 2.984 2.987 2.987 0 0 1-2.984-2.984v2.984a2.987 2.987 0 0 1 2.984 2.984 2.987 2.987 0 0 1 2.984-2.984V12.936z"
        />
      </svg>
    ),
    placeholder: 'https://www.figma.com/file/...',
  },
]

/**
 * The props for the embed popover.
 */
export interface EmbedPopoverProps {
  onInsert: (type: EmbedType, payload: EmbedPayload) => void
  onClose: () => void
  initialData?: {
    type: EmbedType
    url: string
    width?: number
    height?: number
  }
  lockType?: boolean
  submitLabel?: string
}

/**
 * The embed popover.
 * @param onInsert - The function to insert the embed.
 * @param onClose - The function to close the popover.
 * @param initialData - The initial data for the embed.
 * @param lockType - Whether to lock the type of the embed.
 * @param submitLabel - The label for the submit button.
 */
export function EmbedPopover({
  onInsert,
  onClose,
  initialData,
  lockType = false,
  submitLabel = 'Embed',
}: EmbedPopoverProps) {
  const initialOption = useMemo(
    () =>
      initialData
        ? EMBED_OPTIONS.find(option => option.type === initialData.type) || null
        : null,
    [initialData],
  )

  const [step, setStep] = useState<'pick' | 'url'>(
    initialOption ? 'url' : 'pick',
  )
  const [selected, setSelected] = useState<EmbedOption | null>(initialOption)
  const [url, setUrl] = useState(initialData?.url || '')
  const [youtubeWidth, setYoutubeWidth] = useState(
    String(initialData?.width ?? DEFAULT_YOUTUBE_IFRAME_WIDTH),
  )
  const [youtubeHeight, setYoutubeHeight] = useState(
    String(initialData?.height ?? DEFAULT_YOUTUBE_IFRAME_HEIGHT),
  )
  const [error, setError] = useState('')

  useEffect(() => {
    setSelected(initialOption)
    setStep(initialOption ? 'url' : 'pick')
    setUrl(initialData?.url || '')
    setYoutubeWidth(String(initialData?.width ?? DEFAULT_YOUTUBE_IFRAME_WIDTH))
    setYoutubeHeight(
      String(initialData?.height ?? DEFAULT_YOUTUBE_IFRAME_HEIGHT),
    )
    setError('')
  }, [initialData, initialOption])

  const handleSelectOption = (option: EmbedOption) => {
    setSelected(option)
    setUrl('')
    setYoutubeWidth(String(DEFAULT_YOUTUBE_IFRAME_WIDTH))
    setYoutubeHeight(String(DEFAULT_YOUTUBE_IFRAME_HEIGHT))
    setError('')
    setStep('url')
  }

  const handleBack = () => {
    if (lockType) return
    setStep('pick')
    setSelected(null)
    setUrl('')
    setYoutubeWidth(String(DEFAULT_YOUTUBE_IFRAME_WIDTH))
    setYoutubeHeight(String(DEFAULT_YOUTUBE_IFRAME_HEIGHT))
    setError('')
  }

  const handleSubmit = () => {
    if (!selected) return
    const parsed = parseEmbedUrl(selected.type, url)
    if (!parsed) {
      setError(`Please enter a valid ${selected.label} URL.`)
      return
    }

    if (selected.type === 'youtube') {
      const width = Number.parseInt(youtubeWidth, 10)
      const height = Number.parseInt(youtubeHeight, 10)
      if (!Number.isFinite(width) || width <= 0) {
        setError('Please enter a valid iframe width.')
        return
      }
      if (!Number.isFinite(height) || height <= 0) {
        setError('Please enter a valid iframe height.')
        return
      }
      onInsert(selected.type, {
        url: url.trim(),
        width,
        height,
      })
      onClose()
      return
    }

    onInsert(selected.type, parsed)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-10" aria-hidden onClick={onClose} />
      <div
        className="absolute left-2 top-12 z-20 w-80 rounded-lg border border-gray-200 bg-white shadow-lg"
        role="dialog"
        aria-label="Embed link"
      >
        {step === 'pick' ? (
          <div className="p-2">
            <p className="mb-2 text-sm font-medium text-gray-700">Embed link</p>
            <ul className="space-y-0.5">
              {EMBED_OPTIONS.map(option => (
                <li key={option.type}>
                  <button
                    type="button"
                    className={clsx(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      'hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                    )}
                    onClick={() => handleSelectOption(option)}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-700">
                      {option.icon}
                    </span>
                    <span className="font-medium text-gray-900">
                      {option.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="p-3">
            {selected && (
              <>
                {!lockType && (
                  <button
                    type="button"
                    className="mb-2 text-sm text-gray-500 hover:text-gray-700"
                    onClick={handleBack}
                  >
                    ← Back
                  </button>
                )}
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-700">
                    {selected.icon}
                  </span>
                  {selected.label}
                </p>
                <label className="sr-only" htmlFor="embed-url">
                  Paste {selected.label} URL
                </label>
                <input
                  id="embed-url"
                  type="url"
                  value={url}
                  onChange={e => {
                    setUrl(e.target.value)
                    setError('')
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  placeholder={selected.placeholder}
                  className={clsx(
                    'w-full rounded-lg border px-3 py-2 text-sm placeholder:text-gray-400',
                    error
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-gray-300 focus:ring-gray-200',
                  )}
                  autoFocus
                />
                {selected.type === 'youtube' && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <label className="text-xs text-gray-600">
                      Width
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={youtubeWidth}
                        onChange={e => {
                          setYoutubeWidth(e.target.value)
                          setError('')
                        }}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-300 focus:ring-gray-200"
                        placeholder={String(DEFAULT_YOUTUBE_IFRAME_WIDTH)}
                      />
                    </label>
                    <label className="text-xs text-gray-600">
                      Height
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={youtubeHeight}
                        onChange={e => {
                          setYoutubeHeight(e.target.value)
                          setError('')
                        }}
                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-300 focus:ring-gray-200"
                        placeholder={String(DEFAULT_YOUTUBE_IFRAME_HEIGHT)}
                      />
                    </label>
                  </div>
                )}
                {error && (
                  <p className="mt-1.5 text-sm text-red-600">{error}</p>
                )}
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
                    onClick={handleSubmit}
                  >
                    {submitLabel}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
