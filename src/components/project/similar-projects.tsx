import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5326ec] mx-auto"></div>
          <p className="mt-2 text-[#82899a]">Loading similar projects...</p>
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
        <h2 className="text-2xl font-semibold text-[#5326ec]">
          Similar projects
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className="w-8 h-8 rounded-full border border-[#ebecf2] flex items-center justify-center text-[#82899a] hover:border-[#5326ec] hover:text-[#5326ec] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(index)}
              className={`text-sm px-2 py-1 rounded ${
                currentPage === index
                  ? 'font-medium text-[#1f2333] bg-[#5326ec] text-white'
                  : 'text-[#82899a] hover:text-[#5326ec]'
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className="w-8 h-8 rounded-full border border-[#ebecf2] flex items-center justify-center text-[#82899a] hover:border-[#5326ec] hover:text-[#5326ec] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
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
