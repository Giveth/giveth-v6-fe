'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  Cross2Icon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  RocketIcon,
} from '@radix-ui/react-icons'
import { ProjectCard, type ProjectCardProps } from '@/components/qf/ProjectCard'
import { useQfRoundBySlug } from '@/hooks/useQfRoundBySlug'
import { useQfRoundStats } from '@/hooks/useQfRoundStats'
import { PROJECT_FALLBACK_IMAGE } from '@/lib/constants'
import type { ProjectQfRoundEntity } from '@/lib/graphql/generated/graphql'
import type { Route } from 'next'

export default function QfHomepage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || '',
  )

  const searchTerm = searchParams.get('search') || ''
  const isSearching = searchTerm.trim().length >= 2

  const {
    data: roundData,
    isLoading: roundLoading,
    error: roundError,
  } = useQfRoundBySlug(params?.slug)

  const round = roundData?.qfRoundBySlug
  const roundSlug = params?.slug ?? ''
  const roundPath = `/qf/${roundSlug}` as Route

  const { data: statsData, isLoading: statsLoading } = useQfRoundStats(
    round ? Number(round.id) : undefined,
  )

  const projects: ProjectCardProps[] = useMemo(() => {
    const projectRounds = (round?.projectQfRounds ||
      []) as ProjectQfRoundEntity[]

    return projectRounds.map(pqr => ({
      id: String(pqr.project?.id || ''),
      title: pqr.project?.title || '',
      author:
        pqr.project?.adminUser?.name ||
        pqr.project?.adminUser?.firstName ||
        'Anonymous',
      description: pqr.project?.descriptionSummary || '',
      raised: pqr.sumDonationValueUsd || 0,
      totalRaised: pqr.sumDonationValueUsd || 0,
      contributors: pqr.countUniqueDonors || 0,
      image: pqr.project?.image || PROJECT_FALLBACK_IMAGE,
      slug: pqr.project?.slug || '',
    }))
  }, [round])

  const visibleProjects = useMemo(() => {
    if (!isSearching) return projects
    const term = searchTerm.toLowerCase()
    return projects.filter(
      project =>
        project.title.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term),
    )
  }, [projects, isSearching, searchTerm])

  useEffect(() => {
    setSearchValue(searchTerm)
  }, [searchTerm])

  const handleSearch = () => {
    if (searchValue.trim().length === 0) {
      router.push(roundPath)
      return
    }
    const paramsObj = new URLSearchParams()
    paramsObj.set('search', searchValue.trim())
    router.push(`${roundPath}?${paramsObj.toString()}` as Route)
  }

  if (roundError) {
    return (
      <main className="min-h-screen bg-[#fcfcff] pb-20">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-bold text-red-600">
              Error loading QF round
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Please try again later.
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (!round && !roundLoading) {
    return (
      <main className="min-h-screen bg-[#fcfcff] pb-20">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">Round not found</p>
            <p className="mt-2 text-sm text-gray-500">
              We could not find the requested round.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-[#d81a72] px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-[#b0155c]"
            >
              Go Home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fcfcff] pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute -right-20 top-0 h-[500px] w-[500px] rounded-full bg-[#fd67ac]/10 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-[#502CC9]/10 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full bg-[#E0D8FD] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#502CC9]">
              {round?.name || 'Quadratic Funding'}
            </p>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              {round?.title ||
                'Giveth empowers changemakers to accept crypto donations.'}
            </h1>
            <p className="text-lg text-gray-600">
              {round?.description ||
                'Join our community-driven movement to transform the way we fund nonprofits and social causes using innovative crypto fundraising strategies.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#projects"
                className="rounded-full bg-[#d81a72] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#b0155c]"
              >
                Explore Projects
              </Link>
              <Link
                href="#stats"
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-gray-800 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50"
              >
                Our Metrics
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: 'Verified Projects',
                  desc: 'Support curated projects making impact.',
                },
                {
                  title: 'Donor Rewards',
                  desc: 'Get rewarded for giving to QF-eligible projects.',
                },
                {
                  title: 'Easy Onboarding',
                  desc: 'Start donating in minutes on Giveth.',
                },
              ].map(item => (
                <div
                  key={item.title}
                  className="rounded-2xl bg-gray-50 p-4 shadow-sm"
                >
                  <p className="text-sm font-bold text-gray-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative h-[380px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#4d2ac2] to-[#fd67ac] shadow-xl">
              {round?.bannerFull && (
                <Image
                  src={round.bannerFull}
                  alt={round.name || 'QF Round'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 600px"
                  priority
                />
              )}
              {!round?.bannerFull && (
                <div className="absolute inset-0 flex items-center justify-center text-5xl font-black uppercase text-white/40">
                  QF
                </div>
              )}
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-4 shadow-md backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#502CC9]">
                  Round ends in
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {round?.endDate
                    ? new Date(round.endDate).toLocaleDateString()
                    : 'TBD'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        id="stats"
        className="mx-auto mt-6 max-w-6xl px-4 sm:px-6 lg:px-8"
      >
        <div className="grid gap-4 rounded-3xl bg-[#4d2ac2] px-6 py-6 text-white shadow-lg sm:grid-cols-3 sm:px-10 sm:py-8">
          {[
            {
              label: 'Projects on Giveth',
              value: round?.projectQfRounds?.length ?? 0,
              loading: roundLoading,
            },
            {
              label: 'Donated to projects',
              value: statsData?.qfRoundStats?.totalDonationsUsd ?? 0,
              loading: statsLoading,
              prefix: '$',
            },
            {
              label: 'Unique Donors',
              value: statsData?.qfRoundStats?.uniqueDonors ?? 0,
              loading: statsLoading,
            },
          ].map(card => (
            <div
              key={card.label}
              className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur"
            >
              <p className="text-sm font-semibold text-white/80">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-bold">
                {card.loading ? '...' : `${card.prefix ?? ''}${card.value}`}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section
        id="projects"
        className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#502CC9]">
              GIVpower
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              {round?.title || 'Featured QF Projects'}
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm ring-1 ring-gray-200">
              <RocketIcon className="h-4 w-4 text-[#502CC9]" />
              <span className="text-sm font-semibold text-gray-800">
                Highest GIVpower
              </span>
            </div>
            <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50">
              Filters
              <MixerHorizontalIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Search projects in this round"
              className="w-full rounded-full bg-white py-3 pl-5 pr-12 text-sm shadow-sm ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#fd67ac]/30"
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearch()
              }}
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-800"
              aria-label="Search projects"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>

          {isSearching && (
            <button
              onClick={() => router.push(roundPath)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50"
            >
              <Cross2Icon className="h-4 w-4" />
              Clear Search
            </button>
          )}
        </div>

        {roundLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-3xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {visibleProjects.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleProjects.map(project => (
                  <ProjectCard key={project.id} {...project} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                <p className="text-xl font-bold text-gray-900">
                  {isSearching
                    ? `No projects found matching "${searchTerm}"`
                    : 'No projects in this round yet'}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {isSearching
                    ? 'Try a different search term'
                    : 'Check back later for new additions'}
                </p>
                {isSearching && (
                  <button
                    onClick={() => router.push(roundPath)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#d81a72] px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-[#b0155c]"
                  >
                    Browse All Projects
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Newsletter + Partners placeholder to mirror design */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white px-6 py-10 shadow-sm sm:px-10">
          <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#502CC9]">
                Stay in the loop
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                Get the latest updates
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Subscribe to our newsletter and get all updates straight to your
                mailbox. We will not spam you.
              </p>
            </div>
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={e => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-full border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#fd67ac]/30"
              />
              <button className="rounded-full bg-[#502CC9] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#3f22a3]">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
