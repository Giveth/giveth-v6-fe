'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { PassportBanner } from '@/components/PassportBanner'
import { AboutTab } from '@/components/project/about-tab'
import { AllTimeDonations } from '@/components/project/AllTimeDonations'
import { DonationCard } from '@/components/project/DonationCard'
import { GivbacksInfoBox } from '@/components/project/GivbacksInfoBox'
import { ProjectDonationsTable } from '@/components/project/ProjectDonationsTable'
import { ProjectHero } from '@/components/project/ProjectHero'
import { ProjectPageBadges } from '@/components/project/ProjectPageBadges'
import { ProjectTabs } from '@/components/project/ProjectTabs'
import { QFRoundSidebar } from '@/components/project/QFRoundSidebar'
import { SimilarProjects } from '@/components/project/similar-projects'
import { UpdatesTab } from '@/components/project/updates-tab'
import { useProjectBySlug } from '@/hooks/useProject'
import { useProjectUpdatesCount } from '@/hooks/useProjectUpdates'
import { type ProjectEntity } from '@/lib/graphql/generated/graphql'

export default function ProjectPage() {
  const params = useParams()
  const slug = params.slug as string
  const [activeTab, setActiveTab] = useState('donations')
  const { data, isLoading, error } = useProjectBySlug(slug)
  const project = data?.projectBySlug
  const projectId = project?.id ? parseInt(project.id) : undefined
  const { data: updatesCountData } = useProjectUpdatesCount(projectId)
  const updatesCount = updatesCountData?.projectUpdates.totalCount ?? null

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
    <div className="min-h-screen bg-giv-gray-200">
      {/* Passport Banner */}
      <PassportBanner />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 md-px-0">
        {/* Badges */}
        <ProjectPageBadges project={project as unknown as ProjectEntity} />

        {/* Hero and Donation Card Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] mb-6">
          <div className="flex flex-col gap-6">
            <ProjectHero project={project} />
            <GivbacksInfoBox />
          </div>
          <div className="flex flex-col gap-6">
            <DonationCard project={project} />
            <AllTimeDonations project={project} />
          </div>
        </div>

        {/* Tabs */}
        <ProjectTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          updatesCount={updatesCount}
        />

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'donations' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProjectDonationsTable
                  projectId={parseInt(project.id)}
                  qfRounds={(project.projectQfRounds || [])
                    .map(pqr => ({
                      id: pqr.qfRound?.id || '',
                      name: pqr.qfRound?.name || '',
                      isActive: pqr.qfRound?.isActive || false,
                    }))
                    .filter(r => r.id && r.name)}
                />
              </div>
              <div>
                <QFRoundSidebar project={project} />
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <AboutTab
              description={project.description}
              descriptionSummary={project.descriptionSummary}
              socialMedia={project.socialMedia}
            />
          )}

          {activeTab === 'updates' && projectId && (
            <UpdatesTab
              projectId={projectId}
              projectCreatedAt={project.createdAt}
            />
          )}

          {activeTab === 'givpower' && (
            <div className="max-w-4xl">
              <div className="text-center py-12">
                <div className="text-[#82899a] text-lg">
                  GIVpower information will be displayed here.
                </div>
                <div className="text-[#82899a] text-sm mt-2">
                  This feature is coming soon.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Similar Projects */}
        <SimilarProjects projectSlug={slug} />
      </main>
    </div>
  )
}
