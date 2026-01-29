'use client'

import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUpcomingQfRounds } from '@/hooks/useUpcomingQfRounds'
import { CHAINS } from '@/lib/constants/chain'
import { env } from '@/lib/env'
import { graphQLClient } from '@/lib/graphql/client'
import { projectAddressesBySlugQuery } from '@/lib/graphql/queries'
import {
  isValidRecipientAddressForNetwork,
  parseGivethProjectRef,
} from '@/lib/helpers/qfApplicationGate'

type Props = {
  initialProject?: string
  initialRoundId?: number
  initialRoundSlug?: string
}

type GateResult =
  | {
      kind: 'ok'
      project: { id: number; title: string; slug: string }
      round: { id: number; name: string; slug: string }
      eligibleNetworks: number[]
      typeformUrl: string | null
    }
  | {
      kind: 'missing'
      project: { id: number; title: string; slug: string }
      round: { id: number; name: string; slug: string }
      eligibleNetworks: number[]
      missingNetworks: Array<{ networkId: number; networkName: string }>
    }

function buildTypeformUrl(params: {
  baseUrl: string
  projectId: number
  projectSlug: string
  roundId: number
  roundSlug: string
}): string {
  const url = new URL(params.baseUrl)
  url.searchParams.set('projectId', String(params.projectId))
  url.searchParams.set('projectSlug', params.projectSlug)
  url.searchParams.set('roundId', String(params.roundId))
  url.searchParams.set('roundSlug', params.roundSlug)
  return url.toString()
}

function getNetworkName(networkId: number): string {
  return CHAINS[networkId]?.name || `Network ${networkId}`
}

