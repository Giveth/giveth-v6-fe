'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export const globalLocation = 'Global'

export interface ICoords {
  lat: number
  lng: number
}

const DEFAULT_COORDS: ICoords = { lat: 41.3879, lng: 2.15899 }
const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-places-script'

type GoogleAutocomplete = {
  addListener: (eventName: string, handler: () => void) => void
  getPlace: () => {
    name?: string
    formatted_address?: string
    geometry?: { location?: { lat: () => number; lng: () => number } }
  }
}

let googlePlacesScriptPromise: Promise<void> | null = null

function normalizeInitialLocation(value?: string): string {
  if (!value) return ''
  return value === 'Worldwide' ? globalLocation : value
}

function loadGoogleMapsPlacesScript(apiKey: string): Promise<void> {
  if (!apiKey) return Promise.resolve()
  const w = window as Window & {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: unknown,
          ) => GoogleAutocomplete
        }
        event?: { clearInstanceListeners: (instance: unknown) => void }
      }
    }
  }

  if (w.google?.maps?.places?.Autocomplete) return Promise.resolve()
  if (googlePlacesScriptPromise) return googlePlacesScriptPromise

  googlePlacesScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(
      GOOGLE_MAPS_SCRIPT_ID,
    ) as HTMLScriptElement | null

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Google Maps script')),
        { once: true },
      )
      return
    }

    const script = document.createElement('script')
    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener(
      'error',
      () => reject(new Error('Failed to load Google Maps script')),
      { once: true },
    )
    document.head.appendChild(script)
  })

  return googlePlacesScriptPromise
}

async function getCoordinates(address: string): Promise<ICoords | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  if (!apiKey || !address.trim()) return null

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
  const response = await fetch(url)
  const data = await response.json()

  if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
    const loc = data.results[0].geometry.location
    return { lat: loc.lat, lng: loc.lng }
  }

  return null
}

interface ImpactLocationSectionProps {
  impactLocation: string
  onImpactLocationChange: (value: string) => void
  onActivate: () => void
}

export function ImpactLocationSection({
  impactLocation,
  onImpactLocationChange,
  onActivate,
}: ImpactLocationSectionProps) {
  const [address, setAddress] = useState(
    normalizeInitialLocation(impactLocation),
  )
  const [coords, setCoords] = useState<ICoords>(DEFAULT_COORDS)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const autocompleteRef = useRef<GoogleAutocomplete | null>(null)
  const isGlobal = address === globalLocation

  useEffect(() => {
    const normalized = normalizeInitialLocation(impactLocation)
    setAddress(normalized)

    if (!normalized || normalized === globalLocation) {
      setCoords(DEFAULT_COORDS)
      return
    }

    getCoordinates(normalized).then(c => {
      if (c) setCoords(c)
    })
  }, [impactLocation])

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    if (!apiKey || !inputRef.current || isGlobal) return

    const w = window as Window & {
      google?: {
        maps?: {
          places?: {
            Autocomplete: new (
              input: HTMLInputElement,
              options?: unknown,
            ) => GoogleAutocomplete
          }
          event?: { clearInstanceListeners: (instance: unknown) => void }
        }
      }
    }

    loadGoogleMapsPlacesScript(apiKey)
      .then(() => {
        if (!inputRef.current || !w.google?.maps?.places?.Autocomplete) return
        const ac = new w.google.maps.places.Autocomplete(inputRef.current, {
          fields: ['name', 'formatted_address', 'geometry'],
        })
        autocompleteRef.current = ac

        ac.addListener('place_changed', () => {
          const place = ac.getPlace()
          const lat = place.geometry?.location?.lat?.()
          const lng = place.geometry?.location?.lng?.()
          if (typeof lat !== 'number' || typeof lng !== 'number') return

          const selectedAddress = place.formatted_address
            ? `${place.name || ''}${place.name ? ', ' : ''}${place.formatted_address}`.trim()
            : place.name || address

          setAddress(selectedAddress)
          setCoords({ lat, lng })
          onImpactLocationChange(selectedAddress)
        })
      })
      .catch(() => {
        // Fail silently; user can still type manually.
      })

    return () => {
      if (
        autocompleteRef.current &&
        w.google?.maps?.event?.clearInstanceListeners
      ) {
        w.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
      autocompleteRef.current = null
    }
  }, [isGlobal, onImpactLocationChange, address])

  const handleGlobalToggle = () => {
    const nextValue = isGlobal ? '' : globalLocation
    setAddress(nextValue)
    setCoords(DEFAULT_COORDS)
    onImpactLocationChange(nextValue)
  }

  const mapSrc = useMemo(() => {
    if (isGlobal) return 'https://www.google.com/maps?q=20,0&z=2&output=embed'
    if (address.trim()) {
      return `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=10&output=embed`
    }
    return `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=10&output=embed`
  }, [address, coords.lat, coords.lng, isGlobal])

  return (
    <section
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <h2 className="text-base font-semibold text-giv-neutral-900 mb-2">
        Where will your project have the most impact?
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Make it easier for donors to find your project by providing a location.
      </p>

      <label className="mb-2 block text-sm font-medium text-giv-neutral-700">
        Location
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          value={address}
          onChange={e => {
            setAddress(e.target.value)
            onImpactLocationChange(e.target.value)
          }}
          onBlur={() => {
            if (!address.trim() || address === globalLocation) return
            getCoordinates(address).then(c => {
              if (c) setCoords(c)
            })
          }}
          placeholder="Search places..."
          disabled={isGlobal}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-giv-brand-500/20 focus:border-giv-brand-500 text-giv-neutral-900 bg-white disabled:bg-gray-100 disabled:text-gray-500"
        />
      </div>

      <label className="mt-4 inline-flex items-center gap-2 text-sm text-giv-neutral-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-giv-brand-500 focus:ring-giv-brand-500"
          checked={isGlobal}
          onChange={handleGlobalToggle}
        />
        This project has global impact
      </label>

      <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 h-72">
        <iframe
          title="Project impact location map"
          src={mapSrc}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  )
}
