/**
 * Registers custom Quill embed blots for YouTube, X (Twitter), and Figma.
 * Call once when Quill is loaded (e.g. when loading react-quill-new).
 */

/**
 * Get the block embed from the Quill instance.
 * @param Quill - The Quill instance.
 * @returns The block embed.
 */
function getBlockEmbed(Quill: { import: (path: string) => unknown }) {
  return Quill.import('blots/block/embed') as {
    new (node: HTMLElement, value?: unknown): HTMLElement
    create(value?: unknown): HTMLElement
    value(node: HTMLElement): unknown
    blotName: string
    tagName: string
    className?: string
  }
}

/**
 * Parse the YouTube URL to get the video ID.
 * @param url - The YouTube URL.
 * @returns The YouTube video ID.
 */
function parseYouTubeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  const idFromWatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  )
  if (idFromWatch) return idFromWatch[1]
  const idFromShort = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (idFromShort) return idFromShort[1]
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  return null
}

/**
 * Parse the Twitter URL to get the tweet ID.
 * @param url - The Twitter URL.
 * @returns The Twitter tweet ID.
 */
function parseTwitterId(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (/(?:twitter\.com|x\.com)/.test(trimmed)) {
    const match = trimmed.match(/status\/(\d+)/)
    if (match) return match[1]
  }
  if (/^\d+$/.test(trimmed)) return trimmed
  return null
}

/**
 * Normalize the Twitter URL to get the tweet ID.
 * @param url - The Twitter URL.
 * @returns The normalized Twitter URL.
 */
function normalizeTwitterUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  const id = parseTwitterId(trimmed)
  if (!id) return null

  if (/^\d+$/.test(trimmed)) {
    return `https://twitter.com/i/status/${id}`
  }

  const userPathMatch = trimmed.match(
    /(?:twitter\.com|x\.com)\/([^/]+)\/status\/\d+/,
  )
  const user = userPathMatch?.[1]
  if (user && user !== 'i') {
    return `https://twitter.com/${user}/status/${id}`
  }

  return `https://twitter.com/i/status/${id}`
}

/**
 * Parse and validate a Figma URL.
 * @param url - The Figma URL.
 * @returns The trimmed Figma URL when valid.
 */
function parseFigmaUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    const protocol = parsed.protocol.toLowerCase()
    const host = parsed.hostname.toLowerCase()
    const path = parsed.pathname.toLowerCase()

    const isHttp = protocol === 'http:' || protocol === 'https:'
    const isFigmaHost = host === 'figma.com' || host === 'www.figma.com'
    const isSupportedPath =
      path.startsWith('/file/') || path.startsWith('/proto/')

    if (!isHttp || !isFigmaHost || !isSupportedPath) return null
    return trimmed
  } catch {
    return null
  }
}

/**
 * Render the Twitter widget.
 * @see https://developer.x.com/en/docs/twitter-for-websites/javascript-api/guides/oembed-api
 * @param target - The target element.
 * @returns The Twitter widget.
 */
function renderTwitterWidget(target: HTMLElement) {
  if (typeof window === 'undefined') return

  const w = window as Window & {
    twttr?: {
      widgets?: { load: (element?: HTMLElement) => void }
    }
  }

  const loadWidget = () => {
    w.twttr?.widgets?.load?.(target)
  }

  if (w.twttr?.widgets?.load) {
    loadWidget()
    return
  }

  const scriptId = 'twitter-wjs'
  const existingScript = document.getElementById(
    scriptId,
  ) as HTMLScriptElement | null

  if (existingScript) {
    existingScript.addEventListener('load', loadWidget, { once: true })
    return
  }

  const script = document.createElement('script')
  script.id = scriptId
  script.src = 'https://platform.twitter.com/widgets.js'
  script.async = true
  script.charset = 'utf-8'
  script.addEventListener('load', loadWidget, { once: true })
  document.body.appendChild(script)
}

/**
 * The default width of the YouTube iframe.
 */
export const DEFAULT_YOUTUBE_IFRAME_WIDTH = 500
/**
 * The default height of the YouTube iframe.
 */
export const DEFAULT_YOUTUBE_IFRAME_HEIGHT = 300
/**
 * The event name for the YouTube edit event.
 */
export const YOUTUBE_EDIT_EVENT = 'quill-youtube-edit'

