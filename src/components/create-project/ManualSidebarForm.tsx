'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useActiveAccount, useActiveWallet } from 'thirdweb/react'
import { ImpactLocationAutocomplete } from '@/components/create-project/ImpactLocationAutocomplete'
import { MAX_CATEGORIES } from '@/components/project/CreateProjectFullForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSiweAuth } from '@/context/AuthContext'
import {
  validateCreateProjectRecipientAddressesRemotely,
  validateCreateProjectTitleRemotely,
} from '@/lib/create-project/backend-validation'
import {
  CREATE_PROJECT_SOCIAL_FIELDS,
  type CreateProjectRecipientAddress,
} from '@/lib/create-project/types'
import {
  isLikelyEnsName,
  validateCreateProjectDescription,
  validateCreateProjectImage,
  validateCreateProjectRecipientAddress,
  validateCreateProjectSocialLink,
  validateCreateProjectTitle,
} from '@/lib/create-project/validation'
import { createGraphQLClient } from '@/lib/graphql/client'
import {
  type CategoriesQuery,
  type MainCategoriesQuery,
} from '@/lib/graphql/generated/graphql'
import { mainCategoriesQuery } from '@/lib/graphql/queries'
import { uploadImageFile } from '@/lib/graphql/upload'
import {
  createProjectAccountSalt,
  deriveProjectOwnerRecipientAddresses,
  resolveProjectOwnerAdminAccount,
} from '@/lib/thirdweb/project-owner-wallet'
import { cn } from '@/lib/utils'
import {
  useCreateProjectDraftStore,
  validateCreateProjectDraft,
  type CreateProjectChainType,
  type CreateProjectSocialType,
} from '@/stores/createProjectDraft.store'

type FormSectionKey =
  | 'projectDetails'
  | 'categories'
  | 'social'
  | 'location'
  | 'image'
  | 'funds'

type Category = CategoriesQuery['categories'][number]
type MainCategory = MainCategoriesQuery['mainCategories'][number]

const MANUAL_FIELD_BASE_CLASSES =
  'rounded-md border-[#D7DDEA] bg-white shadow-none focus-visible:border-[#B9A7FF] focus-visible:ring-0 focus-visible:shadow-[0px_0px_0px_4px_#F4EBFF,0px_1px_2px_0px_#0A0D120D]'
const MANUAL_TEXTAREA_CLASSES =
  'min-h-28 w-full resize-none rounded-md border border-[#D7DDEA] bg-white px-3 py-2 text-sm text-[#111827] shadow-none outline-none transition-[border-color,box-shadow] placeholder:text-[#9ca3af] focus-visible:border-[#B9A7FF] focus-visible:ring-0 focus-visible:shadow-[0px_0px_0px_4px_#F4EBFF,0px_1px_2px_0px_#0A0D120D]'

const normalizeTitleForSalt = (title: string) =>
  title.trim().toLowerCase().replace(/\s+/g, ' ')

type RemoteRecipientValidationState = {
  errors: Record<string, string>
  resolvedAddresses: Record<string, string>
}

