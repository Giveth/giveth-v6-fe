import DOMPurify from 'isomorphic-dompurify'

const URL_REGEX = /(https?:\/\/[^\s<>"')]+)/g
const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/
const YOUTUBE_WIDTH_PARAM = 'givethW'
const YOUTUBE_HEIGHT_PARAM = 'givethH'
const DEFAULT_YOUTUBE_WIDTH = 500
const DEFAULT_YOUTUBE_HEIGHT = 300

/**
 * Decodes escaped ampersands in URL-like strings.
 * This is required because stored HTML often contains `&amp;` query delimiters.
 *
 * @param url - Raw or HTML-escaped URL string.
 * @returns URL string normalized for `URL` parsing.
 */
function normalizeUrlInput(url: string): string {
  return url
    .replaceAll('&amp;', '&')
    .replaceAll('&#38;', '&')
    .replaceAll('&#x26;', '&')
}

type TwitterWindow = Window & {
  twttr?: {
    widgets?: {
      load: (element?: HTMLElement) => void
    }
  }
}

/**
 * Escapes text for safe HTML insertion.
 *
 * @param value - Raw text value.
 * @returns HTML-escaped string.
 */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/**
 * Normalizes Twitter/X embed URLs into canonical status URLs when possible.
 * It handles `platform.twitter.com/embed/Tweet.html` variants and nested URLs.
 *
 * @param url - Any Twitter/X-related URL.
 * @returns Canonical status URL when recognized, otherwise the original input.
 */
function normalizeTwitterEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    const path = parsed.pathname.toLowerCase()
    const decodedWholeUrl = decodeURIComponent(url)

    if (host === 'platform.twitter.com' && path.includes('/embed/tweet.html')) {
      const embeddedUrl = parsed.searchParams.get('url')
      if (embeddedUrl) {
        try {
          return normalizeTwitterEmbedUrl(decodeURIComponent(embeddedUrl))
        } catch {
          return normalizeTwitterEmbedUrl(embeddedUrl)
        }
      }

      const id = parsed.searchParams.get('id')
      if (id && /^\d+$/.test(id)) {
        return `https://twitter.com/i/status/${id}`
      }

      const decodedStatus = decodedWholeUrl.match(
        /(?:twitter\.com|x\.com)\/([^/\s]+)\/status\/(\d+)/i,
      )
      if (decodedStatus) {
        return `https://twitter.com/${decodedStatus[1]}/status/${decodedStatus[2]}`
      }
    }
  } catch {
    return url
  }

  return url
}

/**
 * Applies provider-specific URL normalization before downstream processing.
 *
 * @param url - Raw URL candidate.
 * @returns Normalized URL string.
 */
function normalizeEmbedUrl(url: string): string {
  return normalizeTwitterEmbedUrl(url)
}

/**
 * Normalizes URLs inside HTML attributes and plain URL text nodes.
 *
 * @param html - HTML content that may include links.
 * @returns HTML content with normalized URL values.
 */
function normalizeLinksInHtml(html: string): string {
  let normalized = html.replace(
    /(href\s*=\s*")(https?:\/\/[^"]+)(")/gi,
    (_, prefix: string, url: string, suffix: string) =>
      `${prefix}${normalizeEmbedUrl(url)}${suffix}`,
  )

  normalized = normalized.replace(
    /(>)(https?:\/\/[^<]+)(<)/gi,
    (_, prefix: string, url: string, suffix: string) =>
      `${prefix}${escapeHtml(normalizeEmbedUrl(url))}${suffix}`,
  )

  return normalized
}

/**
 * Extracts a tweet id from supported Twitter/X URL formats.
 *
 * @param url - Twitter/X URL candidate.
 * @returns Tweet id when recognized, otherwise `null`.
 */
