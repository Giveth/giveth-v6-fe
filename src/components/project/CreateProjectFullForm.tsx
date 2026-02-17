'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useActiveAccount } from 'thirdweb/react'
import { Button } from '@/components/ui/button'
import { createGraphQLClient } from '@/lib/graphql/client'
import {
  type CategoriesQuery,
  type MainCategoriesQuery,
  type ProjectEntity,
} from '@/lib/graphql/generated/graphql'
import {
  createProjectMutation,
  updateProjectMutation,
} from '@/lib/graphql/mutations'
import { categoriesQuery, mainCategoriesQuery } from '@/lib/graphql/queries'

// Social media platform configuration
const SOCIAL_PLATFORMS = [
  {
    id: 'twitter',
    label: 'X',
    placeholder: 'https://x.com/username',
    icon: 'X',
  },
  {
    id: 'farcaster',
    label: 'Farcaster',
    placeholder: 'https://warpcast.com/username',
    icon: 'FC',
  },
  {
    id: 'lens',
    label: 'Lens',
    placeholder: 'https://lens.xyz/username',
    icon: 'L',
  },
  {
    id: 'website',
    label: 'Website',
    placeholder: 'https://yourwebsite.com',
    icon: 'W',
  },
  {
    id: 'discord',
    label: 'Discord',
    placeholder: 'https://discord.gg/invite',
    icon: 'D',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    placeholder: 'https://t.me/username',
    icon: 'T',
  },
  {
    id: 'github',
    label: 'Github',
    placeholder: 'https://github.com/username',
    icon: 'GH',
  },
  {
    id: 'youtube',
    label: 'Youtube',
    placeholder: 'https://youtube.com/@channel',
    icon: 'YT',
  },
  {
    id: 'reddit',
    label: 'Reddit',
    placeholder: 'https://reddit.com/r/subreddit',
    icon: 'R',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/username',
    icon: 'IG',
  },
  {
    id: 'threads',
    label: 'Threads',
    placeholder: 'https://threads.net/@username',
    icon: 'TH',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    placeholder: 'https://facebook.com/page',
    icon: 'FB',
  },
  {
    id: 'linkedin',
    label: 'Linkedin',
    placeholder: 'https://linkedin.com/in/username',
    icon: 'LI',
  },
] as const

// Preset colors for project
const PRESET_COLORS = [
  '#5326ec', // Purple
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
] as const

const MIN_DESCRIPTION_CHARS = 200
const MIN_TITLE_CHARS = 3
export const MAX_CATEGORIES = 5

type Category = CategoriesQuery['categories'][number]
type MainCategory = MainCategoriesQuery['mainCategories'][number]
type InitialProject = {
  id: string
  slug?: string
  title: string
  description: string
  image?: string | null
  impactLocation?: string | null
  addresses?: { address?: string | null }[] | null
  categories?: {
    id?: string | null
    value?: string | null
    name?: string | null
  }[]
}
type CreateProjectResponse = {
  createProject: Pick<
    ProjectEntity,
    'id' | 'title' | 'slug' | 'description' | 'image' | 'impactLocation'
  > & {
    createdAt: string
    updatedAt: string
  }
}
type UpdateProjectResponse = {
  updateProject: Pick<
    ProjectEntity,
    'id' | 'title' | 'slug' | 'description' | 'image' | 'impactLocation'
  > & {
    categories?: {
      id?: string | null
      value?: string | null
      name?: string | null
    }[]
    addresses?: { address?: string | null; networkId?: number | null }[]
  }
}

interface FormData {
  title: string
  description: string
  socialLinks: Record<string, string>
  selectedSubcategories: string[]
  impactLocation: string
  image: string
  imageColor: string
  walletAddress: string
}

export type CreateFormSection =
  | 'default'
  | 'name'
  | 'description'
  | 'social'
  | 'categories'
  | 'location'
  | 'image'
  | 'addresses'
  | 'publish'

interface CreateProjectFullFormProps {
  onSectionChange?: (section: CreateFormSection) => void
  onProgressChange?: (progress: {
    score: number
    completed: number
    total: number
  }) => void
  mode?: 'create' | 'edit'
  initialProject?: InitialProject
}