export default function QfApplyGatePageClient({
  initialProject,
  initialRoundId,
  initialRoundSlug,
}: Props) {
  const getReadableErrorMessage = (e: unknown): string => {
    const maybeGraphqlMessage = (
      e as {
        response?: { errors?: Array<{ message?: unknown }> }
      }
    )?.response?.errors?.[0]?.message

    const graphqlMessage =
      typeof maybeGraphqlMessage === 'string'
        ? maybeGraphqlMessage.trim()
        : null

    const base = graphqlMessage || (e instanceof Error ? e.message : null)
    if (!base) return 'Something went wrong.'

    // Normalize noisy "not found" variants into a short, user-friendly message.
    const lower = base.toLowerCase()
    if (lower.includes('project') && lower.includes('not found')) {
      return 'Project not found. Please check the link/slug and try again.'
    }

    return base
  }

  const {
    data: roundsData,
    isLoading: isRoundsLoading,
    error: roundsError,
  } = useUpcomingQfRounds()
  const rounds = roundsData?.qfRounds?.rounds || []

  const initialSelectedRoundId = useMemo(() => {
    if (initialRoundId) return String(initialRoundId)
    if (initialRoundSlug) {
      const match = rounds.find(r => r.slug === initialRoundSlug)
      if (match) return String(match.id)
    }
    return rounds.length === 1 ? String(rounds[0].id) : ''
  }, [initialRoundId, initialRoundSlug, rounds])

  const [projectInput, setProjectInput] = useState(initialProject || '')
  const [roundId, setRoundId] = useState<string>(initialSelectedRoundId)
  const [uiError, setUiError] = useState<string | null>(null)
  const [result, setResult] = useState<GateResult | null>(null)

  const gateMut = useMutation({
    mutationFn: async () => {
      setUiError(null)
      setResult(null)

      const selectedRound = rounds.find(r => String(r.id) === roundId)
      if (!selectedRound) {
        throw new Error('Please select a QF round.')
      }

      const eligibleNetworks = (selectedRound.eligibleNetworks || []).filter(
        (n): n is number => typeof n === 'number',
      )

      if (eligibleNetworks.length === 0) {
        throw new Error(
          'This round has no eligible networks configured. Please try a different round.',
        )
      }

      const parsed = parseGivethProjectRef(projectInput)

      const project = await graphQLClient.request(projectAddressesBySlugQuery, {
        slug: parsed.slug,
      })

      const projectEntity = project.projectAddressesBySlug

      if (!projectEntity) {
        throw new Error(
          'Project not found. Please check the link/slug and try again.',
        )
      }

      const projectId = Number(projectEntity.id)
      const projectSlug = projectEntity.slug
      const projectTitle = projectEntity.title
      const addresses = projectEntity.addresses || []

      const missingNetworks = eligibleNetworks
        .filter(networkId => {
          const addr = addresses.find(
            a => a.networkId === networkId && a.isRecipient,
          )?.address
          return !addr || !isValidRecipientAddressForNetwork(networkId, addr)
        })
        .map(networkId => ({
          networkId,
          networkName: getNetworkName(networkId),
        }))

      if (missingNetworks.length === 0) {
        const baseTypeformUrl = selectedRound.applicationTypeformUrl

        const typeformUrl = baseTypeformUrl
          ? buildTypeformUrl({
              baseUrl: baseTypeformUrl,
              projectId,
              projectSlug,
              roundId: Number(selectedRound.id),
              roundSlug: selectedRound.slug,
            })
          : null

        const ok: GateResult = {
          kind: 'ok',
          project: { id: projectId, title: projectTitle, slug: projectSlug },
          round: {
            id: Number(selectedRound.id),
            name: selectedRound.name,
            slug: selectedRound.slug,
          },
          eligibleNetworks,
          typeformUrl,
        }
        setResult(ok)
        return ok
      }

      const bad: GateResult = {
        kind: 'missing',
        project: { id: projectId, title: projectTitle, slug: projectSlug },
        round: {
          id: Number(selectedRound.id),
          name: selectedRound.name,
          slug: selectedRound.slug,
        },
        eligibleNetworks,
        missingNetworks,
      }
      setResult(bad)
      return bad
    },
    onError: (e: unknown) => {
      setUiError(getReadableErrorMessage(e))
    },
  })

  const roundOptions = useMemo(() => rounds, [rounds])

  const noUpcomingRounds =
    !isRoundsLoading && !roundsError && (roundOptions?.length || 0) === 0

  return (
    <div className="min-h-screen bg-[#f7f7f9]">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold font-adventor text-giv-deep-900">
            Apply to a QF Round
          </h1>
          <p className="mt-2 text-giv-gray-700">
            To continue, your project must have a valid recipient address set
            for <span className="font-medium">every</span> eligible network in
            the selected round.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-giv-gray-800">
                Giveth project link or slug
              </label>
              <div className="mt-2">
                <Input
                  value={projectInput}
                  onChange={e => setProjectInput(e.target.value)}
                  placeholder="https://giveth.io/project/<slug> or <slug>"
                  autoComplete="off"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-giv-gray-800">
                QF round
              </label>
              <div className="mt-2">
                <select
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  value={roundId}
                  onChange={e => setRoundId(e.target.value)}
                  disabled={
                    isRoundsLoading ||
                    !!roundsError ||
                    roundOptions.length === 0
                  }
                >
                  <option value="">
                    {isRoundsLoading
                      ? 'Loading rounds…'
                      : noUpcomingRounds
                        ? 'No upcoming rounds'
                        : 'Select a round'}
                  </option>
                  {roundOptions.map(r => (
                    <option key={r.id} value={String(r.id)}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              {roundsError && (
                <p className="mt-2 text-sm text-red-600">
                  Failed to load rounds: {getReadableErrorMessage(roundsError)}
                </p>
              )}
              {noUpcomingRounds && (
                <p className="mt-2 text-sm text-giv-gray-700">
                  There are currently no QF rounds accepting applications.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => gateMut.mutate()}
                disabled={gateMut.isPending || noUpcomingRounds}
              >
                {gateMut.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Check eligibility
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setProjectInput('')
                  setRoundId(initialSelectedRoundId)
                  setUiError(null)
                  setResult(null)
                }}
                disabled={gateMut.isPending}
              >
                Reset
              </Button>
            </div>

            {uiError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                {uiError}
              </div>
            )}

            {result?.kind === 'ok' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                <div className="font-medium">
                  Eligible: {result.project.title}
                </div>
                <div className="mt-1 text-sm">Round: {result.round.name}</div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button asChild disabled={!result.typeformUrl}>
                    {result.typeformUrl ? (
                      <a
                        href={result.typeformUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Continue to Typeform
                      </a>
                    ) : (
                      <span>Typeform not configured</span>
                    )}
                  </Button>
                </div>

                {!result.typeformUrl && (
                  <p className="mt-3 text-sm text-emerald-900/80">
                    The application form URL is not configured for this round.
                  </p>
                )}
              </div>
            )}

            {result?.kind === 'missing' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <div className="font-medium">
                  Missing recipient addresses for this round
                </div>
                <div className="mt-1 text-sm">
                  Project: {result.project.title} · Round: {result.round.name}
                </div>
                <p className="mt-3 text-sm">
                  Add a recipient address for each missing{' '}
                  <strong>chains</strong> below:
                </p>
                <ul className="mt-3 list-disc pl-5 space-y-1 text-sm">
                  {result.missingNetworks.map(n => (
                    <li key={n.networkId}>
                      <span className="font-medium">{n.networkName}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm">
                  Please update your project on Giveth to add valid recipient
                  addresses for the missing chains, then try again.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button variant="outline" asChild>
                    <a
                      href={`${env.OLD_FRONTEND_URL.replace(/\/$/, '')}/account`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Go to account
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
