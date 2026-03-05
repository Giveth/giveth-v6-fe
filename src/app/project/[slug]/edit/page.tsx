'use client'

import { useParams } from 'next/navigation'
import { NotAuthenticated } from '@/components/account/NotAuthenticated'
import { NotConnected } from '@/components/account/NotConnected'
import { ProjectDraftPreview } from '@/components/create-project/ProjectDraftPreview'
import {
  type InitialProject,
  CreateProjectFullForm,
} from '@/components/project/CreateProjectFullForm'
import { useSiweAuth } from '@/context/AuthContext'
import { useProjectBySlug } from '@/hooks/useProject'

export default function ProjectEditPage() {
  const params = useParams()
  const slug = params.slug as string
  if (slug === 'preview') return <ProjectDraftPreview />

  const {
    user,
    isAuthenticated,
    isConnected,
    signIn,
    error: authError,
  } = useSiweAuth()
  const { data, isLoading, error } = useProjectBySlug(slug)
  const project = data?.projectBySlug

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

  // Show sign-in flow before ownership checks.
  if (!isConnected) return <NotConnected />
  if (!isAuthenticated || !user)
    return <NotAuthenticated error={authError} signIn={signIn} />

  const isOwner = project.adminUser?.id === String(user.id)
  if (!isOwner) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        You are not the owner of this project
      </div>
    )
  }

  return (
    <CreateProjectFullForm
      initialProject={project as InitialProject}
      mode="edit"
    />
  )
}
