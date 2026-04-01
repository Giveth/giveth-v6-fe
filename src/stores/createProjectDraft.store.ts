'use client'

import { isAddress } from 'viem'
import { z } from 'zod'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { MAX_CATEGORIES } from '@/components/project/CreateProjectFullForm'
import { looksLikeAiContextLeak } from '@/lib/create-project/ai-context'
import { createGraphQLClient } from '@/lib/graphql/client'
import { createProjectMutation } from '@/lib/graphql/mutations'

export const CREATE_PROJECT_CHAT_HISTORY_STORAGE_KEY =
  'giveth-create-project-chat-history'

export type CreateProjectSocialType = 'website' | 'facebook' | 'x' | 'linkedin'

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

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const CREATE_PROJECT_MIN_TITLE_LENGTH = 3
const CREATE_PROJECT_MAX_TITLE_LENGTH = 100
const CREATE_PROJECT_MIN_DESCRIPTION_LENGTH = 50
const CREATE_PROJECT_MAX_STELLAR_MEMO_LENGTH = 28

const urlOrEmpty = z
  .string()
  .trim()
  .transform(v => v ?? '')
  .refine(v => v === '' || safeIsUrl(v), {
    message: 'Please enter a valid URL',
  })

function safeIsUrl(value: string): boolean {
  try {
    // Accept users pasting without protocol (e.g. example.com)
    // Normalize later in submit layer.
    // Here we only enforce URL-ish structure.

    new URL(value.startsWith('http') ? value : `https://${value}`)
    return true
  } catch {
    return false
  }
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`
}

function sanitizeDraftDescription(description: string): string {
  return looksLikeAiContextLeak(description) ? '' : description
}

function sanitizePersistedDraft(
  draft: Partial<CreateProjectDraft> | undefined,
): CreateProjectDraft {
  return {
    ...initialDraft,
    ...draft,
    description: sanitizeDraftDescription(String(draft?.description ?? '')),
  }
}

function isBase58(value: string): boolean {
  // Excludes 0 O I l
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(value)
}

function isSolanaAddress(value: string): boolean {
  // Minimal validation: base58, common length range for Solana public keys.
  return isBase58(value) && value.length >= 32 && value.length <= 44
}

function isStellarAddress(value: string): boolean {
  // Minimal StrKey format check for public key: starts with 'G' and base32 chars.
  return /^G[A-Z2-7]{55}$/.test(value)
}

export function validateCreateProjectDraft(
  draft: CreateProjectDraft,
): CreateProjectDraftErrors {
  const errors: CreateProjectDraftErrors = {}

  const title = draft.title.trim()
  if (!title) {
    errors.title = 'Project name is required'
  } else if (title.length < CREATE_PROJECT_MIN_TITLE_LENGTH) {
    errors.title = `Project name must be at least ${CREATE_PROJECT_MIN_TITLE_LENGTH} characters`
  } else if (title.length > CREATE_PROJECT_MAX_TITLE_LENGTH) {
    errors.title = `Project name must be at most ${CREATE_PROJECT_MAX_TITLE_LENGTH} characters`
  }

  const description = draft.description.trim()
  if (!description) {
    errors.description = 'Description is required'
  } else if (description.length < CREATE_PROJECT_MIN_DESCRIPTION_LENGTH) {
    errors.description = `Description must be at least ${CREATE_PROJECT_MIN_DESCRIPTION_LENGTH} characters`
  } else if (looksLikeAiContextLeak(description)) {
    errors.description = 'Description contains invalid AI-generated context'
  }

  const image = draft.image.trim()
  const parsedImage = urlOrEmpty.safeParse(image)
  if (!parsedImage.success) {
    errors.image = parsedImage.error.issues[0]?.message
  }

  for (const type of ['website', 'facebook', 'x', 'linkedin'] as const) {
    const link = draft.socialMedia.find(s => s.type === type)?.link ?? ''
    const parsed = urlOrEmpty.safeParse(link)
    if (!parsed.success) {
      errors[`socialMedia.${type}`] = parsed.error.issues[0]?.message
    }
  }

  if (!draft.recipientAddresses.length) {
    errors.recipientAddresses = 'At least one recipient address is required'
  } else {
    const invalid = draft.recipientAddresses.find(addr => {
      const a = addr.address.trim()
      if (!a) return true
      if (!Number.isInteger(addr.networkId)) return true
      if (
        addr.memo &&
        addr.memo.trim().length > CREATE_PROJECT_MAX_STELLAR_MEMO_LENGTH
      )
        return true
      if (addr.chainType === 'EVM') return !isAddress(a)
      if (addr.chainType === 'SOLANA') return !isSolanaAddress(a)
      if (addr.chainType === 'STELLAR') return !isStellarAddress(a)
      return true
    })
    if (invalid) {
      errors.recipientAddresses =
        'One or more recipient addresses are invalid or incomplete'
    }
  }

  return errors
}

export type CreateProjectDraftState = {
  draft: CreateProjectDraft
  errors: CreateProjectDraftErrors
  isSubmitting: boolean
  isRecipientAddressesAutoFilled: boolean
  submitError?: string
  applyPatch: (patch: Partial<CreateProjectDraft>) => void
  setTitle: (title: string) => void
  setDescription: (description: string) => void
  setImage: (image: string) => void
  setImpactLocation: (impactLocation: string) => void
  setCategoryIds: (categoryIds: number[]) => void
  setSocialLink: (type: CreateProjectSocialType, link: string) => void
  addRecipientAddress: (input?: Partial<CreateProjectRecipientAddress>) => void
  updateRecipientAddress: (
    id: string,
    patch: Partial<CreateProjectRecipientAddress>,
  ) => void
  removeRecipientAddress: (id: string) => void
  setRecipientAddresses: (
    addresses: CreateProjectRecipientAddress[],
    options?: { autoFilled?: boolean },
  ) => void
  validate: () => boolean
  submitCreateProject: () => Promise<{ id: string; slug: string }>
  reset: () => void
}

const initialDraft: CreateProjectDraft = {
  title: '',
  description: '',
  image: '',
  impactLocation: '',
  categoryIds: [],
  socialMedia: [
    { type: 'website', link: '' },
    { type: 'facebook', link: '' },
    { type: 'x', link: '' },
    { type: 'linkedin', link: '' },
  ],
  recipientAddresses: [],
}

export const useCreateProjectDraftStore = create<CreateProjectDraftState>()(
  persist(
    (set, get) => ({
      draft: initialDraft,
      errors: {},
      isSubmitting: false,
      isRecipientAddressesAutoFilled: false,
      submitError: undefined,

      applyPatch: patch =>
        set(state => {
          const next: CreateProjectDraft = {
            ...state.draft,
            ...patch,
          }

          if (typeof patch.description === 'string') {
            next.description = sanitizeDraftDescription(patch.description)
          }

          // Merge social media by type (avoid duplicates).
          if (patch.socialMedia) {
            const byType = new Map<
              CreateProjectSocialType,
              CreateProjectSocialLink
            >()
            for (const item of state.draft.socialMedia)
              byType.set(item.type, item)
            for (const item of patch.socialMedia) byType.set(item.type, item)
            next.socialMedia = Array.from(byType.values())
          }

          // If AI provides recipient addresses, treat it as replace (IDs will come from AI).
          if (patch.recipientAddresses) {
            next.recipientAddresses = patch.recipientAddresses.map(addr => ({
              ...addr,
              id: addr.id || createId(),
            }))
          }

          if (patch.categoryIds) {
            next.categoryIds = patch.categoryIds
              .map(id => Number(id))
              .filter(id => Number.isInteger(id))
              .slice(0, MAX_CATEGORIES)
          }

          return {
            draft: next,
            isRecipientAddressesAutoFilled: patch.recipientAddresses
              ? false
              : state.isRecipientAddressesAutoFilled,
          }
        }),

      setTitle: title => set(state => ({ draft: { ...state.draft, title } })),
      setDescription: description =>
        set(state => ({ draft: { ...state.draft, description } })),
      setImage: image => set(state => ({ draft: { ...state.draft, image } })),
      setImpactLocation: impactLocation =>
        set(state => ({ draft: { ...state.draft, impactLocation } })),
      setCategoryIds: categoryIds =>
        set(state => ({
          draft: {
            ...state.draft,
            categoryIds: categoryIds
              .map(id => Number(id))
              .filter(id => Number.isInteger(id))
              .slice(0, MAX_CATEGORIES),
          },
        })),

      setSocialLink: (type, link) =>
        set(state => ({
          draft: {
            ...state.draft,
            socialMedia: state.draft.socialMedia.map(s =>
              s.type === type ? { ...s, link } : s,
            ),
          },
        })),

      addRecipientAddress: input =>
        set(state => ({
          isRecipientAddressesAutoFilled: false,
          draft: {
            ...state.draft,
            recipientAddresses: [
              ...state.draft.recipientAddresses,
              {
                id: createId(),
                chainType: input?.chainType ?? 'EVM',
                networkId: input?.networkId ?? 1,
                address: input?.address ?? '',
                title: input?.title,
                memo: input?.memo,
              },
            ],
          },
        })),

      updateRecipientAddress: (id, patch) =>
        set(state => ({
          isRecipientAddressesAutoFilled: false,
          draft: {
            ...state.draft,
            recipientAddresses: state.draft.recipientAddresses.map(addr =>
              addr.id === id ? { ...addr, ...patch } : addr,
            ),
          },
        })),

      removeRecipientAddress: id =>
        set(state => ({
          isRecipientAddressesAutoFilled: false,
          draft: {
            ...state.draft,
            recipientAddresses: state.draft.recipientAddresses.filter(
              addr => addr.id !== id,
            ),
          },
        })),

      setRecipientAddresses: (addresses, options) =>
        set(state => ({
          draft: {
            ...state.draft,
            recipientAddresses: addresses.map(addr => ({
              ...addr,
              id: addr.id || createId(),
            })),
          },
          isRecipientAddressesAutoFilled: Boolean(options?.autoFilled),
        })),

      validate: () => {
        const nextErrors = validateCreateProjectDraft(get().draft)
        set({ errors: nextErrors })
        return Object.keys(nextErrors).length === 0
      },

      submitCreateProject: async () => {
        set({ submitError: undefined })
        const ok = get().validate()
        if (!ok) {
          throw new Error(
            'Please fix the highlighted fields before publishing.',
          )
        }

        const { draft } = get()
        set({ isSubmitting: true })
        try {
          const token = localStorage.getItem('giveth_token')
          const client = createGraphQLClient({
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })

          // NOTE: v6-core schema is being extended (socialMedia + memo + Stellar).
          // We build variables in a forward-compatible shape and keep typing loose.
          const variables: unknown = {
            input: {
              title: draft.title.trim(),
              description: draft.description.trim(),
              image: draft.image.trim() ? normalizeUrl(draft.image) : undefined,
              impactLocation: draft.impactLocation.trim()
                ? draft.impactLocation.trim()
                : undefined,
              categoryIds: draft.categoryIds.length
                ? draft.categoryIds
                : undefined,
              addresses: draft.recipientAddresses.map(a => ({
                address: a.address.trim(),
                networkId: a.networkId,
                chainType: a.chainType,
                title: a.title?.trim() || undefined,
                memo: a.memo?.trim() || undefined,
              })),
              socialMedia: draft.socialMedia
                .map(s => ({
                  type: s.type,
                  link: normalizeUrl(s.link),
                }))
                .filter(s => s.link),
            },
          }

          const res = await client.request(
            createProjectMutation,
            variables as never,
          )

          const created =
            typeof (res as Record<string, unknown>)?.createProject ===
              'object' &&
            (res as Record<string, unknown>).createProject !== null
              ? ((res as Record<string, unknown>).createProject as Record<
                  string,
                  unknown
                >)
              : null

          const id =
            created && typeof created.id === 'string' ? created.id : null
          const slug =
            created && typeof created.slug === 'string' ? created.slug : null

          if (!id || !slug) {
            throw new Error('Project created but response was incomplete.')
          }

          // After successful publish, clear the draft
          localStorage.removeItem('giveth-create-project-draft')
          localStorage.removeItem(CREATE_PROJECT_CHAT_HISTORY_STORAGE_KEY)
          set({
            draft: { ...initialDraft },
            errors: {},
            isRecipientAddressesAutoFilled: false,
            submitError: undefined,
          })

          return { id, slug }
        } catch (e) {
          const msg =
            e instanceof Error ? e.message : 'Failed to create project'
          set({ submitError: msg })
          throw e
        } finally {
          set({ isSubmitting: false })
        }
      },

      reset: () =>
        set({
          draft: initialDraft,
          errors: {},
          isRecipientAddressesAutoFilled: false,
        }),
    }),
    {
      name: 'giveth-create-project-draft',
      storage: createJSONStorage(() => localStorage),
      // Only persist the draft fields. Errors/submitError are UI state and
      // should not survive refreshes (avoid "stuck" error messages).
      partialize: state => ({
        draft: state.draft,
        isRecipientAddressesAutoFilled: state.isRecipientAddressesAutoFilled,
      }),
      version: 4,
      migrate: (persisted, version) => {
        // v1 stored the whole store shape (including errors). Drop everything
        // except the draft when rehydrating older persisted states.
        const p = persisted as Partial<CreateProjectDraftState> | undefined
        if (version < 2) {
          return {
            draft: sanitizePersistedDraft(p?.draft),
            isRecipientAddressesAutoFilled: false,
          }
        }
        return {
          draft: sanitizePersistedDraft(p?.draft),
          isRecipientAddressesAutoFilled:
            p?.isRecipientAddressesAutoFilled ?? false,
        }
      },
    },
  ),
)
