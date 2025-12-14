'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { Footer } from '@/components/footer'
import { ProjectHeader } from '@/components/project/project-header'
import { type QFFiltersState } from '@/components/qf/components/qf-project-filters'
import { QFHero } from '@/components/qf/qf-hero'
import { QFProjectsGrid } from '@/components/qf/qf-projects-grid'
import { QFStats } from '@/components/qf/qf-stats'
import { useProjects } from '@/hooks/useProjects'
import { useQfRoundBySlug } from '@/hooks/useQfRoundBySlug'
import { useQfRoundStats } from '@/hooks/useQfRoundStats'
import {
  type ProjectEntity,
  ProjectSortField,
  SortDirection,
} from '@/lib/graphql/generated/graphql'

export default function QFRoundPage() {
  const params = useParams<{ slug: string }>()
  const { slug } = params

  // State for Sorting and Filtering
  const [sortField, setSortField] = useState<ProjectSortField>(
    ProjectSortField.QualityScore,
  )
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC')
  const [filters, setFilters] = useState<QFFiltersState>({
    isGivbacksEligible: false,
    eligibleForMatching: false,
    networks: [],
  })

  // 1. Fetch Round Info
  const { data: roundData, isLoading: isRoundLoading } = useQfRoundBySlug(slug)
  const qfRound = roundData?.qfRoundBySlug

  // 2. Fetch Round Stats (needs ID)
  // Casting ID to number because GraphQL ID is string but stats hook might expect number?
  // Checking useQfRoundStats signature: `useQfRoundStats(qfRoundId?: number)`
  const roundId = qfRound ? Number(qfRound.id) : undefined
  const { data: statsData } = useQfRoundStats(roundId)
  const stats = statsData?.qfRoundStats

  // 3. Fetch Projects
  const { data: projectsData, isLoading: isProjectsLoading } = useProjects({
    filters: {
      qfRoundId: roundId,
      isGivbacksEligible: filters.isGivbacksEligible || undefined,
      vouched: filters.eligibleForMatching || undefined,
      // Note: Networks filtering is not currently supported by the backend ProjectFiltersInput
    },
    orderBy: sortField,
    orderDirection:
      sortDirection === 'ASC' ? SortDirection.Asc : SortDirection.Desc,
    enabled: !!roundId,
  })

  const projects = (projectsData?.projects?.projects as ProjectEntity[]) || []
  const totalProjects = projectsData?.projects?.total || 0

  const handleSortChange = (
    field: ProjectSortField,
    direction: 'ASC' | 'DESC',
  ) => {
    setSortField(field)
    setSortDirection(direction)
  }

  if (isRoundLoading) {
    // Basic loading state
    return (
      <div className="min-h-screen bg-[#f7f7f9] flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if (!qfRound) {
    return (
      <div className="min-h-screen bg-[#f7f7f9] flex items-center justify-center">
        Round not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f9]">
      <ProjectHeader />

      {/* Matching Banner */}
      <div className="bg-[#1b1657] py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-white text-sm">
          <div className="w-5 h-5 rounded-full bg-[#37b4a9] flex items-center justify-center">
            <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span>You donations are eligible to be matched!</span>
          <a
            href="#"
            className="font-semibold underline flex items-center gap-1 hover:text-[#e7e1ff]"
          >
            Go to Passport
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <QFHero title={qfRound.title || qfRound.name} endDate={qfRound.endDate} />

      <QFStats
        matchingPool={qfRound.allocatedFundUSD || 0} // requires update to query to fetch this field
        totalDonations={stats?.totalDonationsUsd || 0}
        donationsCount={stats?.donationsCount || 0}
        beginDate={qfRound.beginDate}
        endDate={qfRound.endDate}
      />

      <main className="max-w-7xl mx-auto px-6 pb-16">
        <QFProjectsGrid
          projects={projects}
          isLoading={isProjectsLoading}
          roundId={roundId}
          totalProjects={totalProjects}
          currentSortField={sortField}
          currentSortDirection={sortDirection}
          onSortChange={handleSortChange}
          currentFilters={filters}
          onFilterChange={setFilters}
        />
      </main>

      <Footer />
    </div>
  )
}
