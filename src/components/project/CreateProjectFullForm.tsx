'use client'

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useActiveAccount } from 'thirdweb/react'
import {
  formatContentForEditorLoad,
  formatContentForStorage,
} from '@/components/editor/readonlyQuillContent'
import { CategoriesSection } from '@/components/project/project-form/CategoriesSection'
import {
  globalLocation,
  ImpactLocationSection,
} from '@/components/project/project-form/ImpactLocationSection'
import { ProjectDescriptionSection } from '@/components/project/project-form/ProjectDescriptionSection'
import { ProjectImageSection } from '@/components/project/project-form/ProjectImageSection'
import { ProjectNameSection } from '@/components/project/project-form/ProjectNameSection'
import { PublishProjectSection } from '@/components/project/project-form/PublishProjectSection'
import {
  type ReceivingAddress,
  ReceivingFundsSection,
} from '@/components/project/project-form/ReceivingFundsSection'
import { SocialLinksSection } from '@/components/project/project-form/SocialLinksSection'
import { CHAINS } from '@/lib/constants/chain'
import { env } from '@/lib/env'
import { createGraphQLClient } from '@/lib/graphql/client'
import {
  ChainType,
  type CategoriesQuery,
  type MainCategoriesQuery,
  type ProjectEntity,
} from '@/lib/graphql/generated/graphql'
import { createProjectMutation } from '@/lib/graphql/mutations'
import {
  categoriesQuery,
  mainCategoriesQuery,
  updateProjectWithOptionalFieldsMutation,
} from '@/lib/graphql/queries'

const MIN_DESCRIPTION_CHARS = 1200
const MIN_TITLE_CHARS = 3

/**
 * Get the plain-text length for an HTML description.
 * @param html
 * @returns The plain-text length of the HTML description.
 * @description This function gets the plain-text length for an HTML description. It removes HTML tags, replaces special characters, and trims the result.
 */
function getDescriptionTextLength(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
  return text.length
}

/**
 * Normalize an image URL for a mutation.
 * @param image - The image to normalize.
 * @returns The normalized image URL.
 * @description This function normalizes an image URL for a mutation. It handles relative paths and ensures the image is a valid URL.
 */
function normalizeImageForMutation(image: string): string | undefined {
  const value = image.trim()
  if (!value) return undefined

  try {
    return new URL(value).toString()
  } catch {
    // Ignore and try to resolve relative paths.
  }

  if (value.startsWith('/')) {
    let base = env.FRONTEND_URL
    if (typeof window !== 'undefined') {
      const { origin, hostname } = window.location
      const isLocalhost =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1'
      base = isLocalhost ? 'https://qf.giveth.io/' : origin
    }
    try {
      return new URL(value, base).toString()
    } catch {
      return undefined
    }
  }

  return undefined
}

function mapApiSocialTypeToUi(type: string): string {
  return type === 'x' ? 'twitter' : type
}

function mapUiSocialTypeToApi(type: string): string {
  return type === 'twitter' ? 'x' : type
}

/**
 * Get a readable error message from a GraphQL error object.
 * @param error - The error object to get the readable error message from.
 * @returns The readable error message.
 */
function getReadableErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const gqlError = error as {
      message?: string
      response?: { errors?: Array<{ message?: string }> }
    }

    const firstGraphQlMessage = gqlError.response?.errors?.find(
      item => typeof item?.message === 'string' && item.message.trim(),
    )?.message
    if (firstGraphQlMessage) return firstGraphQlMessage

    if (typeof gqlError.message === 'string' && gqlError.message.trim()) {
      const compactMessage = gqlError.message.trim()
      const prefixMatch = compactMessage.match(/^([^:\n]+):\s*\{/)
      if (prefixMatch?.[1]) return prefixMatch[1]
      return compactMessage
    }
  }

  if (typeof error === 'string' && error.trim()) {
    const compactMessage = error.trim()
    const prefixMatch = compactMessage.match(/^([^:\n]+):\s*\{/)
    if (prefixMatch?.[1]) return prefixMatch[1]
    return compactMessage
  }

  return 'Something went wrong.'
}

export const MAX_CATEGORIES = 5

