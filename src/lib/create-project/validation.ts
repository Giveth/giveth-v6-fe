import slugify from 'slugify'
import { isAddress } from 'viem'
import { looksLikeAiContextLeak } from '@/lib/create-project/ai-context'
import {
  CREATE_PROJECT_MAX_STELLAR_MEMO_LENGTH,
  CREATE_PROJECT_MAX_TITLE_LENGTH,
  CREATE_PROJECT_MIN_DESCRIPTION_LENGTH,
  CREATE_PROJECT_MIN_TITLE_LENGTH,
  CREATE_PROJECT_SOCIAL_TYPES,
  type CreateProjectDraft,
  type CreateProjectDraftErrors,
  type CreateProjectRecipientAddress,
  type CreateProjectSocialType,
} from '@/lib/create-project/types'

const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*?>/i
const INVALID_PROJECT_SLUG_MESSAGE =
  'Project name must include at least one letter or number that can be used in the project URL'

type SlugifyOptions = {
  replacement?: string
  remove?: RegExp
  lower?: boolean
  strict?: boolean
  trim?: boolean
  locale?: string
}

type SlugifyFn = (str: string, options?: SlugifyOptions) => string

const baseSlugify: SlugifyFn =
  (slugify as unknown as { default?: SlugifyFn }).default ??
  (slugify as unknown as SlugifyFn)

const CREATE_PROJECT_SLUG_OPTIONS: SlugifyOptions = {
  lower: true,
  strict: true,
  remove: /[*+~.()'"!:@]/g,
}

const SOCIAL_LINK_PATTERNS: Record<CreateProjectSocialType, RegExp> = {
  website:
    /^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/,
  x: /(?:https?:)?\/\/(?:www\.|m\.)?(twitter\.com|x\.com)\/(\w{2,15})\/?(?:\?\S+)?(?:\#\S+)?$/,
  facebook:
    /(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?/,
  instagram:
    /(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am|instagr.com)\/(\w+)/,
  linkedin:
    /^(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile|company)/,
  youtube: /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/,
  reddit: /^(http(s)?:\/\/)?(www\.)?reddit\.com\/r\/[\w._-]+\/?$/,
  farcaster:
    /^(https?:\/\/)?([\w-]+\.)?(warpcast\.com|farcaster\.xyz|farcaster\.social)\/.+$/i,
  lens: /^(https?:\/\/)?([\w-]+\.)?lens\.[a-z.]+\/.+$/i,
  discord: /(?:https?:\/\/)?(?:www\.)?discord\.[\w-]+/,
  telegram:
    /(?:https?:\/\/)?(?:www\.)?(?:t(?:elegram)?\.me|me|telegram\.org)\/(?:[a-zA-Z0-9_]{5,32}|joinchat\/[a-zA-Z0-9_]+)/,
  github:
    /^(https:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)?\/?$/,
}

export type CreateProjectQuality = 'LOW' | 'MEDIUM' | 'HIGH' | 'PERFECT'

export function containsHtmlTag(value: string): boolean {
  return HTML_TAG_REGEX.test(value)
}

export function safeIsUrl(value: string): boolean {
  try {
    new URL(value.startsWith('http') ? value : `https://${value}`)
    return true
  } catch {
    return false
  }
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
}

export function isLikelyEnsName(value: string): boolean {
  const normalized = value.trim().toLowerCase()
  return (
    Boolean(normalized) && normalized.includes('.eth') && !/\s/.test(normalized)
  )
}

export function isSolanaAddress(value: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value.trim())
}

export function isStellarAddress(value: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(value.trim())
}

export function sanitizeDraftDescription(description: string): string {
  return looksLikeAiContextLeak(description) ? '' : description
}

export function validateCreateProjectTitle(title: string): string | undefined {
  const normalizedTitle = title.trim()

  if (!normalizedTitle) return 'Project name is required'
  if (normalizedTitle.length < CREATE_PROJECT_MIN_TITLE_LENGTH) {
    return `Project name must be at least ${CREATE_PROJECT_MIN_TITLE_LENGTH} characters`
  }
  if (normalizedTitle.length > CREATE_PROJECT_MAX_TITLE_LENGTH) {
    return `Project name must be less than ${CREATE_PROJECT_MAX_TITLE_LENGTH} characters`
  }
  if (containsHtmlTag(normalizedTitle)) {
    return 'Project name contains invalid characters'
  }
  if (!createProjectSlugCandidate(normalizedTitle)) {
    return INVALID_PROJECT_SLUG_MESSAGE
  }

  return undefined
}

export function validateCreateProjectDescription(
  description: string,
): string | undefined {
  const normalizedDescription = description.trim()

  if (!normalizedDescription) return 'Description is required'
  if (normalizedDescription.length < CREATE_PROJECT_MIN_DESCRIPTION_LENGTH) {
    return `Describe your project with at least ${CREATE_PROJECT_MIN_DESCRIPTION_LENGTH} characters, tell us more!`
  }
  if (looksLikeAiContextLeak(normalizedDescription)) {
    return 'Description contains invalid AI-generated context'
  }

  return undefined
}

export function validateCreateProjectImage(image: string): string | undefined {
  const normalizedImage = image.trim()
  if (!normalizedImage) return undefined

  return safeIsUrl(normalizedImage) ? undefined : 'Please enter a valid URL'
}

export function validateCreateProjectSocialLink(
  type: CreateProjectSocialType,
  link: string,
): string | undefined {
  const normalizedLink = link.trim()
  if (!normalizedLink) return undefined

  return SOCIAL_LINK_PATTERNS[type].test(normalizedLink)
    ? undefined
    : `Invalid ${socialLabel(type)} URL`
}

export function validateCreateProjectRecipientAddress(
  recipientAddress: CreateProjectRecipientAddress,
): string | undefined {
  const normalizedAddress = recipientAddress.address.trim()

  if (!normalizedAddress) return 'Recipient address is required'
  if (
    !Number.isInteger(recipientAddress.networkId) ||
    recipientAddress.networkId <= 0
  ) {
    return 'Network ID must be a positive integer'
  }
  if (
    recipientAddress.memo &&
    recipientAddress.memo.trim().length > CREATE_PROJECT_MAX_STELLAR_MEMO_LENGTH
  ) {
    return `Stellar memo must be at most ${CREATE_PROJECT_MAX_STELLAR_MEMO_LENGTH} characters`
  }

  if (recipientAddress.chainType === 'EVM') {
    if (isAddress(normalizedAddress) || isLikelyEnsName(normalizedAddress)) {
      return undefined
    }
    return 'Please enter a valid EVM address or ENS name'
  }

  if (recipientAddress.chainType === 'SOLANA') {
    return isSolanaAddress(normalizedAddress)
      ? undefined
      : 'Please enter a valid Solana address'
  }

  return isStellarAddress(normalizedAddress)
    ? undefined
    : 'Please enter a valid Stellar address'
}

export function validateCreateProjectDraft(
  draft: CreateProjectDraft,
): CreateProjectDraftErrors {
  const errors: CreateProjectDraftErrors = {}

  const titleError = validateCreateProjectTitle(draft.title)
  if (titleError) errors.title = titleError

  const descriptionError = validateCreateProjectDescription(draft.description)
  if (descriptionError) errors.description = descriptionError

  const imageError = validateCreateProjectImage(draft.image)
  if (imageError) errors.image = imageError

  for (const type of CREATE_PROJECT_SOCIAL_TYPES) {
    const link = draft.socialMedia.find(item => item.type === type)?.link ?? ''
    const socialError = validateCreateProjectSocialLink(type, link)
    if (socialError) {
      errors[`socialMedia.${type}`] = socialError
    }
  }

  if (!draft.recipientAddresses.length) {
    errors.recipientAddresses = 'At least one recipient address is required'
  } else if (
    draft.recipientAddresses.some(recipientAddress =>
      Boolean(validateCreateProjectRecipientAddress(recipientAddress)),
    )
  ) {
    errors.recipientAddresses =
      'One or more recipient addresses are invalid or incomplete'
  }

  return errors
}

export function hasValidCreateProjectSocialLink(
  draft: CreateProjectDraft,
): boolean {
  return draft.socialMedia.some(
    socialLink =>
      socialLink.link.trim() &&
      !validateCreateProjectSocialLink(socialLink.type, socialLink.link),
  )
}

export function hasCreateProjectDescriptionMedia(description: string): boolean {
  return /<img|<iframe|!\[[^\]]*\]\([^)]+\)|https?:\/\/\S+\.(png|jpe?g|gif|webp|svg|mp4|mov|webm)/i.test(
    description,
  )
}