function toTwitterTweetId(url: string): string | null {
  try {
    const parsed = new URL(normalizeTwitterEmbedUrl(url.trim()))
    const host = parsed.hostname.toLowerCase()
    if (
      host !== 'twitter.com' &&
      host !== 'www.twitter.com' &&
      host !== 'x.com' &&
      host !== 'www.x.com'
    ) {
      return null
    }

    const parts = parsed.pathname.split('/').filter(Boolean)
    if (
      parts.length >= 3 &&
      parts[1] === 'status' &&
      /^\d+$/.test(parts[2]) &&
      /^[A-Za-z0-9_]{1,15}$/.test(parts[0])
    ) {
      return parts[2]
    }

    if (
      parts.length >= 3 &&
      parts[0] === 'i' &&
      parts[1] === 'status' &&
      /^\d+$/.test(parts[2])
    ) {
      return parts[2]
    }
  } catch {
    return null
  }

  return null
}

/**
 * Converts supported YouTube URLs to canonical embed URLs.
 *
 * @param url - YouTube URL candidate (watch, shorts, embed, youtu.be).
 * @returns Canonical embed URL or `null` when not recognized.
 */
function toYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(normalizeUrlInput(url).trim())
    const host = parsed.hostname.toLowerCase()
    const pathParts = parsed.pathname.split('/').filter(Boolean)

    let videoId = ''
    if (host === 'youtu.be') {
      videoId = pathParts[0] ?? ''
    } else if (
      host === 'youtube.com' ||
      host === 'www.youtube.com' ||
      host === 'm.youtube.com'
    ) {
      if (pathParts[0] === 'watch') {
        videoId = parsed.searchParams.get('v') ?? ''
      } else if (pathParts[0] === 'embed') {
        videoId = pathParts[1] ?? ''
      } else if (pathParts[0] === 'shorts') {
        videoId = pathParts[1] ?? ''
      }
    }

    if (!YOUTUBE_ID_REGEX.test(videoId)) return null
    return `https://www.youtube.com/embed/${videoId}`
  } catch {
    return null
  }
}

/**
 * Parses and clamps a dimension value.
 *
 * @param value - Raw width/height value.
 * @returns Positive integer in range `(0, 3000]` or `undefined`.
 */
function parseDimension(value: string | null | undefined): number | undefined {
  if (!value) return undefined
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined
  return Math.min(parsed, 3000)
}

/**
 * Reads optional persisted YouTube dimensions from URL query params.
 *
 * @param url - Stored YouTube link that may contain `givethW/givethH`.
 * @returns Parsed width/height when available.
 */
function readYoutubeDimensionsFromUrl(url: string): {
  width?: number
  height?: number
} {
  try {
    const parsed = new URL(normalizeUrlInput(url).trim())
    const width =
      parseDimension(parsed.searchParams.get(YOUTUBE_WIDTH_PARAM)) ??
      parseDimension(parsed.searchParams.get(`amp;${YOUTUBE_WIDTH_PARAM}`))
    const height =
      parseDimension(parsed.searchParams.get(YOUTUBE_HEIGHT_PARAM)) ??
      parseDimension(parsed.searchParams.get(`amp;${YOUTUBE_HEIGHT_PARAM}`))

    return {
      width,
      height,
    }
  } catch {
    return {}
  }
}

/**
 * Persists YouTube dimensions into URL query params.
 * Existing values are replaced; invalid values are removed.
 *
 * @param url - Base YouTube URL.
 * @param width - Optional width value.
 * @param height - Optional height value.
 * @returns URL string with normalized dimension params.
 */
