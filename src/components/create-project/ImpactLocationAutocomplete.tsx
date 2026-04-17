'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Globe, Loader2, MapPin } from 'lucide-react'
import { createPortal } from 'react-dom'
import { Input } from '@/components/ui/input'
import {
  searchPhotonPlaces,
  type LocationSuggestion,
} from '@/lib/location/photon'
import { cn } from '@/lib/utils'

const WORLDWIDE_OPTION: LocationSuggestion = {
  id: 'worldwide',
  label: 'Worldwide',
  secondaryText: 'Use when the project is not tied to a single place',
  source: 'custom',
}

const DROPDOWN_PANEL_CLASSES =
  'z-[70] overflow-hidden rounded-xl border border-[#D7DDEA] bg-white shadow-[0px_12px_32px_rgba(10,13,18,0.12)]'

type PanelPosition = {
  top: number
  left: number
  width: number
}

export function ImpactLocationAutocomplete({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const requestIdRef = useRef(0)

  const trimmedValue = value.trim()
  const showWorldwideOption =
    !trimmedValue ||
    WORLDWIDE_OPTION.label.toLowerCase().includes(trimmedValue.toLowerCase())

  const items = useMemo(() => {
    const nextItems = showWorldwideOption ? [WORLDWIDE_OPTION] : []
    return [...nextItems, ...suggestions]
  }, [showWorldwideOption, suggestions])

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(0)
      return
    }

    setHighlightedIndex(current =>
      Math.min(current, Math.max(items.length - 1, 0)),
    )
  }, [isOpen, items.length])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        !containerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setPanelPosition(null)
      return
    }

    const updatePanelPosition = () => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      setPanelPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      })
    }

    updatePanelPosition()

    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)

    return () => {
      window.removeEventListener('resize', updatePanelPosition)
      window.removeEventListener('scroll', updatePanelPosition, true)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const query = trimmedValue
    if (!query) {
      setSuggestions([])
      setError(null)
      setIsLoading(false)
      return
    }

    requestIdRef.current += 1
    const requestId = requestIdRef.current
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true)
      setError(null)

      void searchPhotonPlaces(query)
        .then(nextSuggestions => {
          if (requestIdRef.current !== requestId) return
          setSuggestions(nextSuggestions)
        })
        .catch(fetchError => {
          if (requestIdRef.current !== requestId) return
          setSuggestions([])
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Could not load location suggestions.',
          )
        })
        .finally(() => {
          if (requestIdRef.current !== requestId) return
          setIsLoading(false)
        })
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [isOpen, trimmedValue])

  const selectItem = (item: LocationSuggestion) => {
    onChange(item.label)
    setIsOpen(false)
    setSuggestions([])
    setError(null)
    setHighlightedIndex(0)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          value={value}
          disabled={disabled}
          onFocus={() => setIsOpen(true)}
          onChange={event => {
            onChange(event.target.value)
            setIsOpen(true)
          }}
          onKeyDown={event => {
            if (!isOpen && event.key === 'ArrowDown') {
              event.preventDefault()
              setIsOpen(true)
              return
            }

            if (!isOpen || items.length === 0) {
              if (event.key === 'Escape') {
                setIsOpen(false)
              }
              return
            }

            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setHighlightedIndex(index =>
                Math.min(index + 1, items.length - 1),
              )
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              setHighlightedIndex(index => Math.max(index - 1, 0))
            } else if (event.key === 'Enter') {
              event.preventDefault()
              selectItem(items[highlightedIndex] ?? items[0])
            } else if (event.key === 'Escape') {
              event.preventDefault()
              setIsOpen(false)
            }
          }}
          placeholder="Search for a city, region, or country"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          className={cn(
            'pr-20',
            'rounded-md border-[#D7DDEA] bg-white shadow-none focus-visible:border-[#B9A7FF] focus-visible:ring-0 focus-visible:shadow-[0px_0px_0px_4px_#F4EBFF,0px_1px_2px_0px_#0A0D120D]',
          )}
        />
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-2 text-[#9ca3af]">
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MapPin className="size-4" />
          )}
          <ChevronDown
            className={cn(
              'size-4 transition-transform',
              isOpen && 'rotate-180',
            )}
          />
        </div>
      </div>

      {isOpen &&
        panelPosition &&
        createPortal(
          <div
            ref={panelRef}
            className={cn(DROPDOWN_PANEL_CLASSES, 'fixed')}
            style={{
              top: panelPosition.top,
              left: panelPosition.left,
              width: panelPosition.width,
            }}
          >
            <div className="max-h-72 overflow-y-auto p-2">
              {items.length > 0 ? (
                <div className="space-y-1">
                  {items.map((item, index) => {
                    const isHighlighted = index === highlightedIndex

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onMouseDown={event => {
                          event.preventDefault()
                          selectItem(item)
                        }}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                          isHighlighted ? 'bg-[#f4ebff]' : 'hover:bg-[#f8fafc]',
                        )}
                      >
                        <span className="mt-0.5 text-[#7c6af2]">
                          {item.source === 'custom' ? (
                            <Globe className="size-4" />
                          ) : (
                            <MapPin className="size-4" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-[#111827]">
                            {item.label}
                          </span>
                          {item.secondaryText && (
                            <span className="block truncate text-xs text-[#6b7280]">
                              {item.secondaryText}
                            </span>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : trimmedValue && !isLoading && !error ? (
                <div className="px-3 py-4 text-sm text-[#6b7280]">
                  No places found for this search.
                </div>
              ) : (
                <div className="px-3 py-4 text-sm text-[#6b7280]">
                  Start typing to search places.
                </div>
              )}

              {error && (
                <div className="px-3 pb-2 pt-1 text-xs font-medium text-red-600">
                  {error}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
