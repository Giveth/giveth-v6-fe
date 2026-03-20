'use client'

import { useState } from 'react'
import clsx from 'clsx'
import type { EmojiCategory } from '@/components/editor/defaultEmojis'

/**
 * The props for the EmojiPickerPopover.
 * @returns The props for the EmojiPickerPopover.
 */
export interface EmojiPickerPopoverProps {
  categories: EmojiCategory[]
  onSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPickerPopover({
  categories,
  onSelect,
  onClose,
}: EmojiPickerPopoverProps) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? '')
  const active = categories.find(c => c.id === activeId) ?? categories[0]
  const emojis = active ? [...new Set(active.emojis)] : []

  return (
    <>
      <div className="fixed inset-0 z-10" aria-hidden onClick={onClose} />
      <div
        className="absolute left-2 top-12 z-20 w-80 rounded-lg border border-gray-200 bg-white shadow-lg"
        role="dialog"
        aria-label="Choose emoji"
      >
        <div className="flex border-b border-gray-100 bg-gray-50 px-1 py-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={clsx(
                'rounded p-2 text-lg transition-colors',
                activeId === cat.id
                  ? 'bg-white shadow-sm ring-1 ring-gray-200'
                  : 'hover:bg-gray-100',
              )}
              onClick={() => setActiveId(cat.id)}
              title={cat.label}
              aria-label={cat.label}
              aria-pressed={activeId === cat.id}
            >
              {cat.icon}
            </button>
          ))}
        </div>
        <div className="max-h-64 overflow-auto p-2">
          <div className="grid grid-cols-8 gap-1">
            {emojis.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                type="button"
                className="rounded p-1.5 text-xl hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => onSelect(emoji)}
                aria-label={`Insert ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
