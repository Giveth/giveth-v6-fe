'use client'

import { useState } from 'react'
import { PassportBanner } from '@/components/PassportBanner'
import { AboutTab } from '@/components/project/AboutTab'
import { AllTimeDonations } from '@/components/project/AllTimeDonations'
import { DonationCard } from '@/components/project/DonationCard'
import { GivbacksInfoBox } from '@/components/project/GivbacksInfoBox'
import { GivbacksApplicationModal } from '@/components/project/givbacks/GivbacksApplicationModal'
import { ProjectDonationsTable } from '@/components/project/ProjectDonationsTable'
import { useCurrentGivbacksEligibilityForm } from '@/hooks/useGivbacksEligibility'
import { ProjectHero } from '@/components/project/ProjectHero'
import { ProjectPageBadges } from '@/components/project/ProjectPageBadges'
import { ProjectTabs } from '@/components/project/ProjectTabs'
import { QFRoundSidebar } from '@/components/project/QFRoundSidebar'
import { UpdatesTab } from '@/components/project/UpdatesTab'
import { useSiweAuth } from '@/context/AuthContext'
import {
  type ProjectBySlugQuery,
  type ProjectEntity,
} from '@/lib/graphql/generated/graphql'

type QfRoundSelection = NonNullable<
  NonNullable<ProjectBySlugQuery['projectBySlug']['projectQfRounds']>[number]
>

export type ProjectPageViewData = {
  id: string
  slug: string
  title: string
  description?: string | null
  descriptionSummary?: string | null
  image?: string | null
  createdAt?: string | null
  totalDonations: number
  countUniqueDonors?: number | null
  vouched?: boolean | null
  isGivbacksEligible?: boolean | null
  socialMedia?: ProjectBySlugQuery['projectBySlug']['socialMedia']
  categories?: ProjectBySlugQuery['projectBySlug']['categories']
  addresses?: ProjectBySlugQuery['projectBySlug']['addresses']
  projectQfRounds?: ProjectBySlugQuery['projectBySlug']['projectQfRounds']
  adminUser?: ProjectBySlugQuery['projectBySlug']['adminUser']
  impactLocation?: string | null
}

function OwnerGivbacksCta({
  slug,
  open,
  onOpenChange,
}: {
  slug: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data } = useCurrentGivbacksEligibilityForm(slug)
  const status = data?.getCurrentGivbacksEligibilityForm?.status
  const isUnderReview = status === 'SUBMITTED' || status === 'VERIFIED'

  return (
    <>
      <button
        type="button"
        disabled={isUnderReview}
        onClick={() => onOpenChange(true)}
        className={`w-full rounded-xl px-6 py-3 font-semibold text-white transition-colors ${
          isUnderReview
            ? 'cursor-not-allowed bg-giv-neutral-400'
            : 'cursor-pointer bg-giv-brand-500 hover:bg-giv-brand-700'
        }`}
      >
        {isUnderReview ? 'Application under review' : 'Apply for GIVbacks'}
      </button>
      <GivbacksApplicationModal slug={slug} open={open} onOpenChange={onOpenChange} />
    </>
  )
}

export function ProjectPageView({
  project,
  updatesCount = null,
  isPreview = false,
}: {
  project: ProjectPageViewData
  updatesCount?: number | null
  isPreview?: boolean
}) {
  const { user } = useSiweAuth()
  const [activeTab, setActiveTab] = useState(isPreview ? 'about' : 'donations')
  const [selectedRound, setSelectedRound] = useState<
    QfRoundSelection | undefined
  >(undefined)
  const [givbacksModalOpen, setGivbacksModalOpen] = useState(false)
  const projectId = project?.id ? parseInt(project.id) : undefined
  const isOwner = !!(
    user?.id &&
    project.adminUser?.id &&
    String(user.id) === String(project.adminUser.id)
  )

  return (
    <div className="min-h-screen bg-giv-neutral-200">
      <PassportBanner />

      <main className="max-w-7xl mx-auto py-8 px-4 md-px-0">
        <ProjectPageBadges project={project as unknown as ProjectEntity} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] mb-6">
          <div className="flex flex-col gap-6">
            <ProjectHero project={project} />
            <GivbacksInfoBox />
            {isOwner && !project.isGivbacksEligible && (
              <OwnerGivbacksCta
                slug={project.slug}
                open={givbacksModalOpen}
                onOpenChange={setGivbacksModalOpen}
              />
            )}
          </div>
          <div className="flex flex-col gap-6">
            {!isPreview ? (
              <>
                <DonationCard project={project} />
                <AllTimeDonations project={project} />
              </>
            ) : (
              <QFRoundSidebar project={project} />
            )}
          </div>
        </div>
      </main>

      {!isPreview && (
        <ProjectTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          updatesCount={updatesCount}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mt-8">
          {!isPreview && activeTab === 'donations' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProjectDonationsTable
                  projectId={parseInt(project.id)}
                  qfRoundEntries={
                    (project.projectQfRounds || []).filter(
                      pqr => pqr?.qfRound?.id,
                    ) as QfRoundSelection[]
                  }
                  setSelectedRound={setSelectedRound}
                />
              </div>
              <div>
                <QFRoundSidebar
                  project={project}
                  selectedRound={selectedRound}
                />
              </div>
            </div>
          )}

          {(isPreview || activeTab === 'about') && (
            <AboutTab
              description={project.description}
              descriptionSummary={project.descriptionSummary}
              socialMedia={project.socialMedia}
              categories={project.categories}
            />
          )}

          {!isPreview &&
            activeTab === 'updates' &&
            projectId &&
            project.createdAt && (
              <UpdatesTab
                projectId={projectId}
                projectCreatedAt={project.createdAt}
              />
            )}

          {!isPreview && activeTab === 'givpower' && (
            <div className="max-w-4xl">
              <div className="text-center py-12">
                <div className="text-giv-neutral-700 text-lg">
                  GIVpower information will be displayed here.
                </div>
                <div className="text-giv-neutral-700 text-sm mt-2">
                  This feature is coming soon.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
