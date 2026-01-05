'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { PassportBanner } from '@/components/PassportBanner'
import { AboutTab } from '@/components/project/about-tab'
import { AllTimeDonations } from '@/components/project/all-time-donations'
import { DonationCard } from '@/components/project/donation-card'
import { GivbacksInfoBox } from '@/components/project/givbacks-info-box'
import { ProjectDonationsTable } from '@/components/project/project-donations-table'
import { ProjectHero } from '@/components/project/project-hero'
import { ProjectTabs } from '@/components/project/project-tabs'
import { QFRoundSidebar } from '@/components/project/QFRoundSidebar'
import { SimilarProjects } from '@/components/project/similar-projects'
import { UpdatesTab } from '@/components/project/updates-tab'
import { useProjectBySlug } from '@/hooks/useProject'
import { useProjectUpdatesCount } from '@/hooks/useProjectUpdates'

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
    <div className="min-h-screen bg-[#f7f7f9]">
      {/* Passport Banner */}
      <PassportBanner />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Badges */}
        <div className="flex items-center gap-3 mb-4">
          {project.vouched && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#e1458d] text-white">
              Verified
            </span>
          )}
          {project.isGivbacksEligible && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#d2fffb] text-[#1b8c82]">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
              </svg>
              GIVbacks Eligible
            </span>
          )}
        </div>

        {/* Hero and Donation Card Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-4">
            <ProjectHero project={project} />
            <GivbacksInfoBox />
          </div>
          <div className="space-y-4">
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
      </div>
    </div>
  )
}
