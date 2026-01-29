export type ParsedProjectRef = { type: 'slug'; slug: string }

export function parseGivethProjectRef(rawInput: string): ParsedProjectRef {
  const raw = rawInput.trim()
  if (!raw) {
    throw new Error('Please enter a Giveth project link or project slug.')
  }

  // Reject numeric-only input (we intentionally don't support project-by-ID here).
  if (/^\d+$/.test(raw)) {
    throw new Error(
      'Please paste your project link or slug (project ID is not supported here).',
    )
  }

  // URL input.
  if (/^https?:\/\//i.test(raw)) {
    let url: URL
    try {
      url = new URL(raw)
    } catch {
      throw new Error('Invalid project link. Please paste a valid URL.')
    }

    const segments = url.pathname.split('/').filter(Boolean)
    const projectIdx = segments.findIndex(
      s => s === 'project' || s === 'projects',
    )
    const next = projectIdx >= 0 ? segments[projectIdx + 1] : segments[0]

    if (!next) {
      throw new Error(
        'Invalid project link. Please paste a link like https://giveth.io/project/<slug>.',
      )
    }

    return { type: 'slug', slug: next }
  }

  // Non-URL, non-numeric: assume slug.
  return { type: 'slug', slug: raw }
}

export function getNetworkLabel(networkId: number): string {
  // Keep this helper generic; callers can map to richer metadata (icons, etc.)
  return `Network ${networkId}`
}
