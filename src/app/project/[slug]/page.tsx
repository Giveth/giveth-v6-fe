'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircledIcon } from '@radix-ui/react-icons'
import { AboutTab } from '@/components/project/AboutTab'
import { DonationTable } from '@/components/project/DonationTable'
import { ProjectHero } from '@/components/project/ProjectHero'
import { ProjectStatsCard } from '@/components/project/ProjectStatsCard'
import { ProjectTabs } from '@/components/project/ProjectTabs'
import { QFDonationStats } from '@/components/project/QFDonationStats'
import { SimilarProjects } from '@/components/project/SimilarProjects'
import { UpdatesTab } from '@/components/project/UpdatesTab'
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
    <main className="min-h-screen bg-[#fcfcff] pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Badges - Moved to top */}
        <div className="mb-6 flex flex-wrap gap-3">
          {project.vouched && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#00afcb] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <CheckCircledIcon className="h-3.5 w-3.5" />
              Vouched
            </span>
          )}
          {project.isGivbacksEligible && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d81a72] shadow-sm">
              <span className="mr-1">👋</span>
              GIVbacks Eligible
            </span>
          )}
          {/* QF Project badge logic? For now hardcode or check if in active round */}
          <span className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#00afcb] shadow-sm">
            <span className="mr-1">🔄</span>
            QF Project
          </span>
        </div>

        {/* Top Section: Hero + Stats Card */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-8">
          {/* Left: Hero Image */}
          <div className="flex-1">
            <ProjectHero
              title={project.title}
              image={project.image}
              adminUser={
                project.adminUser?.name ||
                `${project.adminUser?.firstName || ''} ${project.adminUser?.lastName || ''}`.trim() ||
                undefined
              }
            />
          </div>

          {/* Right: Stats Card */}
          <div className="w-full lg:w-[380px]">
            <ProjectStatsCard
              project={{
                id: project.id,
                title: project.title,
                slug: project.slug,
                image: project.image,
                totalDonations: project.totalDonations,
                countUniqueDonors: project.countUniqueDonors,
              }}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'donations' && (
            <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
              <div className="flex-1">
                <DonationTable projectId={parseInt(project.id)} />
              </div>
              <div className="w-full lg:w-[380px]">
                <QFDonationStats
                  project={{
                    totalDonations: project.totalDonations,
                    countUniqueDonors: project.countUniqueDonors,
                    addresses: project.addresses || [],
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-3xl">
              <AboutTab description={project.description} />
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="max-w-3xl">
              <UpdatesTab />
            </div>
          )}
        </div>

        {/* Similar Projects */}
        <SimilarProjects />
      </div>
    </main>
  )
}
