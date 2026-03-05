'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'

/**
 * The mode of the color picker.
 */
type ColorMode = 'color' | 'background'

/**
 * The preset colors.
 */
const PRESET_COLORS = [
  '#000000',
  '#4b5563',
  '#9ca3af',
  '#ffffff',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#65a30d',
  '#16a34a',
  '#0891b2',
  '#2563eb',
  '#7c3aed',
  '#db2777',
]

/**
 * The props for the color picker popover.
 */
export interface ColorPickerPopoverProps {
  mode: ColorMode
  value: string
  onSelect: (value: string | false) => void
  onClose: () => void
}

/**
 * Sanitize the hex value.
 * @param value - The value to sanitize.
 * @returns The sanitized value.
 */
function sanitizeHex(value: string): string {
  const trimmed = value.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase()
  return '#000000'
}

export function ColorPickerPopover({
  mode,
  value,
  onSelect,
  onClose,
}: ColorPickerPopoverProps) {
  const [hex, setHex] = useState(sanitizeHex(value))

  useEffect(() => {
    setHex(sanitizeHex(value))
  }, [value])

  const title = mode === 'color' ? 'Text color' : 'Background color'

  return (
    <>
      <div className="fixed inset-0 z-10" aria-hidden onClick={onClose} />
      <div
        className="absolute left-2 top-12 z-20 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
        role="dialog"
        aria-label={title}
      >
        <p className="mb-2 text-sm font-medium text-gray-700">{title}</p>

        <div className="mb-3 flex items-center gap-2">
          <span className="w-10 text-xs text-gray-500">Hex</span>
          <input
            type="text"
            value={hex}
            onChange={e => setHex(e.target.value)}
            onBlur={() => setHex(sanitizeHex(hex))}
            className="h-9 w-full rounded-lg border border-gray-200 px-2 text-sm"
            placeholder="#000000"
          />
          <input
            type="color"
            value={sanitizeHex(hex)}
            onChange={e => setHex(e.target.value)}
            className="h-9 w-10 cursor-pointer rounded border border-gray-200 p-0.5"
            aria-label={`${title} picker`}
          />
        </div>

        <div className="mb-3 grid grid-cols-7 gap-1.5">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              className={clsx(
                'h-6 w-6 rounded border border-gray-300',
                sanitizeHex(hex) === color && 'ring-2 ring-gray-400',
              )}
              style={{ backgroundColor: color }}
              onClick={() => setHex(color)}
              aria-label={`Pick ${color}`}
            />
          ))}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => onSelect(false)}
          >
            Clear
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
              onClick={() => onSelect(sanitizeHex(hex))}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
