'use client'

import { type GroupedCategory } from '@/lib/helpers/projectHelper'

export function ProjectCategories({
  categories,
}: {
  categories: GroupedCategory[]
}) {
  if (!categories?.length) return null

  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-2 space-y-3">
      {categories.map(category => (
        <div key={category.id} className="flex flex-col gap-2 md:items-center">
          <h3 className="text-sm font-medium text-giv-neutral-900 w-full">
            {category.title}
          </h3>
          <div className="flex flex-wrap gap-2 w-full">
            {category.categories.map(child => (
              <span
                key={child.id}
                className="rounded-full border border-giv-neutral-900 px-4 py-1 text-sm font-normal text-giv-neutral-900"
              >
                {child.name?.toUpperCase() ?? ''}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
