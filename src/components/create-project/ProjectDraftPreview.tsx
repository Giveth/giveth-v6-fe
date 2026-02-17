'use client'

import { ProjectPageView } from '@/components/project/ProjectPageView'
import { type ChainType } from '@/lib/graphql/generated/graphql'
import { useCreateProjectDraftStore } from '@/stores/createProjectDraft.store'

export function ProjectDraftPreview() {
  const draft = useCreateProjectDraftStore(s => s.draft)

  return (
    <ProjectPageView
      isPreview
      project={{
        id: '0',
        slug: 'preview',
        title: draft.title.trim() || 'Untitled project',
        description: draft.description || '',
        descriptionSummary: null,
        image: draft.image || null,
        createdAt: null,
        totalDonations: 0,
        countUniqueDonors: 0,
        vouched: false,
        isGivbacksEligible: false,
        socialMedia: draft.socialMedia
          .filter(s => s.link.trim())
          .map((s, index) => ({
            id: `${s.type}-${index}`,
            type: s.type,
            link: s.link,
          })),
        categories: [],
        addresses: draft.recipientAddresses.map((a, index) => ({
          id: `${a.chainType}-${a.networkId}-${index}`,
          address: a.address,
          networkId: a.networkId,
          chainType: a.chainType as ChainType,
          memo: a.memo || null,
        })),
        projectQfRounds: [],
        adminUser: null,
        impactLocation: draft.impactLocation || null,
      }}
    />
  )
}
