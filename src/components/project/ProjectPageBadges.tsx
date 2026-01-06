import { GivBacksEligible } from '@/components/icons/GivBacksEligible'
import { IconVerified } from '@/components/icons/IconVerified'
import { type ProjectEntity } from '@/lib/graphql/generated/graphql'

export const ProjectPageBadges = ({ project }: { project: ProjectEntity }) => {
  return (
    <div className="flex items-center gap-3 mb-4">
      {project.vouched && (
        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-giv-cyan-600 text-white">
          <IconVerified width={16} height={16} fill="white" />
          <span>Verified</span>
        </span>
      )}
      {project.isGivbacksEligible && (
        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-white text-giv-gray-70">
          <GivBacksEligible
            width={16}
            height={16}
            fill="var(--giv-primary-500)"
          />
          <span>GIVbacks Eligible</span>
        </span>
      )}
    </div>
  )
}
