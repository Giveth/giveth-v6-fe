'use client'

import { useParams } from 'next/navigation'
import { ProjectDraftPreview } from '@/components/create-project/ProjectDraftPreview'
import { ProjectPageView } from '@/components/project/ProjectPageView'
import { useProjectBySlug } from '@/hooks/useProject'
import { useProjectUpdatesCount } from '@/hooks/useProjectUpdates'

export default function ProjectPage() {
  const params = useParams()
  const slug = params.slug as string
  if (slug === 'preview') return <ProjectDraftPreview />

  const { data, isLoading, error } = useProjectBySlug(slug)
  const project = data?.projectBySlug
  const projectId = project?.id ? parseInt(project.id) : undefined
  const { data: updatesCountData } = useProjectUpdatesCount(projectId)
  const updatesCount = updatesCountData?.projectUpdates?.totalCount ?? null

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

  return <ProjectPageView project={project} updatesCount={updatesCount} />
}
