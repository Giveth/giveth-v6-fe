import {
  type MainCategoryEntity,
  type ProjectBySlugQuery,
  type ProjectEntity,
} from '@/lib/graphql/generated/graphql'

type ProjectCategory = NonNullable<
  NonNullable<ProjectBySlugQuery['projectBySlug']['categories']>[number]
>

export type GroupedCategory = {
  id: string
  title: string
  slug: string
  categories: ProjectCategory[]
}

export const calculateEstimatedMatchingWithDonationAmount = (
  donationAmountInUSD: number,
  projectDonationsSqrtRootSum?: number,
  allProjectsSum?: number,
  matchingPool?: number,
  matchingCapPercentage?: number,
) => {
  if (!matchingCapPercentage || !matchingPool || !donationAmountInUSD) return 0
  const _projectDonationsSqrtRootSum = projectDonationsSqrtRootSum || 0
  const _allProjectsSum = allProjectsSum || 0
  const beforeNewDonationPow = Math.pow(_projectDonationsSqrtRootSum, 2)
  const afterNewDonationPow = Math.pow(
    _projectDonationsSqrtRootSum + Math.sqrt(donationAmountInUSD),
    2,
  )

  const newEstimateMatching = Math.min(
    (afterNewDonationPow /
      (_allProjectsSum + afterNewDonationPow - beforeNewDonationPow)) *
      matchingPool,
    matchingPool * matchingCapPercentage,
  )
  return (
    newEstimateMatching *
    ((afterNewDonationPow - beforeNewDonationPow) / afterNewDonationPow)
  )
}

/**
 * Get the active rounds adn roudns that begin date match the current date for a project
 * Sort the rounds by begin date
 *
 * @param project - The project to get the active rounds for
 * @returns The active rounds for the project
 */
export const getProjectActiveRounds = (project: ProjectEntity) => {
  const currentDate = new Date()
  return project.projectQfRounds
    ?.filter(pqr => pqr.qfRound?.isActive)
    ?.filter(pqr => {
      if (pqr.qfRound?.beginDate) {
        return (
          new Date(pqr.qfRound.beginDate).getTime() <= currentDate.getTime()
        )
      }
      return false
    })
    .sort((a, b) => {
      if (a.qfRound?.beginDate && b.qfRound?.beginDate) {
        return (
          new Date(a.qfRound.beginDate).getTime() -
          new Date(b.qfRound.beginDate).getTime()
        )
      }
      return 0
    })
}

/**
 * Group the categories by main category
 *
 * @param categories - The categories to group by main category
 * @returns The categories grouped by main category
 */
export function groupByMainCategory(
  categories:
    | ProjectBySlugQuery['projectBySlug']['categories']
    | null
    | undefined,
): GroupedCategory[] {
  const map = new Map<string, GroupedCategory>()

  for (const item of categories ?? []) {
    const main = item.mainCategory
    if (!main) continue

    if (!map.has(main.id)) {
      map.set(main.id, {
        id: main.id,
        title: main.title,
        slug: main.slug,
        categories: [],
      })
    }

    map.get(main.id)!.categories.push(item)
  }

  return Array.from(map.values())
}
