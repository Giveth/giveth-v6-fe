'use client'

import { MixerHorizontalIcon, RocketIcon } from '@radix-ui/react-icons'
import { ProjectCard } from '@/components/qf/ProjectCard'
import { QFHero } from '@/components/qf/QFHero'
import { QFStats } from '@/components/qf/QFStats'
import { useActiveQfRounds } from '@/hooks/useActiveQfRounds'

export default function Home() {
  const { data, isLoading, error } = useActiveQfRounds()

  // Get the first active round and its projects
  const activeRound = data?.activeQfRounds?.[0]
  const projects =
    activeRound?.projectQfRounds?.map((pqr: any) => ({
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
      image:
        pqr.project?.image ||
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000',
      slug: pqr.project?.slug || '',
    })) || []

  if (error) {
    return (
      <main className="min-h-screen bg-[#fcfcff] pb-20">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-xl font-bold text-red-600">
              Error loading QF rounds
            </p>
            <p className="text-sm text-gray-500 mt-2">Please try again later</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#fcfcff] pb-20">
      {/* Hero Section */}
      <div className="bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <QFHero round={activeRound} isLoading={isLoading} />
          <QFStats round={activeRound} isLoading={isLoading} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Explore Header */}
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
            {projects.map((project: any) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl font-bold text-gray-900">
              No active QF rounds at the moment
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Check back later for new rounds
            </p>
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
