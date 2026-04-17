'use client'

import { useParams } from 'next/navigation'
import { ProjectDraftPreview } from '@/components/create-project/ProjectDraftPreview'
import { ProjectPageView } from '@/components/project/ProjectPageView'
import { useProjectBySlug, useProjectGivpowerCount } from '@/hooks/useProject'
import { useProjectUpdatesCount } from '@/hooks/useProjectUpdates'
import { safeDecodeURIComponent } from '@/lib/helpers/url'

export default function ProjectPage() {
  const params = useParams()
  const rawSlug = params.slug as string
  // Next.js App Router may surface URL-encoded dynamic segments (e.g. when
  // slugs contain reserved chars like ":"), so decode defensively before use.
  const slug = rawSlug ? safeDecodeURIComponent(rawSlug) : rawSlug
  if (slug === 'preview') return <ProjectDraftPreview />

  const { data, isLoading, error } = useProjectBySlug(slug)
  const project = data?.projectBySlug
  const projectId = project?.id ? parseInt(project.id) : undefined
  const { data: updatesCountData } = useProjectUpdatesCount(projectId)
  const updatesCount = updatesCountData?.projectUpdates?.totalCount ?? null
  const { data: givpowerCountData } = useProjectGivpowerCount(projectId)
  const givpowerCount = givpowerCountData?.getPowerBoosting?.totalCount ?? null

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  if (error || !project)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Project not found
      </div>
    )

  return (
    <ProjectPageView
      project={project}
      updatesCount={updatesCount}
      givpowerCount={givpowerCount}
    />
  )
}