function attachYoutubeDimensionsToUrl(
  url: string,
  width?: number,
  height?: number,
): string {
  try {
    const parsed = new URL(normalizeUrlInput(url).trim())
    const safeWidth = parseDimension(width ? String(width) : undefined)
    const safeHeight = parseDimension(height ? String(height) : undefined)

    if (safeWidth) {
      parsed.searchParams.set(YOUTUBE_WIDTH_PARAM, String(safeWidth))
    } else {
      parsed.searchParams.delete(YOUTUBE_WIDTH_PARAM)
    }

    if (safeHeight) {
      parsed.searchParams.set(YOUTUBE_HEIGHT_PARAM, String(safeHeight))
    } else {
      parsed.searchParams.delete(YOUTUBE_HEIGHT_PARAM)
    }

    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * Normalizes Figma URLs (including nested embed URLs) to source file links.
 *
 * @param url - Figma URL candidate.
 * @returns Canonical Figma file/proto URL or `null`.
 */
function toFigmaUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.toLowerCase()
    const isFigmaHost = host === 'figma.com' || host.endsWith('.figma.com')
    if (!isFigmaHost) return null

    if (parsed.pathname.startsWith('/embed')) {
      const nestedUrl = parsed.searchParams.get('url')
      if (!nestedUrl) return null
      try {
        return toFigmaUrl(decodeURIComponent(nestedUrl))
      } catch {
        return toFigmaUrl(nestedUrl)
      }
    }

    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Builds a Figma embed URL from a canonical Figma source URL.
 *
 * @param url - Figma source URL candidate.
 * @returns Figma embed URL or `null` when input is invalid.
 */
function toFigmaEmbedUrl(url: string): string | null {
  const figmaUrl = toFigmaUrl(url)
  if (!figmaUrl) return null
  return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(figmaUrl)}`
}

/**
 * Builds responsive iframe embed markup used in read-only rendering.
 *
 * @param src - Iframe source URL.
 * @param title - Accessible iframe title.
 * @param width - Optional preferred width.
 * @param height - Optional preferred height.
 * @returns HTML snippet for a video-style embed block.
 */
function buildVideoEmbed(
  src: string,
  title: string,
  width?: number,
  height?: number,
): string {
  const safeSrc = escapeHtml(src)
  const safeTitle = escapeHtml(title)
  const safeWidth = parseDimension(width ? String(width) : undefined)
  const safeHeight = parseDimension(height ? String(height) : undefined)
  const wrapperStyle =
    safeWidth && safeHeight
      ? ` style="max-width:${safeWidth}px;padding-bottom:${((safeHeight / safeWidth) * 100).toFixed(3)}%;"`
      : ''
  const iframeStyle =
    safeWidth && safeHeight
      ? ` style="max-width:${safeWidth}px;aspect-ratio:${safeWidth}/${safeHeight};"`
      : ''
  return `<div class="ql-video-wrapper"${wrapperStyle}><iframe class="ql-video" src="${safeSrc}" frameborder="0" allowfullscreen="true" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="${safeTitle}"${iframeStyle}></iframe></div>`
}

/**
 * Extracts a YouTube video id from any supported YouTube URL.
 *
 * @param url - YouTube URL candidate.
 * @returns Video id or `null`.
 */
function toYoutubeVideoId(url: string): string | null {
  const embedUrl = toYoutubeEmbedUrl(url)
  if (!embedUrl) return null
  const match = embedUrl.match(/\/embed\/([A-Za-z0-9_-]{11})/i)
  return match?.[1] ?? null
}

/**
 * Builds editor blot HTML for a Twitter embed.
 *
 * @param tweetId - Numeric tweet identifier.
 * @returns Quill embed block HTML.
 */
function buildTwitterEditorEmbed(tweetId: string): string {
  const tweetUrl = `https://twitter.com/i/status/${tweetId}`
  return `<div class="ql-embed-twitter" data-tweet-id="${tweetId}" data-tweet-url="${escapeHtml(tweetUrl)}"></div>`
}

/**
 * Builds editor blot HTML for a YouTube embed with dimensions.
 *
 * @param videoId - YouTube video identifier.
 * @param rawUrl - Original user-provided YouTube URL.
 * @param width - Preferred width value.
 * @param height - Preferred height value.
 * @returns Quill embed block HTML.
 */
function buildYoutubeEditorEmbed(
  videoId: string,
  rawUrl: string,
  width = DEFAULT_YOUTUBE_WIDTH,
  height = DEFAULT_YOUTUBE_HEIGHT,
): string {
  return `<div class="ql-embed-youtube" data-video-id="${videoId}" data-youtube-url="${escapeHtml(rawUrl)}" data-width="${width}" data-height="${height}"></div>`
}

/**
 * Builds editor blot HTML for a Figma embed.
 *
 * @param figmaUrl - Canonical Figma source URL.
 * @returns Quill embed block HTML.
 */
function buildFigmaEditorEmbed(figmaUrl: string): string {
  return `<div class="ql-embed-figma" data-figma-url="${escapeHtml(figmaUrl)}"></div>`
}

/**
 * Converts a raw URL into editor-specific embed block HTML.
 *
 * @param url - URL candidate from editor content.
 * @returns Matching embed block HTML or `null`.
 */
function maybeEditorEmbedForUrl(url: string): string | null {
  const tweetId = toTwitterTweetId(url)
  if (tweetId) return buildTwitterEditorEmbed(tweetId)

  const youtubeId = toYoutubeVideoId(url)
  if (youtubeId) {
    const { width, height } = readYoutubeDimensionsFromUrl(url)
    return buildYoutubeEditorEmbed(
      youtubeId,
      url,
      width ?? DEFAULT_YOUTUBE_WIDTH,
      height ?? DEFAULT_YOUTUBE_HEIGHT,
    )
  }

  const figmaUrl = toFigmaUrl(url)
  if (figmaUrl) return buildFigmaEditorEmbed(figmaUrl)

  return null
}

/**
 * Converts a raw URL into read-only embed HTML.
 *
 * @param url - URL candidate from stored content.
 * @returns Matching read-only embed HTML or `null`.
 */
function maybeEmbedForUrl(url: string): string | null {
  const tweetId = toTwitterTweetId(url)
  if (tweetId) {
    const tweetUrl = `https://twitter.com/i/status/${tweetId}`
    return `<blockquote class="twitter-tweet"><a class="ql-embed-twitter-fallback" href="${escapeHtml(tweetUrl)}"></a></blockquote><p><a class="ql-embed-twitter-fallback" href="${escapeHtml(tweetUrl)}" target="_blank" rel="noopener noreferrer">Open this post on X</a></p>`
  }

  const youtubeEmbedUrl = toYoutubeEmbedUrl(url)
  if (youtubeEmbedUrl) {
    const { width, height } = readYoutubeDimensionsFromUrl(url)
    return buildVideoEmbed(
      youtubeEmbedUrl,
      'Embedded YouTube video',
      width,
      height,
    )
  }

  const figmaEmbedUrl = toFigmaEmbedUrl(url)
  if (figmaEmbedUrl) {
    return buildVideoEmbed(figmaEmbedUrl, 'Embedded Figma file')
  }

  return null
}

/**
 * Safely parses a tweet id from an optional URL value.
 *
 * @param url - Optional Twitter/X URL.
 * @returns Tweet id or `null`.
 */
function parseTwitterIdFromUrl(url?: string | null): string | null {
  if (!url) return null
  return toTwitterTweetId(url)
}

/**
 * Extracts tweet id from various Twitter embed node shapes.
 * Supports explicit data attributes and iframe query params.
 *
 * @param node - DOM element representing an embed block.
 * @returns Tweet id or `null` when unavailable.
 */
function parseTwitterIdFromEmbedNode(node: Element): string | null {
  const byId = node.getAttribute('data-tweet-id')
  if (byId && /^\d+$/.test(byId)) return byId

  const byUrl = parseTwitterIdFromUrl(node.getAttribute('data-tweet-url'))
  if (byUrl) return byUrl

  const iframeSrc = node.querySelector('iframe')?.getAttribute('src')
  if (iframeSrc) {
    try {
      const srcUrl = new URL(iframeSrc)
      const idFromQuery = srcUrl.searchParams.get('id')
      if (idFromQuery && /^\d+$/.test(idFromQuery)) return idFromQuery
    } catch {
      // ignore
    }
  }

  return null
}

/**
 * Extracts canonical YouTube embed URL from existing embed nodes.
 *
 * @param node - DOM element representing a YouTube embed block.
 * @returns Canonical YouTube embed URL or `null`.
 */
function parseYoutubeEmbedFromNode(node: Element): string | null {
  const iframeSrc = node.querySelector('iframe')?.getAttribute('src')
  if (iframeSrc && toYoutubeEmbedUrl(iframeSrc)) {
    return toYoutubeEmbedUrl(iframeSrc)
  }

  const rawUrl = node.getAttribute('data-youtube-url')
  if (rawUrl) {
    const embedUrl = toYoutubeEmbedUrl(rawUrl)
    if (embedUrl) return embedUrl
  }

  const videoId = node.getAttribute('data-video-id')
  if (videoId && YOUTUBE_ID_REGEX.test(videoId)) {
    return `https://www.youtube.com/embed/${videoId}`
  }

  return null
}

/**
 * Reads width/height metadata from a YouTube embed node.
 *
 * @param node - DOM element representing a YouTube embed block.
 * @returns Parsed dimension object.
 */
function parseYoutubeDimensionsFromEmbedNode(node: Element): {
  width?: number
  height?: number
} {
  const width =
    parseDimension(node.getAttribute('data-width')) ??
    parseDimension(node.querySelector('iframe')?.getAttribute('width'))
  const height =
    parseDimension(node.getAttribute('data-height')) ??
    parseDimension(node.querySelector('iframe')?.getAttribute('height'))

  return { width, height }
}

/**
 * Extracts canonical Figma source URL from existing embed nodes.
 *
 * @param node - DOM element representing a Figma embed block.
 * @returns Canonical Figma URL or `null`.
 */
function parseFigmaUrlFromEmbedNode(node: Element): string | null {
  const rawUrl = node.getAttribute('data-figma-url')
  if (rawUrl) {
    const normalized = toFigmaUrl(rawUrl)
    if (normalized) return normalized
  }

  const iframeSrc = node.querySelector('iframe')?.getAttribute('src')
  if (iframeSrc) {
    const normalized = toFigmaUrl(iframeSrc)
    if (normalized) return normalized
  }

  return null
}

/**
 * Converts stored Quill custom embed blocks into read-only HTML embeds.
 *
 * @param html - Stored HTML content.
 * @returns HTML with `.ql-embed-*` blocks transformed for read-only rendering.
 */
function normalizeQuillEmbedBlocks(html: string): string {
  if (typeof window === 'undefined') return html

  const parser = new window.DOMParser()
  const doc = parser.parseFromString(
    `<div id="__root__">${html}</div>`,
    'text/html',
  )
  const root = doc.getElementById('__root__')
  if (!root) return html

  const twitterEmbeds = Array.from(root.querySelectorAll('.ql-embed-twitter'))
  for (const embed of twitterEmbeds) {
    const tweetId = parseTwitterIdFromEmbedNode(embed)
    if (!tweetId) continue
    const replacement = maybeEmbedForUrl(
      `https://twitter.com/i/status/${tweetId}`,
    )
    if (!replacement) continue
    embed.outerHTML = replacement
  }

  const youtubeEmbeds = Array.from(root.querySelectorAll('.ql-embed-youtube'))
  for (const embed of youtubeEmbeds) {
    const youtubeUrl = parseYoutubeEmbedFromNode(embed)
    if (!youtubeUrl) continue
    const { width, height } = parseYoutubeDimensionsFromEmbedNode(embed)
    const replacement = buildVideoEmbed(
      youtubeUrl,
      'Embedded YouTube video',
      width,
      height,
    )
    embed.outerHTML = replacement
  }

  const figmaEmbeds = Array.from(root.querySelectorAll('.ql-embed-figma'))
  for (const embed of figmaEmbeds) {
    const figmaUrl = parseFigmaUrlFromEmbedNode(embed)
    if (!figmaUrl) continue
    const replacement = maybeEmbedForUrl(figmaUrl)
    if (!replacement) continue
    embed.outerHTML = replacement
  }

  return root.innerHTML
}

/**
 * Replaces standalone URL paragraphs with read-only embed markup.
 * Works both in browser (DOMParser path) and in SSR-safe regex fallback.
 *
 * @param html - HTML content to transform.
 * @returns HTML with eligible link-only paragraphs replaced by embeds.
 */
function replaceStandaloneLinksWithEmbeds(html: string): string {
  if (typeof window !== 'undefined') {
    const parser = new window.DOMParser()
    const doc = parser.parseFromString(
      `<div id="__readonly_embed_root__">${html}</div>`,
      'text/html',
    )
    const root = doc.getElementById('__readonly_embed_root__')
    if (!root) return html

    const paragraphs = Array.from(root.querySelectorAll('p'))
    for (const paragraph of paragraphs) {
      const paragraphText = (paragraph.textContent ?? '')
        .replace(/\u00a0/g, ' ')
        .trim()
      let candidateUrl: string | null = null

      const links = Array.from(paragraph.querySelectorAll('a[href]'))
      if (links.length === 1) {
        const clone = paragraph.cloneNode(true) as HTMLParagraphElement
        clone.querySelectorAll('a[href]').forEach(linkNode => {
          linkNode.remove()
        })
        const remainingText = (clone.textContent ?? '')
          .replace(/\u00a0/g, ' ')
          .trim()
        if (!remainingText) {
          candidateUrl = links[0]?.getAttribute('href') ?? null
        }
      } else if (/^https?:\/\/\S+$/i.test(paragraphText)) {
        candidateUrl = paragraphText
      }

      if (!candidateUrl && /^https?:\/\/\S+$/i.test(paragraphText)) {
        candidateUrl = paragraphText
      }

      if (!candidateUrl) continue
      const embed = maybeEmbedForUrl(candidateUrl)
      if (!embed) continue
      paragraph.outerHTML = embed
    }

    return root.innerHTML
  }

  let output = html

  output = output.replace(
    /<p>\s*<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>\s*<\/p>/gi,
    (match: string, href: string) => maybeEmbedForUrl(href) ?? match,
  )

  output = output.replace(
    /<p>\s*(https?:\/\/[^<\s]+)\s*<\/p>/gi,
    (match: string, url: string) => maybeEmbedForUrl(url) ?? match,
  )

  return output
}

/**
 * Replaces standalone URL paragraphs with editor embed blot markup.
 *
 * @param html - HTML content to transform.
 * @returns HTML with eligible link-only paragraphs replaced by `.ql-embed-*` blocks.
 */
function replaceStandaloneLinksWithEditorEmbeds(html: string): string {
  let output = html

  output = output.replace(
    /<p>\s*<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>\s*<\/p>/gi,
    (match: string, href: string) => maybeEditorEmbedForUrl(href) ?? match,
  )

  output = output.replace(
    /<p>\s*(https?:\/\/[^<\s]+)\s*<\/p>/gi,
    (match: string, url: string) => maybeEditorEmbedForUrl(url) ?? match,
  )

  output = output.replace(
    /<blockquote[^>]*class="[^"]*twitter-tweet[^"]*"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>[\s\S]*?<\/blockquote>\s*(?:<p>\s*<a[^>]*>Open this post on X<\/a>\s*<\/p>)?/gi,
    (match: string, href: string) => maybeEditorEmbedForUrl(href) ?? match,
  )

  return output
}

/**
 * Linkifies plain text while preserving non-link text segments.
 *
 * @param text - Plain text input.
 * @returns HTML string with URLs converted to anchors.
 */
function linkifyPlainText(text: string): string {
  let html = ''
  let lastIndex = 0

  for (const match of text.matchAll(URL_REGEX)) {
    const matchedUrl = match[0]
    const start = match.index ?? 0
    html += escapeHtml(text.slice(lastIndex, start))
    const href = normalizeTwitterEmbedUrl(matchedUrl)
    html += `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(matchedUrl)}</a>`
    lastIndex = start + matchedUrl.length
  }

  html += escapeHtml(text.slice(lastIndex))
  return html
}

const READONLY_ALLOWED_TAGS = [
  'a',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'iframe',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'span',
  'strong',
  'sub',
  'sup',
  'u',
  'ul',
] as const

const READONLY_ALLOWED_ATTR = [
  'allow',
  'allowfullscreen',
  'alt',
  'class',
  'frameborder',
  'height',
  'href',
  'loading',
  'rel',
  'src',
  'style',
  'target',
  'title',
  'width',
] as const

let hasReadonlyStyleHook = false

function isReadonlyEmbedStyleElement(node: Element): boolean {
  const tagName = node.tagName.toLowerCase()
  const classes = node.className?.toString().split(/\s+/).filter(Boolean) ?? []
  if (tagName === 'div') return classes.includes('ql-video-wrapper')
  if (tagName === 'iframe') return classes.includes('ql-video')
  return false
}

function sanitizeReadonlyEmbedStyle(styleValue: string): string {
  const declarations = styleValue.split(';')
  const sanitized: string[] = []

  for (const declaration of declarations) {
    const separatorIndex = declaration.indexOf(':')
    if (separatorIndex <= 0) continue

    const property = declaration.slice(0, separatorIndex).trim().toLowerCase()
    const value = declaration
      .slice(separatorIndex + 1)
      .trim()
      .toLowerCase()

    if (!value) continue

    if (
      (property === 'max-width' || property === 'width') &&
      (/^\d{1,4}px$/.test(value) || /^\d{1,3}(?:\.\d+)?%$/.test(value))
    ) {
      sanitized.push(`${property}:${value}`)
      continue
    }

    if (
      property === 'height' &&
      (value === 'auto' ||
        /^\d{1,4}px$/.test(value) ||
        /^\d{1,3}(?:\.\d+)?%$/.test(value))
    ) {
      sanitized.push(`${property}:${value}`)
      continue
    }

    if (property === 'padding-bottom' && /^\d{1,3}(?:\.\d+)?%$/.test(value)) {
      sanitized.push(`${property}:${value}`)
      continue
    }

    if (property === 'aspect-ratio' && /^\d{1,4}\s*\/\s*\d{1,4}$/.test(value)) {
      sanitized.push(`${property}:${value.replace(/\s+/g, '')}`)
    }
  }

  return sanitized.join(';')
}

function ensureReadonlyStyleHook() {
  if (hasReadonlyStyleHook) return

  // Keep sizing metadata emitted by buildVideoEmbed while stripping other inline CSS.
  DOMPurify.addHook('uponSanitizeAttribute', (currentNode, hookEvent) => {
    if (hookEvent.attrName !== 'style') return

    const node = currentNode as Element
    if (!node || typeof node.getAttribute !== 'function') {
      hookEvent.keepAttr = false
      return
    }

    if (!isReadonlyEmbedStyleElement(node)) {
      hookEvent.keepAttr = false
      return
    }

    const sanitizedStyle = sanitizeReadonlyEmbedStyle(hookEvent.attrValue ?? '')
    if (!sanitizedStyle) {
      hookEvent.keepAttr = false
      return
    }

    hookEvent.attrValue = sanitizedStyle
    hookEvent.keepAttr = true
  })

  hasReadonlyStyleHook = true
}

function sanitizeReadonlyHtml(html: string): string {
  ensureReadonlyStyleHook()

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...READONLY_ALLOWED_TAGS],
    ALLOWED_ATTR: [...READONLY_ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|#)/i,
  }) as string
}