export function calculateCreateProjectScore(draft: CreateProjectDraft): {
  score: number
  quality: CreateProjectQuality
} {
  const score =
    (validateCreateProjectDescription(draft.description) ? 0 : 51) +
    (draft.categoryIds.length > 0 ? 7 : 0) +
    (draft.impactLocation.trim() ? 7 : 0) +
    (draft.image.trim() ? 15 : 0) +
    (hasCreateProjectDescriptionMedia(draft.description) ? 8 : 0) +
    (hasValidCreateProjectSocialLink(draft) ? 12 : 0)

  return {
    score,
    quality:
      score < 50
        ? 'LOW'
        : score < 80
          ? 'MEDIUM'
          : score < 100
            ? 'HIGH'
            : 'PERFECT',
  }
}

export function createProjectSlugCandidate(value: string): string {
  return baseSlugify(value, CREATE_PROJECT_SLUG_OPTIONS)
}

export function buildCreateProjectInput(draft: CreateProjectDraft) {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    image: draft.image.trim() ? normalizeUrl(draft.image) : undefined,
    impactLocation: draft.impactLocation.trim()
      ? draft.impactLocation.trim()
      : undefined,
    categoryIds: draft.categoryIds.length ? draft.categoryIds : undefined,
    addresses: draft.recipientAddresses.map(recipientAddress => ({
      address: recipientAddress.address.trim(),
      networkId: recipientAddress.networkId,
      chainType: recipientAddress.chainType,
      title: recipientAddress.title?.trim() || undefined,
      memo:
        recipientAddress.chainType === 'STELLAR'
          ? recipientAddress.memo?.trim() || undefined
          : undefined,
    })),
    socialMedia: draft.socialMedia
      .map(socialLink => ({
        type: socialLink.type,
        link: normalizeUrl(socialLink.link),
      }))
      .filter(socialLink => socialLink.link),
  }
}

function socialLabel(type: CreateProjectSocialType): string {
  switch (type) {
    case 'x':
      return 'X (Twitter)'
    case 'linkedin':
      return 'LinkedIn'
    case 'discord':
      return 'Discord'
    case 'telegram':
      return 'Telegram'
    case 'instagram':
      return 'Instagram'
    case 'reddit':
      return 'Reddit'
    case 'youtube':
      return 'YouTube'
    case 'farcaster':
      return 'Farcaster'
    case 'lens':
      return 'Lens'
    case 'github':
      return 'GitHub'
    case 'website':
      return 'Website'
    case 'facebook':
      return 'Facebook'
  }
}
