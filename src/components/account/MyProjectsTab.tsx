'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GivbacksApplicationModal } from '@/components/project/givbacks/GivbacksApplicationModal'
import { useCurrentGivbacksEligibilityForm } from '@/hooks/useGivbacksEligibility'
import { graphQLClient } from '@/lib/graphql/client'
import type { MyProjectsQuery } from '@/lib/graphql/generated/graphql'
import { myProjectsQuery } from '@/lib/graphql/queries'

export function MyProjectsTab() {
  const [openModalSlug, setOpenModalSlug] = useState<string | null>(null)

  const { data, isLoading } = useQuery<MyProjectsQuery>({
    queryKey: ['myProjects'],
    queryFn: () => graphQLClient.request(myProjectsQuery, {}),
  })

  const projects = data?.myProjects?.projects ?? []

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-giv-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!projects.length) {
    return (
      <div className="py-16 text-center text-giv-neutral-600">
        <p className="text-lg font-semibold">No projects yet</p>
        <p className="mt-2 text-sm">Create your first project to apply for GIVbacks.</p>
      </div>
    )
  }

  return (
    <>
      <div className="mt-6 space-y-4">
        {projects.map(project => (
          <ProjectRow
            key={project.id}
            project={project}
            onApply={() => setOpenModalSlug(project.slug)}
          />
        ))}
      </div>

      {openModalSlug && (
        <GivbacksApplicationModal
          slug={openModalSlug}
          open={!!openModalSlug}
          onOpenChange={open => {
            if (!open) setOpenModalSlug(null)
          }}
        />
      )}
    </>
  )
}

function ProjectRow({
  project,
  onApply,
}: {
  project: {
    id: string
    title: string
    slug: string
    isGivbacksEligible: boolean
    reviewStatus: string
  }
  onApply: () => void
}) {
  const { data: formData } = useCurrentGivbacksEligibilityForm(project.slug)
  const formStatus = formData?.getCurrentGivbacksEligibilityForm?.status
  const isPending = formStatus === 'SUBMITTED' || formStatus === 'VERIFIED'

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-giv-neutral-200 bg-white px-6 py-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-giv-neutral-900">{project.title}</p>
        <p className="mt-0.5 text-xs text-giv-neutral-500">
          {project.isGivbacksEligible ? (
            <span className="font-semibold text-giv-brand-500">GIVbacks Active</span>
          ) : isPending ? (
            <span className="font-semibold text-yellow-700">Application under review</span>
          ) : (
            <span className="text-giv-neutral-400">Not yet eligible</span>
          )}{' '}
          • <span>{project.reviewStatus}</span>
        </p>
      </div>

      {!project.isGivbacksEligible && !isPending && (
        <button
          type="button"
          onClick={onApply}
          className="shrink-0 cursor-pointer rounded-xl bg-giv-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-giv-brand-700"
        >
          Apply for GIVbacks
        </button>
      )}
    </div>
  )
}
