'use client'

import { useState } from 'react'
import { MyProjectCard } from '@/components/account/my-projects/MyProjectCard'
import { MyProjectsPagination } from '@/components/account/my-projects/MyProjectsPagination'
import { useSiweAuth } from '@/context/AuthContext'
import { useMyProjects } from '@/hooks/useAccount'

const PAGE_SIZE = 10

export function UserProjectsTab() {
  const { token } = useSiweAuth()
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch projects, using pagination
  const { data, isLoading } = useMyProjects(token ?? undefined, {
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    enabled: !!token,
  })

  const projects = data?.myProjects?.projects ?? []
  const total = data?.myProjects?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // Handle page change, update the current page state
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="bg-white rounded-tr-2xl rounded-b-xl p-8 overflow-hidden">
      {isLoading && (
        <div className="flex items-center justify-center py-12 text-giv-neutral-600">
          Loading projects...
        </div>
      )}

      {!isLoading && projects.length === 0 && (
        <div className="py-12 text-center text-giv-neutral-600">
          You don&apos;t have any projects yet.
        </div>
      )}

      {!isLoading && projects.length > 0 && (
        <>
          <div className="space-y-6">
            {projects.map(project => (
              <MyProjectCard key={project.id} project={project} />
            ))}
          </div>

          <MyProjectsPagination
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}