export function ManualSidebarForm() {
  const router = useRouter()
  const { token } = useSiweAuth()
  const [openSections, setOpenSections] = useState<
    Record<FormSectionKey, boolean>
  >({
    projectDetails: false,
    categories: false,
    social: false,
    location: false,
    image: false,
    funds: false,
  })
  const activeAccount = useActiveAccount()
  const activeWallet = useActiveWallet()
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isAutofillingRecipients, setIsAutofillingRecipients] = useState(false)
  const [recipientSetupError, setRecipientSetupError] = useState<string | null>(
    null,
  )
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [titleValidationError, setTitleValidationError] = useState<
    string | null
  >(null)
  const [isTitleValidating, setIsTitleValidating] = useState(false)
  const [recipientValidation, setRecipientValidation] =
    useState<RemoteRecipientValidationState>({
      errors: {},
      resolvedAddresses: {},
    })
  const [isRecipientValidating, setIsRecipientValidating] = useState(false)
  const imageFileInputRef = useRef<HTMLInputElement | null>(null)
  const pendingProjectSaltRef = useRef<string | null>(null)
  const titleValidationRequestRef = useRef(0)
  const recipientValidationRequestRef = useRef(0)

  const draft = useCreateProjectDraftStore(s => s.draft)
  const errors = useCreateProjectDraftStore(s => s.errors)
  const isSubmitting = useCreateProjectDraftStore(s => s.isSubmitting)
  const isRecipientAddressesAutoFilled = useCreateProjectDraftStore(
    s => s.isRecipientAddressesAutoFilled,
  )
  const submitError = useCreateProjectDraftStore(s => s.submitError)
  const setTitle = useCreateProjectDraftStore(s => s.setTitle)
  const setDescription = useCreateProjectDraftStore(s => s.setDescription)
  const setImage = useCreateProjectDraftStore(s => s.setImage)
  const setImpactLocation = useCreateProjectDraftStore(s => s.setImpactLocation)
  const setCategoryIds = useCreateProjectDraftStore(s => s.setCategoryIds)
  const setSocialLink = useCreateProjectDraftStore(s => s.setSocialLink)
  const addRecipientAddress = useCreateProjectDraftStore(
    s => s.addRecipientAddress,
  )
  const updateRecipientAddress = useCreateProjectDraftStore(
    s => s.updateRecipientAddress,
  )
  const removeRecipientAddress = useCreateProjectDraftStore(
    s => s.removeRecipientAddress,
  )
  const setRecipientAddresses = useCreateProjectDraftStore(
    s => s.setRecipientAddresses,
  )
  const validate = useCreateProjectDraftStore(s => s.validate)
  const submitCreateProject = useCreateProjectDraftStore(
    s => s.submitCreateProject,
  )

  const liveErrors = useMemo(() => validateCreateProjectDraft(draft), [draft])
  const ownerAdminAccount = useMemo(
    () => resolveProjectOwnerAdminAccount(activeWallet, activeAccount),
    [activeWallet, activeAccount],
  )
  const normalizedTitleForSalt = normalizeTitleForSalt(draft.title)
  const recipientValidationSignature = useMemo(
    () =>
      draft.recipientAddresses
        .map(recipientAddress =>
          [
            recipientAddress.id,
            recipientAddress.chainType,
            recipientAddress.networkId,
            recipientAddress.address.trim(),
            recipientAddress.memo?.trim() || '',
          ].join(':'),
        )
        .join('|'),
    [draft.recipientAddresses],
  )
  const titleErrorMessage = useMemo(
    () =>
      errors.title ||
      titleValidationError ||
      (draft.title.trim() ? liveErrors.title : undefined),
    [draft.title, errors.title, liveErrors.title, titleValidationError],
  )
  const descriptionErrorMessage = useMemo(
    () =>
      errors.description ||
      (draft.description.trim() ? liveErrors.description : undefined),
    [draft.description, errors.description, liveErrors.description],
  )
  const imageErrorMessage = useMemo(
    () => errors.image || (draft.image.trim() ? liveErrors.image : undefined),
    [draft.image, errors.image, liveErrors.image],
  )
  const recipientErrorMessage = useMemo(
    () =>
      errors.recipientAddresses ||
      (draft.recipientAddresses.length
        ? liveErrors.recipientAddresses
        : undefined),
    [
      draft.recipientAddresses.length,
      errors.recipientAddresses,
      liveErrors.recipientAddresses,
    ],
  )
  const hasRecipientAsyncErrors =
    Object.keys(recipientValidation.errors).length > 0
  const canPublish =
    Object.keys(liveErrors).length === 0 &&
    !titleValidationError &&
    !hasRecipientAsyncErrors &&
    !isTitleValidating &&
    !isRecipientValidating

  const autofillRecipientAddresses = useCallback(async () => {
    if (!ownerAdminAccount) return

    const salt = createProjectAccountSalt(
      `${ownerAdminAccount.address.toLowerCase()}:${normalizedTitleForSalt}`,
    )

    if (
      draft.recipientAddresses.length > 0 &&
      isRecipientAddressesAutoFilled &&
      pendingProjectSaltRef.current === salt
    )
      return

    pendingProjectSaltRef.current = salt
    setIsAutofillingRecipients(true)
    setRecipientSetupError(null)

    try {
      // This is provisional, I'll add a more robust solution later.
      // (i.e., reserving the id for the auto-filled addresses and using the project identity as the salt
      // so that the salt is both unique & constructed from the project identity for each project)
      const addresses = await deriveProjectOwnerRecipientAddresses({
        adminAccount: ownerAdminAccount,
        accountSalt: salt,
      })

      setRecipientAddresses(
        addresses.map(a => ({
          id: `autofill-${a.networkId}`,
          chainType: a.chainType,
          networkId: a.networkId,
          address: a.address,
          title: a.title,
        })),
        { autoFilled: true },
      )
    } catch (error) {
      console.error('Recipient auto-fill failed:', error)
      setRecipientSetupError(
        'Could not auto-fill recipient addresses. You can enter them manually.',
      )
    } finally {
      setIsAutofillingRecipients(false)
    }
  }, [
    draft.recipientAddresses.length,
    isRecipientAddressesAutoFilled,
    normalizedTitleForSalt,
    ownerAdminAccount,
    setRecipientAddresses,
  ])

  useEffect(() => {
    // Only auto-fill the initial empty state. After that, the user can
    // explicitly regenerate addresses, but title edits should not silently
    // mutate recipient addresses or trigger recipient re-validation.
    if (!ownerAdminAccount) return
    if (!normalizedTitleForSalt) return
    if (draft.recipientAddresses.length > 0) return
    void autofillRecipientAddresses()
  }, [
    autofillRecipientAddresses,
    draft.recipientAddresses.length,
    normalizedTitleForSalt,
    ownerAdminAccount,
  ])

  const runRemoteTitleValidation = useCallback(async (title: string) => {
    if (validateCreateProjectTitle(title)) return undefined
    return validateCreateProjectTitleRemotely(title.trim())
  }, [])

  const runRemoteRecipientValidation = useCallback(
    async (addresses: CreateProjectRecipientAddress[]) => {
      return validateCreateProjectRecipientAddressesRemotely(
        addresses.filter(
          recipientAddress =>
            !validateCreateProjectRecipientAddress(recipientAddress),
        ),
      )
    },
    [],
  )

  useEffect(() => {
    const title = draft.title.trim()
    const localTitleError = validateCreateProjectTitle(draft.title)
    titleValidationRequestRef.current += 1
    const requestId = titleValidationRequestRef.current

    if (!title || localTitleError) {
      setIsTitleValidating(false)
      setTitleValidationError(null)
      return
    }

    setIsTitleValidating(true)

    const timeoutId = window.setTimeout(() => {
      void runRemoteTitleValidation(title)
        .then(error => {
          if (titleValidationRequestRef.current !== requestId) return
          setTitleValidationError(error ?? null)
        })
        .finally(() => {
          if (titleValidationRequestRef.current !== requestId) return
          setIsTitleValidating(false)
        })
    }, 3000)

    return () => window.clearTimeout(timeoutId)
  }, [draft.title, runRemoteTitleValidation])

  useEffect(() => {
    const addresses = draft.recipientAddresses
    recipientValidationRequestRef.current += 1
    const requestId = recipientValidationRequestRef.current

    if (!addresses.length) {
      setIsRecipientValidating(false)
      setRecipientValidation({ errors: {}, resolvedAddresses: {} })
      return
    }

    if (
      addresses.every(recipientAddress =>
        Boolean(validateCreateProjectRecipientAddress(recipientAddress)),
      )
    ) {
      setIsRecipientValidating(false)
      setRecipientValidation({ errors: {}, resolvedAddresses: {} })
      return
    }

    const timeoutId = window.setTimeout(() => {
      setIsRecipientValidating(true)
      void runRemoteRecipientValidation(addresses)
        .then(nextValidation => {
          if (recipientValidationRequestRef.current !== requestId) return
          setRecipientValidation(nextValidation)
        })
        .finally(() => {
          if (recipientValidationRequestRef.current !== requestId) return
          setIsRecipientValidating(false)
        })
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [recipientValidationSignature, runRemoteRecipientValidation])

  const { data: mainCategoriesData } = useQuery({
    queryKey: ['mainCategories'],
    queryFn: async () => {
      const client = createGraphQLClient()
      return client.request<{ mainCategories: MainCategory[] }>(
        mainCategoriesQuery,
      )
    },
  })

  const groupedCategories = useMemo(() => {
    const groups =
      mainCategoriesData?.mainCategories
        ?.map(main => ({
          title: main.title,
          categories:
            main.categories
              ?.filter(cat => cat.canUseOnFrontend && cat.isActive)
              ?.map((cat: Category) => ({
                id: Number(cat.id),
                name: cat.name,
              })) || [],
        }))
        .filter(group => group.categories.length > 0) || []

    return groups
  }, [mainCategoriesData?.mainCategories])

  const sectionStatus = {
    projectDetails:
      !validateCreateProjectTitle(draft.title) &&
      !validateCreateProjectDescription(draft.description) &&
      !titleValidationError
        ? 'Completed'
        : 'To do',
    categories: draft.categoryIds.length > 0 ? 'Completed' : 'To do',
    social: hasValidSocialSection(draft.socialMedia) ? 'Completed' : 'To do',
    location: draft.impactLocation.trim() ? 'Completed' : 'To do',
    image:
      draft.image.trim() && !validateCreateProjectImage(draft.image)
        ? 'Completed'
        : 'To do',
    funds:
      draft.recipientAddresses.length > 0 &&
      draft.recipientAddresses.every(
        recipientAddress =>
          !validateCreateProjectRecipientAddress(recipientAddress),
      ) &&
      !hasRecipientAsyncErrors
        ? 'Completed'
        : 'To do',
  } as const

  const toggleSection = (key: FormSectionKey) =>
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))

  const handlePublish = useCallback(async () => {
    const ok = validate()
    if (!ok) return

    setIsTitleValidating(true)
    setIsRecipientValidating(true)

    const [nextTitleValidationError, nextRecipientValidation] =
      await Promise.all([
        runRemoteTitleValidation(draft.title),
        runRemoteRecipientValidation(draft.recipientAddresses),
      ])

    setIsTitleValidating(false)
    setIsRecipientValidating(false)
    setTitleValidationError(nextTitleValidationError ?? null)
    setRecipientValidation(nextRecipientValidation)

    if (
      nextTitleValidationError ||
      Object.keys(nextRecipientValidation.errors).length > 0
    ) {
      return
    }

    try {
      const { slug } = await submitCreateProject({
        draft: {
          ...draft,
          recipientAddresses: draft.recipientAddresses.map(
            recipientAddress => ({
              ...recipientAddress,
              address:
                nextRecipientValidation.resolvedAddresses[
                  recipientAddress.id
                ] ?? recipientAddress.address,
            }),
          ),
        },
      })

      router.push(`/project/${slug}`)
    } catch {
      const [nextTitleValidationError, nextRecipientValidation] =
        await Promise.all([
          runRemoteTitleValidation(draft.title),
          runRemoteRecipientValidation(draft.recipientAddresses),
        ])

      setTitleValidationError(nextTitleValidationError ?? null)
      setRecipientValidation(nextRecipientValidation)
    }
  }, [
    draft,
    router,
    runRemoteRecipientValidation,
    runRemoteTitleValidation,
    submitCreateProject,
    validate,
  ])

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 py-5">
        <div className="text-[30px] font-semibold leading-tight text-[#374151]">
          Create a project
        </div>
        <div className="mt-2 text-sm text-[#6b7280]">
          You can enter manually or let Giveth AI fill the form for you.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        <div className="space-y-3">
          <FormSection
            title="Project details"
            subtitle="Start by telling what is your project"
            status={sectionStatus.projectDetails}
            isOpen={openSections.projectDetails}
            onToggle={() => toggleSection('projectDetails')}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#374151]">
                Project name
              </label>
              <Input
                value={draft.title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter project name"
                maxLength={55}
                aria-invalid={Boolean(titleErrorMessage)}
                className={MANUAL_FIELD_BASE_CLASSES}
              />
              <p className="text-xs text-[#9ca3af]">3-55 characters</p>
              {isTitleValidating && (
                <p className="text-xs font-medium text-[#7c6af2]">
                  Checking title availability...
                </p>
              )}
              {titleErrorMessage && (
                <p className="text-xs font-medium text-red-600">
                  {titleErrorMessage}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#374151]">
                Project description
              </label>
              <textarea
                className={MANUAL_TEXTAREA_CLASSES}
                placeholder="Enter a description..."
                value={draft.description}
                onChange={e => setDescription(e.target.value)}
                aria-invalid={Boolean(descriptionErrorMessage)}
              />
              <p className="text-xs text-[#9ca3af]">
                Provide at least 1200 characters.
              </p>
              {descriptionErrorMessage && (
                <p className="text-xs font-medium text-red-600">
                  {descriptionErrorMessage}
                </p>
              )}
            </div>
          </FormSection>

          <FormSection
            title="Select a category"
            subtitle="You can choose up to 5 categories for your project"
            status={sectionStatus.categories}
            isOpen={openSections.categories}
            onToggle={() => toggleSection('categories')}
          >
            <div className="space-y-4">
              {groupedCategories.map(group => (
                <div key={group.title} className="space-y-2">
                  <div className="text-xs font-semibold tracking-[0.08em] text-[#6b7280]">
                    {group.title}
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {group.categories.map(cat => {
                      const checked = draft.categoryIds.includes(cat.id)
                      const atLimit =
                        !checked && draft.categoryIds.length >= MAX_CATEGORIES
                      return (
                        <label
                          key={`${group.title}-${cat.id}`}
                          className={cn(
                            'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
                            checked
                              ? 'border-[#7c6af2] bg-[#f5f3ff] text-[#2f2f46]'
                              : 'border-[#e5e7eb] bg-white text-[#4b5563]',
                            atLimit && 'opacity-60',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={atLimit}
                            className="size-4 rounded border border-gray-300 bg-white accent-[#7c6af2] focus:ring-[#7c6af2] flex-shrink-0"
                            style={{ colorScheme: 'light' }}
                            onChange={() => {
                              if (checked) {
                                setCategoryIds(
                                  draft.categoryIds.filter(id => id !== cat.id),
                                )
                              } else if (
                                draft.categoryIds.length < MAX_CATEGORIES
                              ) {
                                setCategoryIds([...draft.categoryIds, cat.id])
                              }
                            }}
                          />
                          <span>{cat.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
              {errors.categoryIds && (
                <p className="text-xs font-medium text-red-600">
                  {errors.categoryIds}
                </p>
              )}
            </div>
          </FormSection>

          <FormSection
            title="Social media links"
            subtitle="Add your project’s social media links"
            status={sectionStatus.social}
            isOpen={openSections.social}
            onToggle={() => toggleSection('social')}
          >
            <div className="space-y-3">
              {CREATE_PROJECT_SOCIAL_FIELDS.map(item => {
                const socialError =
                  errors[`socialMedia.${item.key}`] ||
                  (draft.socialMedia.find(s => s.type === item.key)?.link.trim()
                    ? liveErrors[`socialMedia.${item.key}`]
                    : undefined)

                return (
                  <div key={item.key} className="space-y-1">
                    <label className="text-xs font-medium text-[#374151]">
                      {item.label}
                    </label>
                    <Input
                      value={
                        draft.socialMedia.find(s => s.type === item.key)
                          ?.link || ''
                      }
                      onChange={e => setSocialLink(item.key, e.target.value)}
                      placeholder={item.placeholder}
                      aria-invalid={Boolean(socialError)}
                      className={MANUAL_FIELD_BASE_CLASSES}
                    />
                    {socialError && (
                      <p className="text-xs font-medium text-red-600">
                        {socialError}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </FormSection>

          <FormSection
            title="Project impact location"
            subtitle="Make it easier for donors to find your project by providing a location"
            status={sectionStatus.location}
            isOpen={openSections.location}
            onToggle={() => toggleSection('location')}
          >
            <ImpactLocationAutocomplete
              value={draft.impactLocation}
              onChange={setImpactLocation}
              disabled={isSubmitting}
            />
            <p className="text-xs text-[#9ca3af]">
              Search places for a city, region, country, or choose worldwide.
            </p>
          </FormSection>

          <FormSection
            title="Cover image"
            subtitle="Displayed in the header of the project page"
            status={sectionStatus.image}
            isOpen={openSections.image}
            onToggle={() => toggleSection('image')}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={draft.image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="https://..."
                  aria-invalid={Boolean(imageErrorMessage)}
                  className={MANUAL_FIELD_BASE_CLASSES}
                />
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingImage || isSubmitting}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (!file) return

                    setImageUploadError(null)
                    if (!file.type.startsWith('image/')) {
                      setImageUploadError('Please choose an image file.')
                      return
                    }
                    if (file.size > 10 * 1024 * 1024) {
                      setImageUploadError('Image is too large (max 10MB).')
                      return
                    }

                    setIsUploadingImage(true)
                    uploadImageFile({ file, token })
                      .then(url => setImage(url))
                      .catch(err => {
                        setImageUploadError(
                          err instanceof Error
                            ? err.message
                            : 'Image upload failed',
                        )
                      })
                      .finally(() => setIsUploadingImage(false))
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 shrink-0 rounded-md bg-[#f3f2ff] px-3 text-xs font-semibold text-[#5f4cf0] hover:bg-[#ebe9ff]"
                  disabled={isUploadingImage || isSubmitting}
                  onClick={() => imageFileInputRef.current?.click()}
                >
                  {isUploadingImage ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
              {imageUploadError && (
                <p className="text-xs font-medium text-red-600">
                  {imageUploadError}
                </p>
              )}
              {imageErrorMessage && (
                <p className="text-xs font-medium text-red-600">
                  {imageErrorMessage}
                </p>
              )}
            </div>
          </FormSection>

          <FormSection
            title="Receiving funds"
            subtitle="You can set a custom Ethereum address or ENS to receive donations."
            status={sectionStatus.funds}
            isOpen={openSections.funds}
            onToggle={() => toggleSection('funds')}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="text-xs font-semibold text-[#7c6af2] hover:text-[#5f4cf0] disabled:text-[#b8b4e7]"
                  onClick={() => void autofillRecipientAddresses()}
                  disabled={isAutofillingRecipients || !ownerAdminAccount}
                >
                  {isAutofillingRecipients
                    ? 'Generating...'
                    : 'Regenerate from wallet'}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#7c6af2] hover:text-[#5f4cf0]"
                  onClick={() => addRecipientAddress()}
                >
                  <Plus className="size-4" />
                  Add address
                </button>
              </div>

              {isRecipientAddressesAutoFilled && (
                <div className="rounded-xl border border-giv-brand-100 bg-giv-brand-05 px-3 py-2 text-xs text-giv-brand-600">
                  Recipient addresses are auto-generated from your Thirdweb
                  owner wallet. A unique per-project smart account is finalized
                  after publishing.
                </div>
              )}
              {recipientSetupError && (
                <p className="text-xs font-medium text-red-600">
                  {recipientSetupError}
                </p>
              )}
              {isRecipientValidating && draft.recipientAddresses.length > 0 && (
                <p className="text-xs font-medium text-[#7c6af2]">
                  Validating recipient addresses...
                </p>
              )}

              {draft.recipientAddresses.length === 0 ? (
                <div className="rounded-md border border-[#eef0f7] bg-[#fbfbff] px-4 py-3 text-sm text-[#6b7280]">
                  Add at least one recipient address (EVM, Solana, or Stellar).
                </div>
              ) : (
                <div className="space-y-3">
                  {draft.recipientAddresses.map(addr => {
                    const localRecipientError =
                      validateCreateProjectRecipientAddress(addr)
                    const remoteRecipientError =
                      recipientValidation.errors[addr.id]
                    const resolvedRecipientAddress =
                      recipientValidation.resolvedAddresses[addr.id]

                    return (
                      <div
                        key={addr.id}
                        className="rounded-md border border-[#eef0f7] bg-white p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <select
                              className="h-9 rounded-md border border-[#D7DDEA] bg-white px-2 text-xs text-[#111827] shadow-none outline-none transition-[border-color,box-shadow] focus-visible:border-[#B9A7FF] focus-visible:ring-0 focus-visible:shadow-[0px_0px_0px_4px_#F4EBFF,0px_1px_2px_0px_#0A0D120D]"
                              value={addr.chainType}
                              onChange={e =>
                                updateRecipientAddress(addr.id, {
                                  chainType: e.target
                                    .value as CreateProjectChainType,
                                })
                              }
                            >
                              <option value="EVM">EVM</option>
                              <option value="SOLANA">Solana</option>
                              <option value="STELLAR">Stellar</option>
                            </select>
                            <Input
                              className={cn(
                                MANUAL_FIELD_BASE_CLASSES,
                                'h-9 w-24 text-xs',
                              )}
                              inputMode="numeric"
                              value={String(addr.networkId)}
                              onChange={e =>
                                updateRecipientAddress(addr.id, {
                                  networkId: Number(e.target.value || 0),
                                })
                              }
                              placeholder="Network"
                            />
                          </div>
                          <button
                            type="button"
                            className="inline-flex size-9 items-center justify-center rounded-md border border-[#eef0f7] text-[#9ca3af] hover:text-red-600"
                            onClick={() => removeRecipientAddress(addr.id)}
                            aria-label="Remove address"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        <div className="mt-2 space-y-2">
                          <Input
                            className={MANUAL_FIELD_BASE_CLASSES}
                            value={addr.address}
                            onChange={e =>
                              updateRecipientAddress(addr.id, {
                                address: e.target.value,
                              })
                            }
                            placeholder={
                              addr.chainType === 'EVM'
                                ? '0x...'
                                : addr.chainType === 'SOLANA'
                                  ? 'Solana address'
                                  : 'G...'
                            }
                          />
                          {addr.chainType === 'EVM' &&
                            isLikelyEnsName(addr.address) && (
                              <p className="text-xs text-[#6b7280]">
                                ENS names are resolved on Ethereum mainnet
                                before publishing.
                              </p>
                            )}
                          {addr.chainType === 'STELLAR' && (
                            <Input
                              className={MANUAL_FIELD_BASE_CLASSES}
                              value={addr.memo || ''}
                              onChange={e =>
                                updateRecipientAddress(addr.id, {
                                  memo: e.target.value,
                                })
                              }
                              placeholder="Memo (optional)"
                            />
                          )}
                          {localRecipientError && (
                            <p className="text-xs font-medium text-red-600">
                              {localRecipientError}
                            </p>
                          )}
                          {!localRecipientError && remoteRecipientError && (
                            <p className="text-xs font-medium text-red-600">
                              {remoteRecipientError}
                            </p>
                          )}
                          {!localRecipientError &&
                            !remoteRecipientError &&
                            resolvedRecipientAddress &&
                            resolvedRecipientAddress.toLowerCase() !==
                              addr.address.trim().toLowerCase() && (
                              <p className="text-xs text-[#1b7a42]">
                                Resolved to {resolvedRecipientAddress}
                              </p>
                            )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {recipientErrorMessage && (
                <p className="text-xs font-medium text-red-600">
                  {recipientErrorMessage}
                </p>
              )}
            </div>
          </FormSection>
        </div>
      </div>

      <div className="p-6">
        {submitError && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {submitError}
          </div>
        )}
        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting || isAutofillingRecipients || !canPublish}
          className="w-full rounded-xl bg-[#edeefe] text-[#3b2ed0] hover:bg-[#e4e6ff] disabled:bg-[#edeefe] disabled:text-[#9aa0bd] disabled:hover:bg-[#edeefe]"
          onClick={() => void handlePublish()}
        >
          {isSubmitting ? 'Publishing…' : 'Publish Project'}
        </Button>
      </div>
    </div>
  )
}

function hasValidSocialSection(
  socialMedia: { type: CreateProjectSocialType; link: string }[],
): boolean {
  return socialMedia.some(
    socialLink =>
      socialLink.link.trim() &&
      !validateCreateProjectSocialLink(socialLink.type, socialLink.link),
  )
}

function FormSection({
  title,
  subtitle,
  status,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  subtitle: string
  status: 'Completed' | 'To do'
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <section className="rounded-md border border-[#ececf4] bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-[#4b5563]">
              {title}
            </span>
            <span
              className={cn(
                'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                status === 'Completed'
                  ? 'bg-[#e6f7ec] text-[#1b7a42]'
                  : 'bg-[#f1f3f8] text-[#8a90a3]',
              )}
            >
              {status}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#6b7280]">{subtitle}</p>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-[#7c6af2]">
          {isOpen ? 'Hide' : 'Show'}
          <ChevronDown
            className={cn(
              'size-4 transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
          />
        </div>
      </button>

      <div
        className={cn(
          'grid transition-all duration-300 ease-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-[#f0f1f7] px-4 pb-4 pt-4">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
