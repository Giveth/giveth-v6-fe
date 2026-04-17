export type LocationSuggestion = {
  id: string
  label: string
  secondaryText?: string
  source: 'photon' | 'custom'
}

type PhotonResponse = {
  features?: Array<{
    properties?: {
      osm_id?: number | string
      osm_type?: string
      name?: string
      city?: string
      state?: string
      country?: string
    }
  }>
}

type PhotonProperties = NonNullable<
  PhotonResponse['features']
>[number]['properties']

export async function searchPhotonPlaces(
  query: string,
): Promise<LocationSuggestion[]> {
  const url = new URL('https://photon.komoot.io/api/')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '8')
  url.searchParams.set('lang', 'en')

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  })

  const payload = (await response
    .json()
    .catch(() => null)) as PhotonResponse | null

  if (!response.ok) {
    throw new Error('Could not load location suggestions.')
  }

  return dedupeSuggestions(
    (payload?.features ?? []).reduce<LocationSuggestion[]>(
      (acc, feature, index) => {
        const properties = feature.properties
        const label = buildPrimaryLabel(properties)
        if (!label) {
          return acc
        }

        acc.push({
          id:
            String(properties?.osm_id ?? '') ||
            `${properties?.osm_type ?? 'feature'}-${index}`,
          label,
          secondaryText: buildSecondaryText(properties),
          source: 'photon',
        })

        return acc
      },
      [],
    ),
  )
}

function buildPrimaryLabel(properties?: PhotonProperties) {
  const candidates = [
    properties?.name,
    properties?.city,
    properties?.state,
    properties?.country,
  ]

  return candidates.map(value => value?.trim()).find(Boolean)
}

function buildSecondaryText(properties?: PhotonProperties) {
  const primaryLabel = buildPrimaryLabel(properties)
  const parts = [
    properties?.city?.trim(),
    properties?.state?.trim(),
    properties?.country?.trim(),
  ].filter(Boolean)

  const uniqueParts = parts.filter(
    (part, index) => parts.indexOf(part) === index,
  )
  const secondary = uniqueParts.filter(part => part !== primaryLabel).join(', ')

  return secondary || undefined
}

function dedupeSuggestions(suggestions: LocationSuggestion[]) {
  const seen = new Set<string>()

  return suggestions.filter(suggestion => {
    const key = `${suggestion.label}:${suggestion.secondaryText ?? ''}`
    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}
