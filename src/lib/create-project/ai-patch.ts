import type {
  CreateProjectDraft,
  CreateProjectRecipientAddress,
  CreateProjectSocialLink,
} from '@/lib/create-project/types'

export type CreateProjectAiOverwriteField =
  | 'title'
  | 'description'
  | 'image'
  | 'impactLocation'
  | 'categoryIds'
  | 'socialMedia'
  | 'recipientAddresses'

export type CreateProjectAiOverwriteConfirmation = {
  patch: Partial<CreateProjectDraft>
  fields: CreateProjectAiOverwriteField[]
}

export function partitionCreateProjectAiPatch(
  currentDraft: CreateProjectDraft,
  incomingPatch: Partial<CreateProjectDraft>,
): {
  autoApplyPatch?: Partial<CreateProjectDraft>
  confirmation?: CreateProjectAiOverwriteConfirmation
} {
  const autoApplyPatch: Partial<CreateProjectDraft> = {}
  const confirmationPatch: Partial<CreateProjectDraft> = {}
  const confirmationFields = new Set<CreateProjectAiOverwriteField>()

  partitionScalarField({
    field: 'title',
    currentValue: currentDraft.title,
    incomingValue: incomingPatch.title,
    autoApplyPatch,
    confirmationPatch,
    confirmationFields,
  })
  partitionScalarField({
    field: 'description',
    currentValue: currentDraft.description,
    incomingValue: incomingPatch.description,
    autoApplyPatch,
    confirmationPatch,
    confirmationFields,
  })
  partitionScalarField({
    field: 'image',
    currentValue: currentDraft.image,
    incomingValue: incomingPatch.image,
    autoApplyPatch,
    confirmationPatch,
    confirmationFields,
  })
  partitionScalarField({
    field: 'impactLocation',
    currentValue: currentDraft.impactLocation,
    incomingValue: incomingPatch.impactLocation,
    autoApplyPatch,
    confirmationPatch,
    confirmationFields,
  })

  if (Array.isArray(incomingPatch.categoryIds)) {
    const currentCategoryIds = normalizeCategoryIds(currentDraft.categoryIds)
    const nextCategoryIds = normalizeCategoryIds(incomingPatch.categoryIds)

    if (!numberArraysEqual(currentCategoryIds, nextCategoryIds)) {
      if (currentCategoryIds.length > 0) {
        confirmationPatch.categoryIds = incomingPatch.categoryIds
        confirmationFields.add('categoryIds')
      } else {
        autoApplyPatch.categoryIds = incomingPatch.categoryIds
      }
    }
  }

  if (Array.isArray(incomingPatch.socialMedia)) {
    const safeSocialLinks: CreateProjectSocialLink[] = []
    const conflictingSocialLinks: CreateProjectSocialLink[] = []

    for (const incomingSocialLink of incomingPatch.socialMedia) {
      const currentLink =
        currentDraft.socialMedia.find(
          socialLink => socialLink.type === incomingSocialLink.type,
        )?.link ?? ''

      if (
        normalizeComparableText(currentLink) ===
        normalizeComparableText(incomingSocialLink.link)
      ) {
        continue
      }

      if (normalizeComparableText(currentLink)) {
        conflictingSocialLinks.push(incomingSocialLink)
        confirmationFields.add('socialMedia')
      } else {
        safeSocialLinks.push(incomingSocialLink)
      }
    }

    if (safeSocialLinks.length > 0) {
      autoApplyPatch.socialMedia = safeSocialLinks
    }

    if (conflictingSocialLinks.length > 0) {
      confirmationPatch.socialMedia = conflictingSocialLinks
    }
  }

  if (Array.isArray(incomingPatch.recipientAddresses)) {
    const currentRecipientAddresses = normalizeRecipientAddresses(
      currentDraft.recipientAddresses,
    )
    const nextRecipientAddresses = normalizeRecipientAddresses(
      incomingPatch.recipientAddresses,
    )

    if (
      JSON.stringify(currentRecipientAddresses) !==
      JSON.stringify(nextRecipientAddresses)
    ) {
      if (currentRecipientAddresses.length > 0) {
        confirmationPatch.recipientAddresses = incomingPatch.recipientAddresses
        confirmationFields.add('recipientAddresses')
      } else {
        autoApplyPatch.recipientAddresses = incomingPatch.recipientAddresses
      }
    }
  }

  return {
    autoApplyPatch: hasPatchKeys(autoApplyPatch) ? autoApplyPatch : undefined,
    confirmation: hasPatchKeys(confirmationPatch)
      ? {
          patch: confirmationPatch,
          fields: Array.from(confirmationFields),
        }
      : undefined,
  }
}

