'use client'

import { useRef, useState } from 'react'
import clsx from 'clsx'
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
  isActiveRound: boolean
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
  isActiveRound,
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
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
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
        <h2 className="text-2xl self-start font-bold md:self-center">
          <span className="text-giv-neutral-900">
            {showLoading ? '' : 'Explore'}
          </span>{' '}
          <span className="text-giv-neutral-700">{headerRightText}</span>
        </h2>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div
            className={clsx(
              'relative overflow-hidden transition-[width] duration-200 ease-out bg-white rounded-sm',
              isSearchOpen ? 'w-full md:w-[320px]' : 'w-12 md:w-12',
            )}
          >
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(true)
                requestAnimationFrame(() => searchInputRef.current?.focus())
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
              aria-label="Open search"
            >
              <Search className="w-4 h-4 text-giv-neutral-900" />
            </button>
            <input
              ref={searchInputRef}
              value={searchTerm}
              onChange={e => onSearchTermChange(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => {
                if (searchTerm.trim().length === 0) setIsSearchOpen(false)
              }}
              placeholder="Search"
              className={clsx(
                'w-full h-10 pl-11 pr-10 bg-white border border-giv-neutral-300',
                'rounded-sm text-base font-medium text-giv-neutral-900 placeholder:text-giv-neutral-700',
                'focus:outline-none transition-colors',
                !isSearchOpen && 'opacity-0 pointer-events-none',
              )}
              aria-label="Search"
            />
            {searchTerm.trim().length > 0 && (
              <button
                type="button"
                onClick={() => onSearchTermChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-giv-neutral-200 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-giv-neutral-700" />
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
              className="bg-white rounded-xl border border-giv-neutral-300 h-[450px] animate-pulse"
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
                isActiveRound={isActiveRound}
              />
            ))}
          </div>

          {/* Load More Button - Placeholder */}
          <div className="flex justify-center">
            {/* Only show load more if we have more projects? For now static as per previous code */}
            {projects.length > 0 && projects.length < totalProjects && (
              <button
                className={clsx(
                  'px-8 py-3 border-2 border-giv-pink-500 text-giv-pink-500',
                  'rounded-full text-sm font-medium hover:bg-giv-pink-200 transition-colors',
                )}
              >
                Load More
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
