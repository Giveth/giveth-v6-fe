import QfApplyGatePageClient from './QfApplyGatePageClient'

type PageProps = {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>
}

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0]
  return v
}

export default async function QfApplyGatePage({ searchParams }: PageProps) {
  const sp = await searchParams

  const project = first(sp?.project) || first(sp?.p)
  const roundIdRaw = first(sp?.roundId) || first(sp?.r)
  const roundSlug = first(sp?.round) || first(sp?.roundSlug)

  const roundId =
    roundIdRaw && /^\d+$/.test(roundIdRaw) ? Number(roundIdRaw) : undefined

  return (
    <QfApplyGatePageClient
      initialProject={project}
      initialRoundId={roundId}
      initialRoundSlug={roundSlug}
    />
  )
}
