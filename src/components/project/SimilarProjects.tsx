import { useState } from 'react'
import clsx from 'clsx'
import { MoveLeft, MoveRight } from 'lucide-react'
import { QFProjectCard } from '@/components/qf/components/QFProjectCard'
import { useSimilarProjectsBySlug } from '@/hooks/useProject'
import { type ProjectEntity } from '@/lib/graphql/generated/graphql'

interface SimilarProjectsProps {
  projectSlug: string
}

export function SimilarProjects({ projectSlug }: SimilarProjectsProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const projectsPerPage = 3
  const { data, isLoading } = useSimilarProjectsBySlug(projectSlug, 0, 9) // Fetch more projects for pagination

  if (isLoading) {
    return (
      <div className="mt-12">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-giv-brand-500 mx-auto"></div>
          <p className="mt-2 text-3xl text-giv-neutral-600 font-bold">
            Loading similar projects...
          </p>
        </div>
      </div>
    )
  }

  const allProjects = data?.similarProjectsBySlug?.projects || []

  if (allProjects.length === 0) {
    return null
  }

  // Calculate pagination
  const totalPages = Math.ceil(allProjects.length / projectsPerPage)
  const startIndex = currentPage * projectsPerPage
  const endIndex = startIndex + projectsPerPage
  const projects = allProjects.slice(startIndex, endIndex)

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  const handlePageClick = (pageIndex: number) => {
    setCurrentPage(pageIndex)
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl text-giv-neutral-600 font-bold">
          Similar projects
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center bg-white',
              'text-giv-neutral-600 hover:text-giv-neutral-900',
              'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
            )}
          >
            <MoveLeft className="w-6 h-6" />
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(index)}
              className={`text-2xl px-2 py-1 cursor-pointer ${
                currentPage === index
                  ? 'font-bold text-giv-neutral-900'
                  : 'text-giv-neutral-700 hover:text-giv-neutral-900'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center bg-white',
              'text-giv-neutral-600 hover:text-giv-neutral-900',
              'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
            )}
          >
            <MoveRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map(project => (
          <QFProjectCard
            key={project.id}
            project={project as unknown as ProjectEntity}
          />
        ))}
      </div>
    </div>
  )
}
