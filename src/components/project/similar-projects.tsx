import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSimilarProjectsBySlug } from '@/hooks/useProject'
import { type SimilarProjectsBySlugQuery } from '@/lib/graphql/generated/graphql'
import { ProjectImage } from './ProjectImage'

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

  const allProjects =
    (data as SimilarProjectsBySlugQuery)?.similarProjectsBySlug?.projects || []

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
        {projects.map((project, idx: number) => {
          const creatorName =
            project.adminUser?.name ||
            `${project.adminUser?.firstName || ''} ${project.adminUser?.lastName || ''}`.trim() ||
            'Unknown'

          return (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-[#ebecf2] overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative h-40">
                <Link
                  href={`/project/${project.slug}`}
                  className="w-full h-full block"
                >
                  <ProjectImage
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </Link>
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[#82899a] hover:text-[#5326ec]">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                  <button className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[#82899a] hover:text-[#5326ec]">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-[#1f2333] mb-1">
                  <Link
                    href={`/project/${project.slug}`}
                    className="hover:text-[#5326ec] transition-colors"
                  >
                    {project.title}
                  </Link>
                </h3>
                <p className="text-sm text-[#5326ec] mb-2">{creatorName}</p>
                <p className="text-sm text-[#82899a] line-clamp-3 mb-4">
                  {project.descriptionSummary || 'No description available'}
                </p>

                <p className="text-sm mb-3">
                  <span className="font-semibold text-[#1f2333]">
                    ${project.totalDonations?.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-[#82899a]"> Raised</span>
                </p>

                {/* Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {project.isGivbacksEligible && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#d2fffb] text-[#1b8c82]">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
                        </svg>
                        GIVBACK ELIGIBLE
                      </span>
                    )}
                    {project.vouched && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#d2fffb] text-[#1b8c82]">
                        ✓ VOUCHED
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border border-[#ebecf2] text-[#82899a]">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    #{project.qualityScore || project.searchRank || idx + 1}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