type Category = CategoriesQuery['categories'][number]
type MainCategory = MainCategoriesQuery['mainCategories'][number]
export type InitialProject = {
  id: string
  slug?: string
  title: string
  description: string
  image?: string | null
  impactLocation?: string | null
  addresses?:
    | {
        address?: string | null
        networkId?: number | null
        chainType?: ChainType | null
        title?: string | null
        memo?: string | null
        isRecipient?: boolean | null
      }[]
    | null
  socialMedia?:
    | {
        type?: string | null
        link?: string | null
      }[]
    | null
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
  updateProject: {
    id: string
    title: string
    description?: string | null
    image?: string | null
    impactLocation?: string | null
    updatedAt: string
    categories?: { id: string; name: string }[] | null
    addresses?:
      | {
          id: string
          address: string
          networkId: number
          title?: string | null
          memo?: string | null
          chainType: ChainType
          isRecipient: boolean
        }[]
      | null
    socialMedia?: { id: string; type: string; link: string }[] | null
  }
}

interface FormData {
  title: string
  description: string
  socialLinks: Record<string, string>
  selectedSubcategories: string[]
  impactLocation: string
  image: string
  addresses: ReceivingAddress[]
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

type SectionTips = {
  title: string
  bullets: ReactNode[]
  footer?: ReactNode
}

const FORM_SECTION_TIPS: Record<CreateFormSection, SectionTips> = {
  default: {
    title: 'Tips to Make a Great Project',
    bullets: [
      'As you go through each section, we will provide guidance to help your project stand out.',
      'Clear and specific information helps donors understand your mission faster.',
      'Take your time to provide complete details before publishing.',
    ],
  },
  name: {
    title: 'A Captivating Title',
    bullets: [
      'Keep it short and impactful so donors quickly understand your idea.',
      'Use relevant keywords that describe what your project is about.',
      'Make it unique and memorable to stand out from similar projects.',
      'Avoid jargon and overly complex phrasing.',
    ],
  },
  description: {
    title: 'Describing your Project',
    bullets: [
      'Tell an engaging story about your project and why it matters.',
      'Be specific about goals, progress, and planned impact.',
      'Add links to your website, portfolio, and relevant social channels.',
      'Include media such as videos and photos when useful.',
    ],
    footer: (
      <>
        Make sure your description aligns with our{' '}
        <a
          className="text-giv-pink-500 hover:underline"
          href="https://giveth.io/covenant"
          target="_blank"
          rel="noreferrer"
        >
          Covenant
        </a>{' '}
        or{' '}
        <a
          className="text-giv-pink-500 hover:underline"
          href="https://giveth.io/terms"
          target="_blank"
          rel="noreferrer"
        >
          Terms of Use
        </a>
        .
      </>
    ),
  },
  social: {
    title: 'Get Connected!',
    bullets: [
      'Adding social media links helps donors and community members find you.',
      'Your accounts can be linked from your project page on Giveth.',
      'We may use your public handles to reach out about fundraising support.',
    ],
  },
  categories: {
    title: 'Choose the Right Category',
    bullets: [
      'Select categories that best represent your project goals.',
      'Choose thoughtfully based on where potential donors may discover you.',
      `You can select up to ${MAX_CATEGORIES} categories.`,
    ],
  },
  location: {
    title: 'Put your Project on the Map',
    bullets: [
      'Providing location details can create a stronger personal connection.',
      'Donors often resonate with projects in regions they know well.',
      'Choose Worldwide only when your impact is truly global.',
    ],
  },
  image: {
    title: 'Adding a Banner Image',
    bullets: [
      'Choose a unique image that represents your project mission.',
      'High quality, clear visuals improve trust and attention.',
      'Use your project logo or branding only if it is legible.',
    ],
    footer: (
      <span className="text-sm text-gray-600">
        Suggested image size: <strong>1200px x 675px</strong>
      </span>
    ),
  },
  addresses: {
    title: 'Receiving Funding',
    bullets: [
      'Double-check recipient addresses so donations are not lost.',
      'Use a dedicated receiving address for this project when possible.',
      'You can update recipient addresses later if needed.',
    ],
  },
  publish: {
    title: 'Ready to Publish',
    bullets: [
      'Review all sections one more time before submitting.',
      'Ensure description, categories, image, and address are complete.',
      'A complete project has a better chance to pass review quickly.',
    ],
  },
}

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
  const queryClient = useQueryClient()
  const account = useActiveAccount()
  const parsedProjectId = initialProject?.id
    ? Number.parseInt(initialProject.id, 10)
    : undefined
  const projectId = Number.isFinite(parsedProjectId)
    ? parsedProjectId
    : undefined
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeSection, setActiveSection] = useState<CreateFormSection>('name')

  const [formData, setFormData] = useState<FormData>(() => {
    const normalizedAddresses =
      initialProject?.addresses
        ?.map(addr => {
          const normalized: ReceivingAddress = {
            address: (addr?.address || '').trim(),
            networkId:
              typeof addr?.networkId === 'number'
                ? addr.networkId
                : Object.values(CHAINS)[0].id,
            chainType: addr?.chainType || ChainType.Evm,
          }
          if (addr?.title) normalized.title = addr.title
          if (addr?.memo) normalized.memo = addr.memo
          if (typeof addr?.isRecipient === 'boolean') {
            normalized.isRecipient = addr.isRecipient
          }
          return normalized
        })
        ?.filter(
          (addr): addr is ReceivingAddress =>
            Boolean(addr.address) && Boolean(addr.networkId),
        ) || []

    const dedupedByNetwork = Array.from(
      normalizedAddresses.reduce(
        (acc, curr) => acc.set(curr.networkId, curr),
        new Map<number, ReceivingAddress>(),
      ),
    ).map(([, value]) => value)

    const addresses =
      dedupedByNetwork.length > 0
        ? dedupedByNetwork
        : account?.address
          ? [
              {
                address: account.address,
                networkId: Object.values(CHAINS)[0].id,
                chainType: ChainType.Evm,
              },
            ]
          : []

    return {
      title: initialProject?.title || '',
      description: formatContentForEditorLoad(
        initialProject?.description || '',
      ),
      socialLinks: Object.fromEntries(
        (initialProject?.socialMedia || [])
          .map(item => [
            mapApiSocialTypeToUi(item?.type || ''),
            item?.link || '',
          ])
          .filter(([type, link]) => Boolean(type && link)),
      ),
      selectedSubcategories:
        initialProject?.categories
          ?.map(cat => cat?.value || cat?.id || cat?.name || '')
          ?.filter(Boolean as unknown as (v: string) => v is string) || [],
      impactLocation: initialProject?.impactLocation || globalLocation,
      image: initialProject?.image || '',
      addresses,
    }
  })

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const client = createGraphQLClient()
      return client.request<{ categories: Category[] }>(categoriesQuery)
    },
  })

  // Fetch main categories from API
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

      const addresses = data.addresses
        .map(address => ({
          ...address,
          address: address.address.trim(),
        }))
        .filter(address => Boolean(address.address))
      const image = normalizeImageForMutation(data.image)
      const description = formatContentForStorage(data.description)

      const variables = {
        input: {
          title: data.title,
          description,
          impactLocation: data.impactLocation || null,
          image,
          categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
          addresses: addresses.length > 0 ? addresses : undefined,
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
      setErrors({ submit: getReadableErrorMessage(error) })
    },
  })

  const updateProjectMut = useMutation<UpdateProjectResponse, Error, FormData>({
    mutationFn: async (data: FormData) => {
      if (!initialProject?.id) {
        throw new Error('Missing project id')
      }
      const projectId = parseInt(initialProject.id)
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

      const normalizedAddresses = data.addresses
        .map(address => ({
          address: address.address.trim(),
          networkId: address.networkId,
          chainType: address.chainType || ChainType.Evm,
          title: address.title?.trim() || undefined,
          memo: address.memo?.trim() || undefined,
        }))
        .filter(address => Boolean(address.address))

      const socialMedia = Object.entries(data.socialLinks)
        .map(([type, link]) => ({
          type: mapUiSocialTypeToApi(type.trim()),
          link: link.trim(),
        }))
        .filter(item => Boolean(item.type && item.link))
      const image = normalizeImageForMutation(data.image)
      const description = formatContentForStorage(data.description)

      const variables = {
        projectId,
        input: {
          title: data.title,
          description,
          impactLocation: data.impactLocation || null,
          image,
          categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
          addresses: normalizedAddresses,
          socialMedia,
        },
      }

      try {
        const response = await client.request<UpdateProjectResponse>(
          updateProjectWithOptionalFieldsMutation,
          variables,
        )
        return response
      } catch (error) {
        console.error('[Project Save Debug] updateProject error', error)
        throw error
      }
    },
    onSuccess: async () => {
      const slug = initialProject?.slug
      if (slug) {
        queryClient.removeQueries({
          queryKey: ['projectBySlug', slug],
        })
        router.push(`/project/${slug}`)
      } else {
        router.push('/')
      }
    },
    onError: error => {
      console.error('Error updating project:', error)
      setErrors({ submit: getReadableErrorMessage(error) })
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
      setActiveSection(section)
      onSectionChange?.(section)
    },
    [onSectionChange],
  )

  const currentTips =
    FORM_SECTION_TIPS[activeSection] || FORM_SECTION_TIPS.default

  // Progress/score updates for header status
  useEffect(() => {
    const checks = [
      formData.title.trim().length >= MIN_TITLE_CHARS,
      getDescriptionTextLength(formData.description) >= MIN_DESCRIPTION_CHARS,
      formData.selectedSubcategories.length > 0,
      Boolean(formData.image?.trim()),
      formData.addresses.some(address => Boolean(address.address?.trim())),
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

    const descTextLen = getDescriptionTextLength(formData.description)
    if (!formData.description.trim() || descTextLen === 0) {
      newErrors.description = 'Description is required'
    } else if (descTextLen < MIN_DESCRIPTION_CHARS) {
      newErrors.description = `Describe your project with at least ${MIN_DESCRIPTION_CHARS} characters`
    }

    if (!formData.addresses.some(address => Boolean(address.address?.trim()))) {
      newErrors.addresses = 'At least one receiving address is required'
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
    <form onSubmit={handleSubmit}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-giv-neutral-900 mb-8">
            {mode === 'edit' ? 'Edit Project' : 'Create Project'}
          </h2>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="space-y-8">
              <ProjectNameSection
                title={formData.title}
                error={errors.title}
                onTitleChange={value => handleInputChange('title', value)}
                onActivate={() => notifySection('name')}
              />

              <ProjectDescriptionSection
                description={formData.description}
                error={errors.description}
                minDescriptionChars={MIN_DESCRIPTION_CHARS}
                onDescriptionChange={value =>
                  handleInputChange('description', value)
                }
                onActivate={() => notifySection('description')}
              />

              <SocialLinksSection
                socialLinks={formData.socialLinks}
                onSocialLinkChange={handleSocialLinkChange}
                onActivate={() => notifySection('social')}
              />

              <CategoriesSection
                groupedCategories={groupedCategories}
                selectedSubcategories={formData.selectedSubcategories}
                maxCategories={MAX_CATEGORIES}
                onToggleSubcategory={toggleSubcategory}
                onActivate={() => notifySection('categories')}
              />

              <ImpactLocationSection
                impactLocation={formData.impactLocation}
                onImpactLocationChange={value =>
                  handleInputChange('impactLocation', value)
                }
                onActivate={() => notifySection('location')}
              />

              <ProjectImageSection
                image={formData.image}
                onImageChange={value => handleInputChange('image', value)}
                onActivate={() => notifySection('image')}
              />

              <ReceivingFundsSection
                projectId={projectId}
                addresses={formData.addresses}
                connectedAddress={account?.address}
                error={errors.addresses}
                onAddressesChange={value =>
                  handleInputChange('addresses', value)
                }
                onActivate={() => notifySection('addresses')}
              />

              <PublishProjectSection
                mode={mode}
                isSubmitting={isSubmitting}
                submitError={errors.submit}
                onCancel={() =>
                  initialProject?.slug
                    ? router.push(`/project/${initialProject.slug}`)
                    : router.push('/')
                }
                onActivate={() => notifySection('publish')}
              />
            </div>

            <aside className="lg:sticky lg:top-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-xl" aria-hidden>
                    💡
                  </span>
                  <h3 className="text-xl font-semibold text-giv-neutral-900">
                    {currentTips.title}
                  </h3>
                </div>

                <div className="space-y-4">
                  {currentTips.bullets.map((tip, idx) => (
                    <div
                      key={`${activeSection}-${idx}`}
                      className="flex items-start gap-3"
                    >
                      <span
                        className="mt-2 h-2 w-2 rounded-full bg-giv-brand-500"
                        aria-hidden
                      />
                      <p className="text-base leading-7 text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>

                {currentTips.footer && (
                  <div className="mt-6 border-t border-gray-200 pt-4 text-base leading-7 text-gray-700">
                    {currentTips.footer}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </form>
  )
}