/**
 * The detail of the YouTube edit event.
 */
export type YoutubeEditEventDetail = {
  node: HTMLDivElement
  url: string
  width: number
  height: number
}

/**
 * The payload for the YouTube embed.
 */
type YoutubeEmbedPayload = {
  url: string
  width?: number
  height?: number
}

/**
 * The payload for the embed.
 */
export type EmbedPayload = string | YoutubeEmbedPayload

/**
 * Convert the value to a dimension.
 * @param value - The value to convert.
 * @param fallback - The fallback value.
 * @returns The dimension.
 */
function toDimension(value: unknown, fallback: number): number {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.min(3000, Math.round(n))
}

/**
 * Parse the YouTube payload.
 * @param value - The payload to parse.
 * @returns The parsed payload.
 */
function parseYoutubePayload(value: EmbedPayload): {
  id: string
  rawUrl: string
  width: number
  height: number
} | null {
  if (typeof value === 'string') {
    const id = parseYouTubeUrl(value)
    if (!id) return null
    return {
      id,
      rawUrl: value.trim(),
      width: DEFAULT_YOUTUBE_IFRAME_WIDTH,
      height: DEFAULT_YOUTUBE_IFRAME_HEIGHT,
    }
  }

  if (!value || typeof value !== 'object' || typeof value.url !== 'string') {
    return null
  }

  const rawUrl = value.url.trim()
  const id = parseYouTubeUrl(rawUrl)
  if (!id) return null

  return {
    id,
    rawUrl,
    width: toDimension(value.width, DEFAULT_YOUTUBE_IFRAME_WIDTH),
    height: toDimension(value.height, DEFAULT_YOUTUBE_IFRAME_HEIGHT),
  }
}

/**
 * Get the YouTube embed src.
 * @param videoId - The YouTube video ID.
 * @returns The YouTube embed src.
 */
