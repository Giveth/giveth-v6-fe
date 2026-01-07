'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
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

  const NETWORK_NAME_TO_ID: Record<string, number> = {
    Mainnet: 1,
    Gnosis: 100,
    Polygon: 137,
    Celo: 42220,
    Optimism: 10,
    'Ethereum Classic': 61,
    Arbitrum: 42161,
    Base: 8453,
  }

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
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 700)
    return () => clearTimeout(t)
  }, [searchTerm])

  // If user clears search, don't keep "Best match" selected (it won't be available)
  useEffect(() => {
    if (
      debouncedSearchTerm.length < 2 &&
      sortField === ProjectSortField.Relevance
    ) {
      setSortField(ProjectSortField.QualityScore)
      setSortDirection('DESC')
    }
  }, [debouncedSearchTerm, sortField])

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
  const networkIds =
    filters.networks
      .map(n => NETWORK_NAME_TO_ID[n])
      .filter((id): id is number => Number.isInteger(id)) || []

  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isFetching: isProjectsFetching,
  } = useProjects({
    filters: {
      qfRoundId: roundId,
      isGivbacksEligible: filters.isGivbacksEligible || undefined,
      vouched: filters.eligibleForMatching || undefined,
      networkIds: networkIds.length > 0 ? networkIds : undefined,
      // Avoid triggering expensive backend search for 0-1 char inputs (noise + can be slow in prod DBs)
      searchTerm:
        debouncedSearchTerm.length >= 2 ? debouncedSearchTerm : undefined,
    },
    orderBy: sortField,
    orderDirection:
      sortDirection === 'ASC' ? SortDirection.Asc : SortDirection.Desc,
    enabled: !!roundId,
  })

  const projects = (projectsData?.projects?.projects as ProjectEntity[]) || []
  const totalProjects = projectsData?.projects?.total || 0
  const hasProjectsData = !!projectsData?.projects

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
        matchingPool={qfRound.allocatedFundUSD || 0}
        totalDonations={stats?.totalDonationsUsd || 0}
        donationsCount={stats?.donationsCount || 0}
        beginDate={qfRound.beginDate}
        endDate={qfRound.endDate}
      />

      <main className="max-w-7xl mx-auto px-6 pb-16">
        <QFProjectsGrid
          projects={projects}
          isLoading={isProjectsLoading}
          isFetching={isProjectsFetching}
          hasProjectsData={hasProjectsData}
          roundId={roundId}
          roundName={qfRound.title || qfRound.name}
          totalProjects={totalProjects}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          currentSortField={sortField}
          currentSortDirection={sortDirection}
          onSortChange={handleSortChange}
          currentFilters={filters}
          onFilterChange={setFilters}
        />
      </main>
    </div>
  )
}
