'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Footer } from '@/components/footer'
import { AboutTab } from '@/components/project/about-tab'
import { AllTimeDonations } from '@/components/project/all-time-donations'
import { DonationCard } from '@/components/project/donation-card'
import { GivbacksInfoBox } from '@/components/project/givbacks-info-box'
import { ProjectDonationsTable } from '@/components/project/project-donations-table'
import { ProjectHero } from '@/components/project/project-hero'
import { ProjectTabs } from '@/components/project/project-tabs'
import { QFRoundSidebar } from '@/components/project/qf-round-sidebar'
import { SimilarProjects } from '@/components/project/similar-projects'
import { UpdatesTab } from '@/components/project/updates-tab'
import { useProjectBySlug } from '@/hooks/useProject'

export default function ProjectPage() {
  const params = useParams()
  const slug = params.slug as string
  const [activeTab, setActiveTab] = useState('donations')
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
  return (
    <div className="min-h-screen bg-[#f7f7f9]">
      {/* Blue Banner */}
      <div className="bg-[#1b1657] text-white py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
          <span className="text-[#7ce8df]">✨</span>
          <span>You donations are eligible to be matched!</span>
          <a
            href="#"
            className="text-[#7ce8df] underline hover:no-underline flex items-center gap-1"
          >
            Go to Passport
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>

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
        <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
            />
          )}

          {activeTab === 'updates' && <UpdatesTab />}

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

      <Footer />
    </div>
  )
}
