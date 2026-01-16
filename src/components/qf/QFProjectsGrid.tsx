'use client'

import { Search, X } from 'lucide-react'
import {
  type ProjectEntity,
  type ProjectSortField,
} from '@/lib/graphql/generated/graphql'
import { QFProjectCard } from './components/QFProjectCard'
import {
  QFProjectFilters,
  type QFFiltersState,
} from './components/QFProjectFilters'
import { QFSorting } from './components/QFSorting'

interface QFProjectsGridProps {
  projects: ProjectEntity[]
  isLoading?: boolean
  isFetching?: boolean
  hasProjectsData?: boolean
  roundId?: number
  roundName?: string
  // Search Props
  searchTerm: string
  onSearchTermChange: (value: string) => void
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
  isFetching,
  hasProjectsData,
  roundId,
  roundName,
  searchTerm,
  onSearchTermChange,
  currentSortField,
  currentSortDirection,
  onSortChange,
  currentFilters,
  onFilterChange,
  totalProjects = 0,
}: QFProjectsGridProps) {
  const trimmedSearch = searchTerm.trim()
  const isSearchActive = trimmedSearch.length >= 2
  const showSearchingState = !!isFetching && isSearchActive
  const showLoadingCount = !hasProjectsData && (isLoading || isFetching)
  const showLoading = showSearchingState || showLoadingCount

  const headerRightText = showSearchingState
    ? 'Searching…'
    : showLoadingCount
      ? 'Loading…'
      : `${totalProjects} projects`

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl self-start md:self-center">
          <span className="text-[#82899a]">{showLoading ? '' : 'Explore'}</span>{' '}
          <span className="text-[#5326ec] font-semibold">
            {headerRightText}
          </span>
        </h2>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#82899a]" />
            <input
              value={searchTerm}
              onChange={e => onSearchTermChange(e.target.value)}
              placeholder="Search projects"
              className="w-full h-10 pl-11 pr-10 bg-white border border-[#ebecf2] rounded-lg text-sm font-medium text-[#1f2333] placeholder:text-[#82899a] focus:outline-none focus:ring-2 focus:ring-[#5326ec]/20 focus:border-[#5326ec] transition-colors"
              aria-label="Search projects"
            />
            {searchTerm.trim().length > 0 && (
              <button
                type="button"
                onClick={() => onSearchTermChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#f7f7f9] transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-[#82899a]" />
              </button>
            )}
          </div>

          <QFSorting
            currentField={currentSortField}
            currentDirection={currentSortDirection}
            onSortChange={onSortChange}
            isSearchActive={isSearchActive}
          />
          <QFProjectFilters
            currentFilters={currentFilters}
            onFilterChange={onFilterChange}
          />
        </div>
      </div>

      {showLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#ebecf2] h-[450px] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