/**
 * Formats stored content for read-only display.
 * It normalizes links, converts known embed links, and preserves plain text.
 *
 * @param content - Stored project/update content.
 * @returns Read-only HTML ready for rendering.
 */
export function formatContentForReadonlyQuill(content: string): string {
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content)
  if (looksLikeHtml) {
    const formatted = replaceStandaloneLinksWithEmbeds(
      normalizeQuillEmbedBlocks(normalizeLinksInHtml(content)),
    )
    return sanitizeReadonlyHtml(formatted)
  }

  const linkedText = linkifyPlainText(content)
  const formatted = replaceStandaloneLinksWithEmbeds(
    `<p>${linkedText.replaceAll('\n', '<br/>')}</p>`,
  )
  return sanitizeReadonlyHtml(formatted)
}

/**
 * Formats stored content for editor load.
 * Converts standalone links into editor embed blots where supported.
 *
 * @param content - Stored project/update content.
 * @returns Editor-friendly HTML.
 */
export function formatContentForEditorLoad(content: string): string {
  if (!content.trim()) return content

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content)
  if (looksLikeHtml) {
    return replaceStandaloneLinksWithEditorEmbeds(normalizeLinksInHtml(content))
  }

  return content
    .split('\n')
    .map(line => {
      const trimmed = line.trim()
      const embed = maybeEditorEmbedForUrl(trimmed)
      if (embed) return embed
      if (!trimmed) return '<p><br/></p>'
      return `<p>${escapeHtml(line)}</p>`
    })
    .join('')
}

