import { GivBacksEligible } from '@/components/icons/GivBacksEligible'
import { IconVerified } from '@/components/icons/IconVerified'
import { type ProjectEntity } from '@/lib/graphql/generated/graphql'

export const ProjectPageBadges = ({ project }: { project: ProjectEntity }) => {
  const projectIsInActiveRound = project.projectQfRounds.some(
    pqr => pqr.qfRound?.isActive,
  )

  return (
    <div className="flex items-center gap-3 mb-4">
      {project.vouched && (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-giv-success-500">
          <IconVerified width={16} height={16} fill="var(--giv-success-500)" />
          <span>VERIFIED</span>
        </span>
      )}
      {project.isGivbacksEligible && (
        <span className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-giv-brand-500">
          <GivBacksEligible
            width={16}
            height={16}
            fill="var(--giv-brand-500)"
          />
          <span>GIVBACKS</span>
        </span>
      )}
      {projectIsInActiveRound && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-giv-cyan-600 px-1.5 py-0.5 rounded-xl">
          <span>QF PROJECT</span>
        </span>
      )}
    </div>
  )
}
