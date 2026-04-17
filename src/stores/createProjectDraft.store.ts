'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { MAX_CATEGORIES } from '@/components/project/CreateProjectFullForm'
import {
  createEmptyCreateProjectSocialMedia,
  CREATE_PROJECT_SOCIAL_TYPES,
  type CreateProjectDraft,
  type CreateProjectDraftErrors,
  type CreateProjectRecipientAddress,
  type CreateProjectSocialLink,
  type CreateProjectSocialType,
} from '@/lib/create-project/types'
import {
  buildCreateProjectInput,
  sanitizeDraftDescription,
  validateCreateProjectDraft as validateDraft,
} from '@/lib/create-project/validation'
import { createGraphQLClient } from '@/lib/graphql/client'
import { createProjectMutation } from '@/lib/graphql/mutations'

export type {
  CreateProjectChainType,
  CreateProjectDraft,
  CreateProjectDraftErrors,
  CreateProjectRecipientAddress,
  CreateProjectSocialLink,
  CreateProjectSocialType,
} from '@/lib/create-project/types'
export { validateCreateProjectDraft } from '@/lib/create-project/validation'

export const CREATE_PROJECT_CHAT_HISTORY_STORAGE_KEY =
  'giveth-create-project-chat-history'

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

function sanitizePersistedDraft(
  draft: Partial<CreateProjectDraft> | undefined,
): CreateProjectDraft {
  const socialMedia = new Map<
    CreateProjectSocialType,
    CreateProjectSocialLink
  >()
  for (const socialLink of createEmptyCreateProjectSocialMedia()) {
    socialMedia.set(socialLink.type, socialLink)
  }

  if (Array.isArray(draft?.socialMedia)) {
    for (const socialLink of draft.socialMedia) {
      if (
        socialLink &&
        typeof socialLink.type === 'string' &&
        typeof socialLink.link === 'string' &&
        CREATE_PROJECT_SOCIAL_TYPES.includes(
          socialLink.type as CreateProjectSocialType,
        )
      ) {
        socialMedia.set(socialLink.type as CreateProjectSocialType, {
          type: socialLink.type as CreateProjectSocialType,
          link: socialLink.link,
        })
      }
    }
  }

  return {
    ...initialDraft,
    ...draft,
    description: sanitizeDraftDescription(String(draft?.description ?? '')),
    socialMedia: Array.from(socialMedia.values()),
    recipientAddresses: Array.isArray(draft?.recipientAddresses)
      ? draft.recipientAddresses.map(recipientAddress => ({
          ...recipientAddress,
          id: recipientAddress.id || createId(),
        }))
      : [],
  }
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
  submitCreateProject: (options?: {
    draft?: CreateProjectDraft
  }) => Promise<{ id: string; slug: string }>
  reset: () => void
}

const initialDraft: CreateProjectDraft = {
  title: '',
  description: '',
  image: '',
  impactLocation: '',
  categoryIds: [],
  socialMedia: createEmptyCreateProjectSocialMedia(),
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
            for (const item of patch.socialMedia) {
              if (
                CREATE_PROJECT_SOCIAL_TYPES.includes(
                  item.type as CreateProjectSocialType,
                )
              ) {
                byType.set(item.type as CreateProjectSocialType, {
                  type: item.type as CreateProjectSocialType,
                  link: item.link,
                })
              }
            }
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
        const nextErrors = validateDraft(get().draft)
        set({ errors: nextErrors })
        return Object.keys(nextErrors).length === 0
      },

      submitCreateProject: async options => {
        set({ submitError: undefined })
        const draftToSubmit = options?.draft ?? get().draft
        const nextErrors = validateDraft(draftToSubmit)
        set({ errors: nextErrors })
        const ok = Object.keys(nextErrors).length === 0
        if (!ok) {
          throw new Error(
            'Please fix the highlighted fields before publishing.',
          )
        }

        set({ isSubmitting: true })
        try {
          const token = localStorage.getItem('giveth_token')
          const client = createGraphQLClient({
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })

          const variables: unknown = {
            input: buildCreateProjectInput(draftToSubmit),
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