/**
 * Triggers Twitter widgets hydration for rendered tweet blockquotes.
 *
 * @param target - Optional DOM subtree root for widget parsing.
 */
export function loadTwitterWidgets(target?: HTMLElement | null) {
  if (typeof window === 'undefined') return
  const w = window as TwitterWindow
  w.twttr?.widgets?.load?.(target ?? undefined)
}

/**
 * Replaces a node with a `<p>` containing a raw URL string.
 *
 * @param node - Node to replace.
 * @param url - URL text to store inside the replacement paragraph.
 */
function replaceWithLinkParagraph(node: Element, url: string) {
  const p = node.ownerDocument.createElement('p')
  p.textContent = url
  node.replaceWith(p)
}

/**
 * Converts editor HTML into storage-safe content.
 * Custom embeds and widget markup are reduced to plain links for persistence.
 *
 * @param content - Editor HTML content.
 * @returns Persistable HTML with links instead of custom embed blocks.
 */
export function formatContentForStorage(content: string): string {
  if (!content.trim()) return content

  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(content)
  if (!looksLikeHtml) return content.trim()
  if (typeof window === 'undefined') return content

  const parser = new window.DOMParser()
  const doc = parser.parseFromString(
    `<div id="__storage_root__">${content}</div>`,
    'text/html',
  )
  const root = doc.getElementById('__storage_root__')
  if (!root) return content

  const twitterEmbeds = Array.from(root.querySelectorAll('.ql-embed-twitter'))
  for (const embed of twitterEmbeds) {
    const tweetId = parseTwitterIdFromEmbedNode(embed)
    if (!tweetId) continue
    replaceWithLinkParagraph(embed, `https://twitter.com/i/status/${tweetId}`)
  }

  const youtubeEmbeds = Array.from(root.querySelectorAll('.ql-embed-youtube'))
  for (const embed of youtubeEmbeds) {
    const rawUrl =
      embed.getAttribute('data-youtube-url') || parseYoutubeEmbedFromNode(embed)
    if (!rawUrl) continue
    const width = parseDimension(embed.getAttribute('data-width'))
    const height = parseDimension(embed.getAttribute('data-height'))
    replaceWithLinkParagraph(
      embed,
      attachYoutubeDimensionsToUrl(rawUrl, width, height),
    )
  }

  const figmaEmbeds = Array.from(root.querySelectorAll('.ql-embed-figma'))
  for (const embed of figmaEmbeds) {
    const figmaUrl = parseFigmaUrlFromEmbedNode(embed)
    if (!figmaUrl) continue
    replaceWithLinkParagraph(embed, figmaUrl)
  }

  const twitterBlockquotes = Array.from(
    root.querySelectorAll('blockquote.twitter-tweet'),
  )
  for (const blockquote of twitterBlockquotes) {
    const href = blockquote.querySelector('a[href]')?.getAttribute('href')
    const tweetId = href ? toTwitterTweetId(href) : null
    if (!tweetId) continue
    replaceWithLinkParagraph(
      blockquote,
      `https://twitter.com/i/status/${tweetId}`,
    )
  }

  const twitterIframes = Array.from(
    root.querySelectorAll(
      'iframe[src*="platform.twitter.com/embed/Tweet.html"]',
    ),
  )
  for (const iframe of twitterIframes) {
    const src = iframe.getAttribute('src')
    if (!src) continue
    try {
      const parsed = new URL(src)
      const id = parsed.searchParams.get('id')
      if (!id || !/^\d+$/.test(id)) continue
      const replaceTarget =
        iframe.closest('.ql-video-wrapper') || iframe.closest('div') || iframe
      if (replaceTarget instanceof Element) {
        replaceWithLinkParagraph(
          replaceTarget,
          `https://twitter.com/i/status/${id}`,
        )
      }
    } catch {
      // ignore malformed URLs
    }
  }

  const duplicateFallbackLinks = Array.from(
    root.querySelectorAll('a.ql-embed-twitter-fallback'),
  )
  duplicateFallbackLinks.forEach(link => {
    link.remove()
  })

  return root.innerHTML.trim()
}
