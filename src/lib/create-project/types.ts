export const CREATE_PROJECT_MIN_TITLE_LENGTH = 3
export const CREATE_PROJECT_MAX_TITLE_LENGTH = 55
export const CREATE_PROJECT_MIN_DESCRIPTION_LENGTH = 1200
export const CREATE_PROJECT_MAX_STELLAR_MEMO_LENGTH = 28

export const CREATE_PROJECT_SOCIAL_TYPES = [
  'facebook',
  'x',
  'linkedin',
  'discord',
  'telegram',
  'instagram',
  'reddit',
  'youtube',
  'farcaster',
  'lens',
  'github',
  'website',
] as const

export type CreateProjectSocialType =
  (typeof CREATE_PROJECT_SOCIAL_TYPES)[number]

export type CreateProjectChainType = 'EVM' | 'SOLANA' | 'STELLAR'

export type CreateProjectSocialLink = {
  type: CreateProjectSocialType
  link: string
}

export type CreateProjectRecipientAddress = {
  id: string
  chainType: CreateProjectChainType
  networkId: number
  address: string
  title?: string
  memo?: string
}

export type CreateProjectDraft = {
  title: string
  description: string
  image: string
  impactLocation: string
  categoryIds: number[]
  socialMedia: CreateProjectSocialLink[]
  recipientAddresses: CreateProjectRecipientAddress[]
}

export type CreateProjectDraftErrors = Partial<
  Record<
    | 'title'
    | 'description'
    | 'image'
    | 'impactLocation'
    | 'categoryIds'
    | 'recipientAddresses'
    | `socialMedia.${CreateProjectSocialType}`,
    string
  >
>

export const CREATE_PROJECT_SOCIAL_FIELDS: {
  key: CreateProjectSocialType
  label: string
  placeholder: string
}[] = [
  {
    key: 'facebook',
    label: 'Facebook',
    placeholder: 'https://facebook.com/page',
  },
  {
    key: 'x',
    label: 'X / Twitter',
    placeholder: 'https://x.com/username',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/username',
  },
  {
    key: 'discord',
    label: 'Discord',
    placeholder: 'https://discord.gg/invite',
  },
  {
    key: 'telegram',
    label: 'Telegram',
    placeholder: 'https://t.me/username',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/username',
  },
  {
    key: 'reddit',
    label: 'Reddit',
    placeholder: 'https://reddit.com/r/subreddit',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    placeholder: 'https://youtube.com/@channel',
  },
  {
    key: 'farcaster',
    label: 'Farcaster',
    placeholder: 'https://warpcast.com/username',
  },
  {
    key: 'lens',
    label: 'Lens',
    placeholder: 'https://lens.xyz/username',
  },
  {
    key: 'github',
    label: 'GitHub',
    placeholder: 'https://github.com/username',
  },
  {
    key: 'website',
    label: 'Website',
    placeholder: 'https://yourwebsite.com',
  },
]

export const createEmptyCreateProjectSocialMedia =
  (): CreateProjectSocialLink[] =>
    CREATE_PROJECT_SOCIAL_TYPES.map(type => ({ type, link: '' }))