export function getCreateProjectAiOverwriteFieldLabel(
  field: CreateProjectAiOverwriteField,
): string {
  switch (field) {
    case 'title':
      return 'Project name'
    case 'description':
      return 'Description'
    case 'image':
      return 'Cover image'
    case 'impactLocation':
      return 'Impact location'
    case 'categoryIds':
      return 'Categories'
    case 'socialMedia':
      return 'Social links'
    case 'recipientAddresses':
      return 'Recipient addresses'
  }
}

export function mergeCreateProjectAiOverwriteConfirmations(
  currentConfirmation: CreateProjectAiOverwriteConfirmation | null,
  nextConfirmation: CreateProjectAiOverwriteConfirmation,
): CreateProjectAiOverwriteConfirmation {
  if (!currentConfirmation) {
    return nextConfirmation
  }

  const mergedPatch: Partial<CreateProjectDraft> = {
    ...currentConfirmation.patch,
    ...nextConfirmation.patch,
  }

  if (
    currentConfirmation.patch.socialMedia ||
    nextConfirmation.patch.socialMedia
  ) {
    const byType = new Map<string, CreateProjectSocialLink>()

    for (const socialLink of currentConfirmation.patch.socialMedia ?? []) {
      byType.set(socialLink.type, socialLink)
    }

    for (const socialLink of nextConfirmation.patch.socialMedia ?? []) {
      byType.set(socialLink.type, socialLink)
    }

    mergedPatch.socialMedia = Array.from(byType.values())
  }

  return {
    patch: mergedPatch,
    fields: Array.from(
      new Set([...currentConfirmation.fields, ...nextConfirmation.fields]),
    ),
  }
}

function partitionScalarField({
  field,
  currentValue,
  incomingValue,
  autoApplyPatch,
  confirmationPatch,
  confirmationFields,
}: {
  field: Extract<
    CreateProjectAiOverwriteField,
    'title' | 'description' | 'image' | 'impactLocation'
  >
  currentValue: string
  incomingValue: string | undefined
  autoApplyPatch: Partial<CreateProjectDraft>
  confirmationPatch: Partial<CreateProjectDraft>
  confirmationFields: Set<CreateProjectAiOverwriteField>
}) {
  if (typeof incomingValue !== 'string') return
  if (
    normalizeComparableText(currentValue) ===
    normalizeComparableText(incomingValue)
  ) {
    return
  }

  if (normalizeComparableText(currentValue)) {
    confirmationPatch[field] = incomingValue
    confirmationFields.add(field)
    return
  }

  autoApplyPatch[field] = incomingValue
}

function normalizeComparableText(value: string): string {
  return value.trim()
}

function normalizeCategoryIds(categoryIds: number[]): number[] {
  return [
    ...new Set(categoryIds.map(id => Number(id)).filter(Number.isInteger)),
  ].sort((a, b) => a - b)
}

function numberArraysEqual(left: number[], right: number[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}

function normalizeRecipientAddresses(
  addresses: CreateProjectRecipientAddress[],
): Array<{
  chainType: CreateProjectRecipientAddress['chainType']
  networkId: number
  address: string
  title?: string
  memo?: string
}> {
  return addresses
    .map(address => ({
      chainType: address.chainType,
      networkId: address.networkId,
      address:
        address.chainType === 'EVM'
          ? address.address.trim().toLowerCase()
          : address.address.trim(),
      title: address.title?.trim() || undefined,
      memo: address.memo?.trim() || undefined,
    }))
    .filter(
      address =>
        address.address ||
        address.title ||
        address.memo ||
        address.chainType !== 'EVM' ||
        address.networkId !== 1,
    )
}

function hasPatchKeys(patch: Partial<CreateProjectDraft>): boolean {
  return Object.keys(patch).length > 0
}
