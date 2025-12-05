'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Cross2Icon,
  MixerHorizontalIcon,
  RocketIcon,
} from '@radix-ui/react-icons'
import { ProjectCard, type ProjectCardProps } from '@/components/qf/ProjectCard'
import { QFHero } from '@/components/qf/QFHero'
import { QFStats } from '@/components/qf/QFStats'
import { useActiveQfRounds } from '@/hooks/useActiveQfRounds'
import { useSearchProjects } from '@/hooks/useSearchProjects'
import { PROJECT_FALLBACK_IMAGE } from '@/lib/constants'
import { ProjectSortField, SortDirection } from '@/lib/enums'

export default function Home() {
  const searchParams = useSearchParams()
  const searchTerm = searchParams.get('search') || ''
  const sortParam = searchParams.get('sort') || ProjectSortField.Relevance

  // Determine if we're in search mode
  const isSearchMode = searchTerm.length >= 2

  // Fetch QF rounds data (always needed for hero/stats when not searching)
  const {
    data: qfData,
    isLoading: qfLoading,
    error: qfError,
  } = useActiveQfRounds()

  // Fetch search results (only when searching)
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useSearchProjects({
    searchTerm,
    sortBy: sortParam as ProjectSortField,
    sortDirection: SortDirection.DESC,
    enabled: isSearchMode,
  })

  // Get the first active round and its projects for non-search mode
  const activeRound = qfData?.activeQfRounds?.[0]
  const qfProjects =
    activeRound?.projectQfRounds?.map(pqr => ({
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
    })) || []

  // Transform search results to project card format
  const searchProjectsList =
    searchData?.projects?.projects?.map(project => ({
      id: String(project.id || ''),
      title: project.title || '',
      author:
        project.adminUser?.name ||
        project.adminUser?.firstName ||
        'Project Creator',
      description: project.descriptionSummary || '',
      raised: project.totalDonations || 0,
      totalRaised: project.totalDonations || 0,
      contributors: project.countUniqueDonors || 0,
      image: project.image || PROJECT_FALLBACK_IMAGE,
      slug: project.slug || '',
      searchRank: project.searchRank,
    })) || []

  // Choose which projects to display
  const isLoading = isSearchMode ? searchLoading : qfLoading
  const error = isSearchMode ? searchError : qfError
  const projects = isSearchMode ? searchProjectsList : qfProjects
  const totalResults = isSearchMode
    ? searchData?.projects?.total || 0
    : projects.length

  if (error) {
    return (
      <main className="min-h-screen bg-[#fcfcff] pb-20">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-xl font-bold text-red-600">
              {isSearchMode
                ? 'Error searching projects'
                : 'Error loading QF rounds'}
            </p>
            <p className="text-sm text-gray-500 mt-2">Please try again later</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fcfcff] pb-20">
      {/* Hero Section - Only show when not searching */}
      {!isSearchMode && (
        <div className="bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <QFHero round={activeRound} isLoading={qfLoading} />
            <QFStats round={activeRound} isLoading={qfLoading} />
          </div>
        </div>
      )}

      {/* Search Results Header - Only show when searching */}
      {isSearchMode && (
        <div className="bg-gradient-to-r from-[#d81a72]/10 to-[#fd67ac]/10 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Search Results
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Found{' '}
                  <span className="font-bold text-[#d81a72]">
                    {totalResults}
                  </span>{' '}
                  projects matching &quot;
                  <span className="font-medium">{searchTerm}</span>&quot;
                </p>
              </div>
              <Link
                href="/"
                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <Cross2Icon className="h-4 w-4" />
                Clear Search
              </Link>
            </div>

            {/* Sort Pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href={`/?search=${encodeURIComponent(searchTerm)}&sort=${ProjectSortField.Relevance}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  sortParam === ProjectSortField.Relevance
                    ? 'bg-[#d81a72] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Most Relevant
              </Link>
              <Link
                href={`/?search=${encodeURIComponent(searchTerm)}&sort=${ProjectSortField.TotalDonations}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  sortParam === ProjectSortField.TotalDonations
                    ? 'bg-[#d81a72] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Most Funded
              </Link>
              <Link
                href={`/?search=${encodeURIComponent(searchTerm)}&sort=${ProjectSortField.CreatedAt}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  sortParam === ProjectSortField.CreatedAt
                    ? 'bg-[#d81a72] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Newest
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Explore Header - Only show when not searching */}
        {!isSearchMode && (
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Explore{' '}
              <span className="text-gray-400">
                {isLoading ? '...' : `${projects.length} projects`}
              </span>
            </h2>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
                <RocketIcon className="h-4 w-4" />
                Highest GIVpower
                <MixerHorizontalIcon className="ml-2 h-4 w-4 rotate-90" />
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50">
                Filters
                <MixerHorizontalIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-3xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Projects Grid */}
        {!isLoading && projects.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: ProjectCardProps) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl font-bold text-gray-900">
              {isSearchMode
                ? `No projects found matching "${searchTerm}"`
                : 'No active QF rounds at the moment'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {isSearchMode
                ? 'Try a different search term'
                : 'Check back later for new rounds'}
            </p>
            {isSearchMode && (
              <Link
                href="/"
                className="mt-4 inline-block rounded-full bg-[#d81a72] px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-[#b0155c]"
              >
                Browse All Projects
              </Link>
            )}
          </div>
        )}

        {/* Load More */}
        {!isLoading && projects.length > 0 && (
          <div className="mt-16 text-center">
            <button className="rounded-full border-2 border-[#d81a72] px-8 py-3 text-sm font-bold text-[#d81a72] transition-colors hover:bg-[#d81a72] hover:text-white">
              Load More Projects
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
