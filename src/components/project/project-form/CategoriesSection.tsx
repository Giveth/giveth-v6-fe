'use client'

export interface CategorySectionItem {
  id: string
  value?: string | null
  name?: string | null
}

export interface CategorySectionGroup {
  title: string
  categories: CategorySectionItem[]
}

interface CategoriesSectionProps {
  groupedCategories: CategorySectionGroup[]
  selectedSubcategories: string[]
  maxCategories: number
  onToggleSubcategory: (value: string) => void
  onActivate: () => void
}

export function CategoriesSection({
  groupedCategories,
  selectedSubcategories,
  maxCategories,
  onToggleSubcategory,
  onActivate,
}: CategoriesSectionProps) {
  return (
    <section onMouseEnter={onActivate} onFocus={onActivate}>
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl leading-[1.2] font-semibold text-giv-neutral-900">
            Please select a category.
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-base text-giv-neutral-700">
              You can choose up to {maxCategories} categories for your project.
            </p>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
              {selectedSubcategories.length}/{maxCategories}
            </span>
          </div>
        </div>

        <div className="space-y-10">
          {groupedCategories.map(group => (
            <div key={group.title} className="space-y-5">
              <h3 className="text-xl leading-[1.2] font-semibold text-giv-neutral-900 uppercase">
                {group.title}
              </h3>
              <div className="grid grid-cols-1 gap-y-5 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.categories.map(cat => {
                  const catValue = cat.value || cat.id
                  const isSelected =
                    !!catValue && selectedSubcategories.includes(catValue)

                  return (
                    <label
                      key={`${group.title}-${cat.id}`}
                      className="flex items-center gap-3 text-sm text-giv-neutral-700"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded-[6px] border-2 border-giv-neutral-900 text-giv-deep-blue-800 focus:ring-0 focus:ring-offset-0"
                        checked={isSelected}
                        onChange={() =>
                          catValue && onToggleSubcategory(catValue)
                        }
                      />
                      <span className="capitalize">
                        {cat.name || cat.value || cat.id}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
