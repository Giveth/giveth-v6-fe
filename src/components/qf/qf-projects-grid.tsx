'use client'

import {
  type ProjectEntity,
  type ProjectSortField,
} from '@/lib/graphql/generated/graphql'
import { QFProjectCard } from './components/qf-project-card'
import {
  QFProjectFilters,
  type QFFiltersState,
} from './components/qf-project-filters'
import { QFSorting } from './components/qf-sorting'

interface QFProjectsGridProps {
  projects: ProjectEntity[]
  isLoading?: boolean
  roundId?: number
  roundName?: string
  // Sort Props
  currentSortField: ProjectSortField
  currentSortDirection: 'ASC' | 'DESC'
  onSortChange: (field: ProjectSortField, direction: 'ASC' | 'DESC') => void
  // Filter Props
  currentFilters: QFFiltersState
  onFilterChange: (filters: QFFiltersState) => void
  totalProjects?: number
}

export function QFProjectsGrid({
  projects,
  isLoading,
  roundId,
  roundName,
  currentSortField,
  currentSortDirection,
  onSortChange,
  currentFilters,
  onFilterChange,
  totalProjects = 0,
}: QFProjectsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#ebecf2] h-[450px] animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl self-start md:self-center">
          <span className="text-[#82899a]">Explore</span>{' '}
          <span className="text-[#5326ec] font-semibold">
            {totalProjects} projects
          </span>
        </h2>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <QFSorting
            currentField={currentSortField}
            currentDirection={currentSortDirection}
            onSortChange={onSortChange}
          />
          <QFProjectFilters
            currentFilters={currentFilters}
            onFilterChange={onFilterChange}
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {projects.map(project => (
          <QFProjectCard
            key={project.id}
            project={project}
            roundId={roundId}
            roundName={roundName}
          />
        ))}
      </div>

      {/* Load More Button - Placeholder */}
      <div className="flex justify-center">
        {/* Only show load more if we have more projects? For now static as per previous code */}
        {projects.length > 0 && projects.length < totalProjects && (
          <button className="px-8 py-3 border-2 border-[#e1458d] text-[#e1458d] rounded-full text-sm font-medium hover:bg-[#fff5f8] transition-colors">
            Load More
          </button>
        )}
      </div>
    </div>
  )
}
