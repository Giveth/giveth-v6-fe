'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { useUploadAvatar } from '@/hooks/useAccount'

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024

const GALLERY_IMAGES = [
  { id: 1, color: '#5326ec', path: '/images/defaultProjectImages/1.png' },
  { id: 2, color: '#f4cf67', path: '/images/defaultProjectImages/2.png' },
  { id: 3, color: '#35b9d0', path: '/images/defaultProjectImages/3.png' },
  { id: 4, color: '#2589ff', path: '/images/defaultProjectImages/4.png' },
] as const

type SearchResult = {
  id: string
  thumb: string
  regular: string
  alt: string
  username: string
  photographer: string
  downloadLocation?: string
}

type UnsplashPhoto = {
  id: string
  alt_description?: string | null
  description?: string | null
  urls?: {
    small?: string
    thumb?: string
    regular?: string
  }
  user?: {
    username?: string
    name?: string
  }
  links?: {
    download_location?: string
  }
}

type UnsplashSearchResponse = {
  results?: UnsplashPhoto[]
  total_pages?: number
}

type Attribution = {
  username: string
  photographer: string
}

interface ProjectImageSectionProps {
  image: string
  onImageChange: (value: string) => void
  onActivate?: () => void
}

export function ProjectImageSection({
  image,
  onImageChange,
  onActivate,
}: ProjectImageSectionProps) {
  const token =
    typeof window !== 'undefined'
      ? (localStorage.getItem('giveth_token') ?? undefined)
      : undefined
  const uploadMutation = useUploadAvatar(token)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'upload' | 'search'>('upload')
  const [dragging, setDragging] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchPage, setSearchPage] = useState(1)
  const [searchError, setSearchError] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [attribution, setAttribution] = useState<Attribution | null>(null)
  const unsplashApiKey = process.env.NEXT_PUBLIC_UNSPLASH_API

  const selectedGalleryImage = useMemo(
    () => GALLERY_IMAGES.find(bg => bg.path === image)?.path,
    [image],
  )
  const isGalleryImageSelected = Boolean(selectedGalleryImage)

  const clearImage = useCallback(() => {
    onImageChange('')
    setAttribution(null)
    setUploadError('')
  }, [onImageChange])

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file (PNG, JPG, or GIF).')
        return
      }
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        setUploadError('File is too large. Maximum size is 5MB.')
        return
      }

      setUploadError('')
      try {
        const imageUrl = await uploadMutation.mutateAsync(file)
        onImageChange(imageUrl)
        setAttribution(null)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Image upload failed.'
        setUploadError(message)
      }
    },
    [onImageChange, uploadMutation],
  )

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) {
        return
      }
      await handleUpload(file)
      e.target.value = ''
    },
    [handleUpload],
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (!file) {
        return
      }
      await handleUpload(file)
    },
    [handleUpload],
  )

  const searchPhotos = useCallback(
    async (query: string, page: number, append: boolean) => {
      const trimmedQuery = query.trim()
      if (!trimmedQuery) {
        setSearchError('Enter a keyword to search for photos.')
        return
      }
      if (!unsplashApiKey) {
        setSearchError(
          'Photo search is unavailable. Set NEXT_PUBLIC_UNSPLASH_API to enable it.',
        )
        return
      }

      setSearchError('')
      setIsSearching(true)
      try {
        const params = new URLSearchParams({
          query: trimmedQuery,
          page: String(page),
          per_page: '9',
          orientation: 'landscape',
        })
        const response = await fetch(
          `https://api.unsplash.com/search/photos?${params.toString()}`,
          {
            headers: { Authorization: `Client-ID ${unsplashApiKey}` },
          },
        )
        if (!response.ok) {
          throw new Error('Unable to search photos right now.')
        }
        const data = (await response.json()) as UnsplashSearchResponse
        const mapped: SearchResult[] = (data.results || []).map(item => ({
          id: item.id,
          thumb: item.urls?.small || item.urls?.thumb || '',
          regular: item.urls?.regular || '',
          alt: item.alt_description || item.description || 'Unsplash photo',
          username: item.user?.username || '',
          photographer: item.user?.name || 'Unsplash contributor',
          downloadLocation: item.links?.download_location,
        }))

        setSearchResults(prev => (append ? [...prev, ...mapped] : mapped))
        setHasMore(page < (data.total_pages || 0))
        setSearchPage(page)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to search photos.'
        setSearchError(message)
      } finally {
        setIsSearching(false)
      }
    },
    [unsplashApiKey],
  )

  const handleSelectUnsplash = useCallback(
    async (result: SearchResult) => {
      onImageChange(result.regular)
      if (result.username) {
        setAttribution({
          username: result.username,
          photographer: result.photographer,
        })
      }
      if (result.downloadLocation && unsplashApiKey) {
        // Unsplash recommends tracking downloads for selected images.
        fetch(
          `${result.downloadLocation}${result.downloadLocation.includes('?') ? '&' : '?'}client_id=${unsplashApiKey}`,
        ).catch(() => undefined)
      }
    },
    [onImageChange, unsplashApiKey],
  )

  const onSearchSubmit = useCallback(() => {
    searchPhotos(searchQuery, 1, false)
  }, [searchPhotos, searchQuery])

  return (
    <section
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <h2 className="text-base font-semibold text-giv-neutral-900 mb-2">
        Add one image to your project
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        This image will be displayed on your project card. (Recommended:
        1200×675px)
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={`rounded-full px-5 py-2 text-base transition ${
            tab === 'upload'
              ? 'bg-giv-brand-050 text-giv-brand-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setTab('upload')}
        >
          Upload cover image
        </button>
        <button
          type="button"
          className={`rounded-full px-5 py-2 text-base transition ${
            tab === 'search'
              ? 'text-giv-pink-500'
              : 'text-gray-500 hover:text-giv-pink-500'
          }`}
          onClick={() => setTab('search')}
        >
          Search for photos
        </button>
      </div>

      {tab === 'upload' ? (
        <div className="space-y-4">
          {image && (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <img
                src={image}
                alt="Selected project image"
                className="h-56 w-full object-cover"
              />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif"
            className="hidden"
            onChange={handleFileInput}
          />
          {!isGalleryImageSelected && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              onDragOver={e => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`rounded-lg border border-dashed p-10 text-center transition ${
                dragging
                  ? 'border-giv-brand-500 bg-giv-brand-050'
                  : 'border-gray-300 hover:border-giv-brand-500'
              }`}
            >
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <path
                    d="M21 15L16 10L5 21"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <p className="text-base text-giv-neutral-900">
                Drag and drop an image, or{' '}
                <span className="text-giv-pink-500">upload from device</span>.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}

          {isGalleryImageSelected && (
            <p className="text-sm text-gray-500">
              Gallery image selected. Click REMOVE to upload from your device.
            </p>
          )}

          {uploadMutation.isPending && (
            <p className="text-sm text-gray-600">Uploading image...</p>
          )}
          {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onSearchSubmit()
                }
              }}
              placeholder="Search Unsplash photos"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-giv-neutral-900 focus:border-giv-brand-500 focus:outline-none focus:ring-2 focus:ring-giv-brand-500/20"
            />
            <button
              type="button"
              onClick={onSearchSubmit}
              className="rounded-lg border border-giv-brand-500 px-4 py-3 text-sm font-medium text-giv-brand-600 hover:bg-giv-brand-050"
            >
              Search
            </button>
          </div>

          {searchError && <p className="text-sm text-red-600">{searchError}</p>}

          <div className="grid grid-cols-3 gap-3">
            {searchResults.map(result => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelectUnsplash(result)}
                className="overflow-hidden rounded-lg border border-gray-200 text-left transition hover:border-giv-brand-500"
              >
                <img
                  src={result.thumb}
                  alt={result.alt}
                  className="h-24 w-full object-cover"
                />
              </button>
            ))}
          </div>

          {isSearching && (
            <p className="text-sm text-gray-600">Searching photos...</p>
          )}

          {!isSearching && hasMore && searchResults.length > 0 && (
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => searchPhotos(searchQuery, searchPage + 1, true)}
            >
              Load more
            </button>
          )}
        </div>
      )}

      <div className="mt-5">
        <p className="mb-2 text-sm text-giv-neutral-900">
          Select an image from our gallery.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {GALLERY_IMAGES.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onImageChange(option.path)
                setAttribution(null)
              }}
              aria-label={`Choose gallery image ${option.id}`}
              className={`h-16 w-20 rounded-lg border transition ${
                selectedGalleryImage === option.path
                  ? 'border-giv-brand-500 ring-2 ring-giv-brand-500/25'
                  : 'border-transparent hover:border-giv-brand-300'
              }`}
              style={{ backgroundColor: option.color }}
            />
          ))}
          <button
            type="button"
            onClick={clearImage}
            disabled={!image}
            className={`h-16 rounded-lg border px-5 text-sm font-semibold ${
              image
                ? 'border-gray-300 text-gray-600 hover:bg-gray-50'
                : 'border-gray-200 text-gray-300'
            }`}
          >
            REMOVE
          </button>
        </div>
      </div>

      {attribution && (
        <p className="mt-4 text-xs text-gray-500">
          Photo by{' '}
          <a
            href={`https://unsplash.com/@${attribution.username}?utm_source=giveth&utm_medium=referral`}
            target="_blank"
            rel="noreferrer"
            className="text-giv-pink-500 hover:underline"
          >
            {attribution.photographer}
          </a>{' '}
          on{' '}
          <a
            href="https://unsplash.com/?utm_source=giveth&utm_medium=referral"
            target="_blank"
            rel="noreferrer"
            className="text-giv-pink-500 hover:underline"
          >
            Unsplash
          </a>
          .
        </p>
      )}
    </section>
  )
}