export function CreateProjectFullForm({
  onSectionChange,
  onProgressChange,
  mode = 'create',
  initialProject,
}: CreateProjectFullFormProps) {
  const router = useRouter()
  const account = useActiveAccount()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<FormData>({
    title: initialProject?.title || '',
    description: initialProject?.description || '',
    socialLinks: {},
    selectedSubcategories:
      initialProject?.categories
        ?.map(cat => cat?.value || cat?.id || cat?.name || '')
        ?.filter(Boolean as unknown as (v: string) => v is string) || [],
    impactLocation: initialProject?.impactLocation || 'Worldwide',
    image: initialProject?.image || '',
    imageColor: PRESET_COLORS[0],
    walletAddress:
      initialProject?.addresses?.find(addr => addr?.address)?.address ||
      account?.address ||
      '',
  })

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const client = createGraphQLClient()
      return client.request<{ categories: Category[] }>(categoriesQuery)
    },
  })

  const { data: mainCategoriesData } = useQuery({
    queryKey: ['mainCategories'],
    queryFn: async () => {
      const client = createGraphQLClient()
      return client.request<{ mainCategories: MainCategory[] }>(
        mainCategoriesQuery,
      )
    },
  })

  const createProjectMut = useMutation<CreateProjectResponse, Error, FormData>({
    mutationFn: async (data: FormData) => {
      const token = localStorage.getItem('giveth_token')
      const client = createGraphQLClient({
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      // Map selected categories to IDs
      const categoryIds = data.selectedSubcategories
        .map(value => {
          const cat = displayCategories.find(
            c =>
              c.value === value ||
              c.id === value ||
              c.name?.toLowerCase() === value?.toLowerCase(),
          )
          return cat ? parseInt(cat.id) : null
        })
        .filter((id): id is number => id !== null)

      const variables = {
        input: {
          title: data.title,
          description: data.description,
          impactLocation: data.impactLocation || null,
          image: data.image || null,
          categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
          addresses: data.walletAddress
            ? [
                {
                  address: data.walletAddress,
                  networkId: 1, // Ethereum mainnet
                  chainType: 'EVM',
                },
              ]
            : undefined,
        },
      }

      const response = await client.request<CreateProjectResponse>(
        createProjectMutation,
        variables,
      )

      return response
    },
    onSuccess: data => {
      router.push(`/project/${data.createProject.slug}`)
    },
    onError: error => {
      console.error('Error creating project:', error)
      setErrors({ submit: error.message })
    },
  })

  const updateProjectMut = useMutation<UpdateProjectResponse, Error, FormData>({
    mutationFn: async (data: FormData) => {
      if (!initialProject?.id) {
        throw new Error('Missing project id')
      }
      const token = localStorage.getItem('giveth_token')
      const client = createGraphQLClient({
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      const categoryIds = data.selectedSubcategories
        .map(value => {
          const cat = displayCategories.find(
            c =>
              c.value === value ||
              c.id === value ||
              c.name?.toLowerCase() === value?.toLowerCase(),
          )
          return cat ? parseInt(cat.id) : null
        })
        .filter((id): id is number => id !== null)

      const variables = {
        projectId: parseInt(initialProject.id),
        input: {
          title: data.title,
          description: data.description,
          impactLocation: data.impactLocation || null,
          image: data.image || null,
          categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
          addresses: data.walletAddress
            ? [
                {
                  address: data.walletAddress,
                  networkId: 1,
                  chainType: 'EVM',
                },
              ]
            : undefined,
        },
      }

      const response = await client.request<UpdateProjectResponse>(
        updateProjectMutation,
        variables,
      )

      return response
    },
    onSuccess: data => {
      const slug = data.updateProject.slug || initialProject?.slug
      router.push(`/project/${slug}`)
    },
    onError: error => {
      console.error('Error updating project:', error)
      setErrors({ submit: error.message })
    },
  })

  const handleInputChange = useCallback(
    (field: keyof FormData, value: unknown) => {
      setFormData(prev => ({ ...prev, [field]: value }))
      // Clear error for this field
      setErrors(prev => ({ ...prev, [field]: '' }))
    },
    [],
  )

  const handleSocialLinkChange = useCallback(
    (platform: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [platform]: value },
      }))
    },
    [],
  )

  const toggleSubcategory = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubcategories: prev.selectedSubcategories.includes(value)
        ? prev.selectedSubcategories.filter(v => v !== value)
        : prev.selectedSubcategories.length >= MAX_CATEGORIES
          ? prev.selectedSubcategories
          : [...prev.selectedSubcategories, value],
    }))
  }, [])

  const notifySection = useCallback(
    (section: CreateFormSection) => {
      onSectionChange?.(section)
    },
    [onSectionChange],
  )

  // Progress/score updates for header status
  useEffect(() => {
    const checks = [
      formData.title.trim().length >= MIN_TITLE_CHARS,
      formData.description.trim().length >= MIN_DESCRIPTION_CHARS,
      formData.selectedSubcategories.length > 0,
      Boolean(formData.image?.trim()),
      Boolean(formData.walletAddress?.trim()),
    ]
    const total = checks.length
    const completed = checks.filter(Boolean).length
    const score = Math.round((completed / total) * 100)
    onProgressChange?.({ score, completed, total })
  }, [formData, onProgressChange])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Project name is required'
    } else if (formData.title.length < MIN_TITLE_CHARS) {
      newErrors.title = `Project name must be at least ${MIN_TITLE_CHARS} characters`
    } else if (formData.title.length > 55) {
      newErrors.title = 'Project name must be less than 55 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < MIN_DESCRIPTION_CHARS) {
      newErrors.description = `Describe your project with at least ${MIN_DESCRIPTION_CHARS} characters`
    }

    if (!formData.walletAddress) {
      newErrors.walletAddress = 'Wallet address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      if (mode === 'edit') {
        await updateProjectMut.mutateAsync(formData)
      } else {
        await createProjectMut.mutateAsync(formData)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Use dynamic categories if available, otherwise use defaults
  const displayCategories = useMemo(() => {
    const fromMain =
      mainCategoriesData?.mainCategories
        ?.flatMap(mainCat =>
          (mainCat.categories || []).map(cat => ({
            ...cat,
            mainCategory: {
              id: mainCat.id,
              title: mainCat.title,
              slug: mainCat.slug,
            },
          })),
        )
        ?.filter(cat => cat.canUseOnFrontend && cat.isActive) || []

    const fromCategories =
      categoriesData?.categories?.filter(
        cat => cat.canUseOnFrontend && cat.isActive,
      ) || []

    return fromMain.length > 0 ? fromMain : fromCategories
  }, [categoriesData?.categories, mainCategoriesData?.mainCategories])

  const groupedCategories = useMemo(() => {
    if (mainCategoriesData?.mainCategories?.length) {
      return mainCategoriesData.mainCategories
        .map(main => ({
          title: main.title,
          categories:
            main.categories
              ?.filter(cat => cat.canUseOnFrontend && cat.isActive)
              ?.map(cat => ({
                id: cat.id,
                value: cat.value || cat.id,
                name: cat.name,
              })) || [],
        }))
        .filter(group => group.categories.length > 0)
    }

    if (displayCategories.length > 0) {
      return [
        {
          title: 'Categories',
          categories: displayCategories.map(cat => ({
            id: cat.id,
            value: cat.value || cat.id,
            name: cat.name,
          })),
        },
      ]
    }

    return []
  }, [displayCategories, mainCategoriesData?.mainCategories])

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Project Name Section */}
      <section
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        onMouseEnter={() => notifySection('name')}
        onFocus={() => notifySection('name')}
      >
        <div className="flex items-center justify-between mb-4">
          <label
            htmlFor="title"
            className="text-base font-semibold text-giv-neutral-900"
          >
            Project Name
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {formData.title.length}/55
            </span>
          </div>
        </div>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={e => handleInputChange('title', e.target.value)}
          placeholder="My Amazing Project"
          maxLength={55}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.title ? 'border-red-500' : 'border-gray-200'
          } focus:outline-none focus:ring-2 focus:ring-giv-brand-500/20 focus:border-giv-brand-500 text-giv-neutral-900`}
        />
        {errors.title && (
          <p className="mt-2 text-sm text-red-600">{errors.title}</p>
        )}
      </section>

      {/* Description Section */}
      <section
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        onMouseEnter={() => notifySection('description')}
        onFocus={() => notifySection('description')}
      >
        <label
          htmlFor="description"
          className="block text-base font-semibold text-giv-neutral-900 mb-2"
        >
          Tell us about your project...
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Aim for 200-500 words. You can also use formatting to organize your
          text.
        </p>

        {/* Rich Text Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-200 rounded-t-lg bg-gray-50">
          <ToolbarButton title="Bold">B</ToolbarButton>
          <ToolbarButton title="Italic" className="italic">
            I
          </ToolbarButton>
          <ToolbarButton title="Underline" className="underline">
            U
          </ToolbarButton>
          <ToolbarButton title="Strikethrough" className="line-through">
            S
          </ToolbarButton>
          <span className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton title="Link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </ToolbarButton>
          <ToolbarButton title="Code">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </ToolbarButton>
          <span className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton title="Bulleted List">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <circle cx="3" cy="6" r="1" fill="currentColor" />
              <circle cx="3" cy="12" r="1" fill="currentColor" />
              <circle cx="3" cy="18" r="1" fill="currentColor" />
            </svg>
          </ToolbarButton>
          <ToolbarButton title="Numbered List">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="10" y1="6" x2="21" y2="6" />
              <line x1="10" y1="12" x2="21" y2="12" />
              <line x1="10" y1="18" x2="21" y2="18" />
              <text x="3" y="8" fontSize="8" fill="currentColor">
                1
              </text>
              <text x="3" y="14" fontSize="8" fill="currentColor">
                2
              </text>
              <text x="3" y="20" fontSize="8" fill="currentColor">
                3
              </text>
            </svg>
          </ToolbarButton>
          <span className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton title="Image">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </ToolbarButton>
          <ToolbarButton title="Heading">
            <span className="text-sm font-bold">H</span>
          </ToolbarButton>
          <ToolbarButton title="Quote">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" />
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3" />
            </svg>
          </ToolbarButton>
        </div>

        <textarea
          id="description"
          value={formData.description}
          onChange={e => handleInputChange('description', e.target.value)}
          placeholder="Tell us what your project does and how it creates impact. What problem does it solve? Who benefits from it? What are your goals?"
          rows={8}
          className={`w-full px-4 py-3 border-x border-b ${
            errors.description ? 'border-red-500' : 'border-gray-200'
          } rounded-b-lg focus:outline-none focus:ring-2 focus:ring-giv-brand-500/20 focus:border-giv-brand-500 text-giv-neutral-900 resize-none`}
        />
        {errors.description && (
          <p className="mt-2 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-2 text-sm text-gray-500 text-right">
          Aim for at least {MIN_DESCRIPTION_CHARS} characters
        </p>
      </section>

      {/* Social Media Links Section */}
      <section
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        onMouseEnter={() => notifySection('social')}
        onFocus={() => notifySection('social')}
      >
        <h2 className="text-base font-semibold text-giv-neutral-900 mb-4">
          Social Media Links
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Add your project’s social media links (optional).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_PLATFORMS.map(platform => (
            <div key={platform.id} className="relative">
              <label
                htmlFor={platform.id}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {platform.label}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                  {platform.icon}
                </div>
                <input
                  type="url"
                  id={platform.id}
                  value={formData.socialLinks[platform.id] || ''}
                  onChange={e =>
                    handleSocialLinkChange(platform.id, e.target.value)
                  }
                  placeholder={platform.placeholder}
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-giv-brand-500/20 focus:border-giv-brand-500 text-sm text-giv-neutral-900"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        onMouseEnter={() => notifySection('categories')}
        onFocus={() => notifySection('categories')}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-giv-neutral-900">
            Please select a category
          </h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            {formData.selectedSubcategories.length}/{MAX_CATEGORIES} selected
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          You can choose up to {MAX_CATEGORIES} categories for your project.
        </p>

        <div className="space-y-6">
          {groupedCategories.map(group => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-sm font-semibold text-giv-neutral-900 uppercase tracking-[0.08em]">
                {group.title}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.categories.map(cat => {
                  const catValue = cat.value || cat.id
                  const isSelected =
                    !!catValue &&
                    formData.selectedSubcategories.includes(catValue)

                  return (
                    <label
                      key={`${group.title}-${cat.id}`}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                        isSelected
                          ? 'border-giv-brand-500 bg-giv-brand-050 text-giv-neutral-900'
                          : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-giv-brand-500 focus:ring-giv-brand-500"
                        checked={isSelected}
                        onChange={() => catValue && toggleSubcategory(catValue)}
                      />
                      <span className="capitalize">{cat.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Location Section */}
      <section
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        onMouseEnter={() => notifySection('location')}
        onFocus={() => notifySection('location')}
      >
        <h2 className="text-base font-semibold text-giv-neutral-900 mb-2">
          Where will your project have the most impact?
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Choose a location or select Worldwide.
        </p>

        <div className="relative">
          <select
            value={formData.impactLocation}
            onChange={e => handleInputChange('impactLocation', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-giv-brand-500/20 focus:border-giv-brand-500 text-giv-neutral-900 appearance-none bg-white"
          >
            <option value="Worldwide">🌍 Worldwide</option>
            <option value="North America">North America</option>
            <option value="South America">South America</option>
            <option value="Europe">Europe</option>
            <option value="Asia">Asia</option>
            <option value="Africa">Africa</option>
            <option value="Oceania">Oceania</option>
          </select>
          <svg
            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Map Placeholder */}
        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 h-48 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto mb-2"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <p className="text-sm">Map preview</p>
          </div>
        </div>
      </section>

      {/* Project Image Section */}
      <section
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        onMouseEnter={() => notifySection('image')}
        onFocus={() => notifySection('image')}
      >
        <h2 className="text-base font-semibold text-giv-neutral-900 mb-2">
          Add one image to your project
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          This image will be displayed on your project card. (Recommended:
          1200×675px)
        </p>

        <div className="mb-4">
          <input
            type="url"
            value={formData.image}
            onChange={e => handleInputChange('image', e.target.value)}
            placeholder="Paste image URL here (e.g., https://example.com/image.jpg)"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-giv-brand-500/20 focus:border-giv-brand-500 text-giv-neutral-900"
          />
        </div>

        {/* Image Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-giv-brand-500 transition-colors cursor-pointer">
          <svg
            className="mx-auto mb-4"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop an image, or click to browse
          </p>
          <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
        </div>

        {/* Color Presets */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            Or choose a background color:
          </p>
          <div className="flex gap-2">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => handleInputChange('imageColor', color)}
                className={`w-10 h-10 rounded-lg transition-transform ${
                  formData.imageColor === color
                    ? 'ring-2 ring-offset-2 ring-giv-brand-500 scale-110'
                    : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Receiving Funds Section */}
      <section
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        onMouseEnter={() => notifySection('addresses')}
        onFocus={() => notifySection('addresses')}
      >
        <h2 className="text-base font-semibold text-giv-neutral-900 mb-2">
          Receiving Funds
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter the wallet address where you want to receive donations.
        </p>

        <div className="relative">
          <input
            type="text"
            value={formData.walletAddress}
            onChange={e => handleInputChange('walletAddress', e.target.value)}
            placeholder="0x..."
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.walletAddress ? 'border-red-500' : 'border-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-giv-brand-500/20 focus:border-giv-brand-500 text-giv-neutral-900 font-mono text-sm`}
          />
          {account?.address && formData.walletAddress !== account.address && (
            <button
              type="button"
              onClick={() =>
                handleInputChange('walletAddress', account.address)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-giv-brand-500 hover:underline"
            >
              Use connected wallet
            </button>
          )}
        </div>
        {errors.walletAddress && (
          <p className="mt-2 text-sm text-red-600">{errors.walletAddress}</p>
        )}

        <p className="mt-2 text-xs text-gray-500">
          This address will receive all donations to your project. Make sure
          it&apos;s correct!
        </p>
      </section>

      {/* Submit Section */}
      <section
        className="bg-linear-to-r from-giv-pink-100 via-giv-brand-050 to-giv-cyan-100 rounded-xl p-6 border border-giv-brand-500/20"
        onMouseEnter={() => notifySection('publish')}
        onFocus={() => notifySection('publish')}
      >
        <h2 className="text-xl font-bold text-giv-neutral-900 mb-2">
          {mode === 'edit' ? 'Review and save' : 'Let&apos;s Publish!'}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {mode === 'edit'
            ? 'Update your project details and save when ready.'
            : 'Your project will be reviewed by our team before going live. This usually takes 1-2 business days.'}
        </p>

        {errors.submit && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {errors.submit}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              initialProject?.slug
                ? router.push(`/project/${initialProject.slug}`)
                : router.push('/')
            }
            disabled={isSubmitting}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex-1 bg-linear-to-r from-giv-pink-500 to-giv-brand-500 hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {mode === 'edit' ? 'Saving...' : 'Publishing...'}
              </>
            ) : mode === 'edit' ? (
              '💾 Save Changes'
            ) : (
              '🚀 Publish Project'
            )}
          </Button>
        </div>
      </section>
    </form>
  )
}

function ToolbarButton({
  children,
  title,
  className = '',
}: {
  children: React.ReactNode
  title: string
  className?: string
}) {
  return (
    <button
      type="button"
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 text-gray-600 ${className}`}
    >
      {children}
    </button>
  )
}