function getYoutubeEmbedSrc(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * The size of the YouTube edit hotspot.
 */
const YOUTUBE_EDIT_HOTSPOT_SIZE = 28
const YOUTUBE_EDIT_HOTSPOT_OFFSET = 8

/**
 * Register the YouTube embed blot.
 * @param Quill - The Quill instance.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerEmbedBlots(Quill: any) {
  const BlockEmbed = getBlockEmbed(Quill)

  class YoutubeEmbed extends BlockEmbed {
    static blotName = 'youtube'
    static tagName = 'div'
    static className = 'ql-embed-youtube'

    static create(value: EmbedPayload) {
      const node = super.create() as HTMLDivElement
      const parsed = parseYoutubePayload(value)
      if (!parsed) return node
      const { id, rawUrl, width, height } = parsed
      node.setAttribute('data-video-id', id)
      node.setAttribute('data-youtube-url', rawUrl)
      node.setAttribute('data-width', String(width))
      node.setAttribute('data-height', String(height))
      const iframe = document.createElement('iframe')
      iframe.setAttribute('src', getYoutubeEmbedSrc(id))
      iframe.setAttribute('frameborder', '0')
      iframe.setAttribute('allowfullscreen', 'true')
      iframe.setAttribute('width', String(width))
      iframe.setAttribute('height', String(height))
      iframe.setAttribute(
        'allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      )
      iframe.setAttribute('title', 'YouTube video')
      iframe.className = 'ql-embed-youtube-iframe'
      iframe.style.width = '100%'
      iframe.style.maxWidth = `${width}px`
      iframe.style.aspectRatio = `${width} / ${height}`
      iframe.style.height = 'auto'
      iframe.style.border = '0'
      node.appendChild(iframe)

      node.addEventListener('click', event => {
        const mouseEvent = event as MouseEvent
        const rect = node.getBoundingClientRect()
        const withinX =
          mouseEvent.clientX >=
            rect.right -
              YOUTUBE_EDIT_HOTSPOT_OFFSET -
              YOUTUBE_EDIT_HOTSPOT_SIZE &&
          mouseEvent.clientX <= rect.right - YOUTUBE_EDIT_HOTSPOT_OFFSET
        const withinY =
          mouseEvent.clientY >= rect.top + YOUTUBE_EDIT_HOTSPOT_OFFSET &&
          mouseEvent.clientY <=
            rect.top + YOUTUBE_EDIT_HOTSPOT_OFFSET + YOUTUBE_EDIT_HOTSPOT_SIZE

        if (!withinX || !withinY) return
        event.preventDefault()
        event.stopPropagation()
        if (typeof window === 'undefined') return
        window.dispatchEvent(
          new CustomEvent<YoutubeEditEventDetail>(YOUTUBE_EDIT_EVENT, {
            detail: {
              node,
              url: rawUrl,
              width,
              height,
            },
          }),
        )
      })
      return node
    }

    static value(node: HTMLDivElement) {
      const url =
        node.getAttribute('data-youtube-url') ||
        node.querySelector('iframe')?.getAttribute('src') ||
        ''
      return {
        url,
        width: toDimension(
          node.getAttribute('data-width'),
          DEFAULT_YOUTUBE_IFRAME_WIDTH,
        ),
        height: toDimension(
          node.getAttribute('data-height'),
          DEFAULT_YOUTUBE_IFRAME_HEIGHT,
        ),
      }
    }
  }

  class TwitterEmbed extends BlockEmbed {
    static blotName = 'twitter'
    static tagName = 'div'
    static className = 'ql-embed-twitter'

    static create(value: string) {
      const node = super.create() as HTMLDivElement
      const normalizedUrl = normalizeTwitterUrl(value)
      if (!normalizedUrl) return node
      const id = parseTwitterId(normalizedUrl)
      if (!id) return node
      node.setAttribute('data-tweet-id', id)
      node.setAttribute('data-tweet-url', normalizedUrl)

      const quote = document.createElement('blockquote')
      quote.className = 'twitter-tweet'
      quote.setAttribute('data-conversation', 'none')
      quote.setAttribute('data-theme', 'light')

      const link = document.createElement('a')
      link.href = normalizedUrl
      link.textContent = normalizedUrl
      quote.appendChild(link)
      node.appendChild(quote)

      const fallbackLink = document.createElement('a')
      fallbackLink.href = normalizedUrl
      fallbackLink.target = '_blank'
      fallbackLink.rel = 'noopener noreferrer'
      fallbackLink.className = 'ql-embed-twitter-fallback'
      fallbackLink.textContent = 'Open this post on X'
      node.appendChild(fallbackLink)

      renderTwitterWidget(node)

      return node
    }

    static value(node: HTMLDivElement) {
      return (
        node.getAttribute('data-tweet-url') ||
        node.getAttribute('data-tweet-id') ||
        ''
      )
    }
  }

  class FigmaEmbed extends BlockEmbed {
    static blotName = 'figma'
    static tagName = 'div'
    static className = 'ql-embed-figma'

    static create(value: string) {
      const node = super.create() as HTMLDivElement
      const url = typeof value === 'string' && value.trim() ? value.trim() : ''
      if (!url) return node

      const normalizedUrl = parseEmbedUrl('figma', url)
      if (!normalizedUrl) return node

      const embedUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(normalizedUrl)}`
      node.setAttribute('data-figma-url', normalizedUrl)
      const iframe = document.createElement('iframe')
      iframe.setAttribute('src', embedUrl)
      iframe.setAttribute('frameborder', '0')
      iframe.setAttribute('allowfullscreen', 'true')
      iframe.setAttribute('title', 'Figma document')
      iframe.className = 'ql-embed-figma-iframe'
      node.appendChild(iframe)
      return node
    }

    static value(node: HTMLDivElement) {
      return (
        node.getAttribute('data-figma-url') ||
        node.querySelector('iframe')?.getAttribute('src') ||
        ''
      )
    }
  }

  Quill.register(YoutubeEmbed)
  Quill.register(TwitterEmbed)
  Quill.register(FigmaEmbed)
}

/**
 * The names of the embed blots.
 */
export const EMBED_BLOT_NAMES = ['youtube', 'twitter', 'figma'] as const
export type EmbedType = (typeof EMBED_BLOT_NAMES)[number]

/**
 * Parse the embed URL.
 * @param type - The type of the embed.
 * @param url - The URL to parse.
 * @returns The parsed URL.
 */
export function parseEmbedUrl(type: EmbedType, url: string): string | null {
  switch (type) {
    case 'youtube':
      return parseYouTubeUrl(url)
    case 'twitter':
      return normalizeTwitterUrl(url)
    case 'figma':
      return parseFigmaUrl(url)
    default:
      return null
  }
}
