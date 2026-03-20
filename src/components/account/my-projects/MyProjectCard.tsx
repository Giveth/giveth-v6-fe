import { format } from 'date-fns'
import { Calendar, CircleDollarSign } from 'lucide-react'
import { MyProjectTabCardDropdown } from '@/components/account/my-projects/MyProjectTabDropdown'
import {
  type ProjectStatusPillVariant,
  ProjectStatusPill,
} from '@/components/account/my-projects/ProjectStatusPill'
import { type MyProject } from '@/hooks/useAccount'
import {
  GivbacksEligibilityStatus,
  ProjectStatus,
  ProjectType,
  ReviewStatus,
} from '@/lib/graphql/generated/graphql'

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  [ProjectStatus.Active]: 'Active',
  [ProjectStatus.Deactive]: 'Deactivated',
  [ProjectStatus.Pending]: 'Pending',
  [ProjectStatus.Clarification]: 'Clarification',
  [ProjectStatus.Verification]: 'Verification',
  [ProjectStatus.Rejected]: 'Rejected',
  [ProjectStatus.Cancelled]: 'Cancelled',
  [ProjectStatus.Drafted]: 'Drafted',
}

const PROJECT_STATUS_VARIANT: Record<ProjectStatus, ProjectStatusPillVariant> =
  {
    [ProjectStatus.Active]: 'active',
    [ProjectStatus.Deactive]: 'deactivated',
    [ProjectStatus.Pending]: 'neutral',
    [ProjectStatus.Clarification]: 'neutral',
    [ProjectStatus.Verification]: 'neutral',
    [ProjectStatus.Rejected]: 'error',
    [ProjectStatus.Cancelled]: 'error',
    [ProjectStatus.Drafted]: 'neutral',
  }

const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  [ReviewStatus.Listed]: 'Listed',
  [ReviewStatus.NotListed]: 'Not listed',
  [ReviewStatus.NotReviewed]: 'Not reviewed',
}

const REVIEW_STATUS_VARIANT: Record<ReviewStatus, ProjectStatusPillVariant> = {
  [ReviewStatus.Listed]: 'active',
  [ReviewStatus.NotListed]: 'error',
  [ReviewStatus.NotReviewed]: 'neutral',
}

/** GIVbacks eligibility display: backend sets isGivbacksEligible and (when available) givbacksEligibilityForm.status. Causes are auto-eligible. */
function getGivbacksEligibilityDisplay(
  isGivbacksEligible: boolean,
  projectType: ProjectType,
  formStatus?: GivbacksEligibilityStatus | null,
): { label: string; variant: ProjectStatusPillVariant } {
  const isCause = projectType === ProjectType.Cause
  if (isGivbacksEligible || isCause)
    return { label: 'Eligible', variant: 'active' }
  if (formStatus === GivbacksEligibilityStatus.Verified)
    return { label: 'Eligible', variant: 'active' }
  if (formStatus === GivbacksEligibilityStatus.Draft)
    return { label: 'Incomplete', variant: 'deactivated' }
  if (formStatus === GivbacksEligibilityStatus.Submitted)
    return { label: 'Submitted', variant: 'neutral' }
  if (formStatus === GivbacksEligibilityStatus.Rejected)
    return { label: 'Declined', variant: 'error' }
  return { label: 'Ineligible', variant: 'neutral' }
}

export function MyProjectCard({ project }: { project: MyProject }) {
  const givbacksFormStatus = project.givbacksEligibilityForm?.status ?? null

  const reviewStatus = project.reviewStatus ?? ReviewStatus.NotReviewed
  const listedLabel = REVIEW_STATUS_LABEL[reviewStatus]
  const listedVariant = REVIEW_STATUS_VARIANT[reviewStatus]
  const projectStatus = project.status ?? ProjectStatus.Drafted
  const projectStatusLabel = PROJECT_STATUS_LABEL[projectStatus]
  const projectStatusVariant = PROJECT_STATUS_VARIANT[projectStatus]
  const projectType = project.projectType ?? ProjectType.Project
  const { label: givbacksLabel, variant: givbacksVariant } =
    getGivbacksEligibilityDisplay(
      project.isGivbacksEligible,
      projectType,
      givbacksFormStatus,
    )
  // Verification status: backend field project.vouched (admin verification). Show only for projects, not causes.
  const verificationLabel = project.vouched ? 'Verified' : 'Not verified'
  const verificationVariant = project.vouched
    ? ('active' as const)
    : ('deactivated' as const)
  const showVerificationStatus = projectType === ProjectType.Project

  return (
    <article className="border-b border-giv-neutral-300 pb-6 last:border-b-0 last:pb-0">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-giv-neutral-700">
            <Calendar className="h-4 w-4 text-giv-neutral-600" aria-hidden />
            <time dateTime={project.createdAt}>
              Created at {format(new Date(project.createdAt), 'MMM d, yyyy')}
            </time>
          </div>
          <h3 className="text-xl font-bold text-giv-neutral-900">
            {project.title}
          </h3>
        </div>
        <MyProjectTabCardDropdown project={project} />
      </div>

      {/* Details: status + total raised */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-giv-neutral-800">Project status</span>
            <ProjectStatusPill variant={projectStatusVariant}>
              {projectStatusLabel}
            </ProjectStatusPill>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-giv-neutral-800">
              Listed on public site
            </span>
            <ProjectStatusPill variant={listedVariant}>
              {listedLabel}
            </ProjectStatusPill>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-giv-neutral-800">
              GIVbacks Eligibility status
            </span>
            <ProjectStatusPill variant={givbacksVariant}>
              {givbacksLabel}
            </ProjectStatusPill>
          </div>
          {showVerificationStatus && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-giv-neutral-800">
                Verification status
              </span>
              <ProjectStatusPill variant={verificationVariant}>
                {verificationLabel}
              </ProjectStatusPill>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:justify-end">
          <CircleDollarSign
            className="h-5 w-5 text-giv-neutral-600"
            aria-hidden
          />
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-giv-neutral-800">Total Raised</span>
            <span className="text-lg font-semibold text-giv-neutral-900">
              ${Number(project.totalDonations ?? 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
