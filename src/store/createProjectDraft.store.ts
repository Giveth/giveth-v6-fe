'use client'

import { isAddress } from 'viem'
import { z } from 'zod'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { formatContentForStorage } from '@/components/editor/readonlyQuillContent'
import { MAX_CATEGORIES } from '@/components/project/CreateProjectFullForm'
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

/**
 * Create a unique id
 * @returns The unique id
 */
const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

/**
 * The schema for a URL or empty string
 * @returns The schema for a URL or empty string
 */
const urlOrEmpty = z
  .string()
  .trim()
  .transform(v => v ?? '')
  .refine(v => v === '' || safeIsUrl(v), {
    message: 'Please enter a valid URL',
  })

/**
 * Check if the value is a valid URL
 * @param value - The value to check
 * @returns True if the value is a valid URL, false otherwise
 */
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

/**
 * Check if the value is a valid base58 address
 * @param value - The value to check
 * @returns True if the value is a valid base58 address, false otherwise
 */
function isBase58(value: string): boolean {
  // Excludes 0 O I l
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(value)
}

const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const STELLAR_BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const STELLAR_ED25519_PUBLIC_KEY_VERSION_BYTE = 6 << 3 // 48, "G..."

function decodeBase58(value: string): Uint8Array | null {
  if (!value) return null

  let decoded = 0n
  for (const char of value) {
    const digit = BASE58_ALPHABET.indexOf(char)
    if (digit < 0) return null
    decoded = decoded * 58n + BigInt(digit)
  }

  const bytes: number[] = []
  while (decoded > 0n) {
    bytes.push(Number(decoded & 0xffn))
    decoded >>= 8n
  }
  bytes.reverse()

  const leadingZeroes = value.match(/^1+/)?.[0].length ?? 0
  return new Uint8Array([...new Array(leadingZeroes).fill(0), ...bytes])
}

function decodeBase32(value: string): Uint8Array | null {
  if (!value) return null

  let buffer = 0
  let bits = 0
  const out: number[] = []

  for (const char of value) {
    const idx = STELLAR_BASE32_ALPHABET.indexOf(char)
    if (idx < 0) return null

    buffer = (buffer << 5) | idx
    bits += 5

    while (bits >= 8) {
      bits -= 8
      out.push((buffer >> bits) & 0xff)
      buffer &= (1 << bits) - 1
    }
  }

  return new Uint8Array(out)
}

function crc16Xmodem(data: Uint8Array): number {
  let crc = 0x0000
  for (const byte of data) {
    crc ^= byte << 8
    for (let i = 0; i < 8; i += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff
      } else {
        crc = (crc << 1) & 0xffff
      }
    }
  }
  return crc
}

/**
 * Check if the value is a valid Solana address
 * @param value - The value to check
 * @returns True if the value is a valid Solana address, false otherwise
 */
function isSolanaAddress(value: string): boolean {
  const normalized = value.trim()
  if (!isBase58(normalized)) return false
  const decoded = decodeBase58(normalized)
  return Boolean(decoded && decoded.length === 32)
}

/**
 * Check if the value is a valid Stellar address
 * @param value - The value to check
 * @returns True if the value is a valid Stellar address, false otherwise
 */
function isStellarAddress(value: string): boolean {
  const normalized = value.trim().toUpperCase()
  if (!/^G[A-Z2-7]{55}$/.test(normalized)) return false

  const decoded = decodeBase32(normalized)
  if (!decoded || decoded.length !== 35) return false

  const payload = decoded.slice(0, 33) // version byte + 32-byte pubkey
  const checksum = decoded.slice(33, 35) // little-endian CRC16-XModem
  if (payload[0] !== STELLAR_ED25519_PUBLIC_KEY_VERSION_BYTE) return false

  const expectedChecksum = crc16Xmodem(payload)
  const lo = expectedChecksum & 0xff
  const hi = (expectedChecksum >> 8) & 0xff
  return checksum[0] === lo && checksum[1] === hi
}

/**
 * Validate the create project draft
 * @param draft - The draft to validate
 * @returns The errors
 */
export function validateCreateProjectDraft(
  draft: CreateProjectDraft,
): CreateProjectDraftErrors {
  const errors: CreateProjectDraftErrors = {}

  const title = draft.title.trim()
  if (!title) {
    errors.title = 'Project name is required'
  } else if (title.length > 60) {
    errors.title = 'Max 60 letters'
  }

  const description = draft.description.trim()
  if (!description) {
    errors.description = 'Description is required'
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
      if (addr.chainType === 'EVM') return !isAddress(a)
      if (addr.chainType === 'SOLANA') return !isSolanaAddress(a)
      if (addr.chainType === 'STELLAR') return !isStellarAddress(a)
      return true
    })
    if (invalid) {
      errors.recipientAddresses = 'One or more recipient addresses are invalid'
    }
  }

  return errors
}

/**
 * The shape of the create-project draft store state.
 *
 * Includes draft values, validation/submission state,
 * and actions to mutate or submit the draft.
 */
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

/**
 * The initial draft
 * @returns The initial draft
 */
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
              description: formatContentForStorage(draft.description.trim()),
              image: draft.image.trim() ? draft.image.trim() : null,
              impactLocation: draft.impactLocation.trim()
                ? draft.impactLocation.trim()
                : null,
              categoryIds: draft.categoryIds.length ? draft.categoryIds : [],
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
                  link: s.link.trim(),
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
      version: 3,
      migrate: (persisted, version) => {
        // v1 stored the whole store shape (including errors). Drop everything
        // except the draft when rehydrating older persisted states.
        if (version < 2) {
          const p = persisted as Partial<CreateProjectDraftState> | undefined
          return {
            draft: p?.draft ?? initialDraft,
            isRecipientAddressesAutoFilled: false,
          }
        }

        if (version < 3) {
          const p = persisted as Partial<CreateProjectDraftState> | undefined
          return {
            ...p,
            isRecipientAddressesAutoFilled:
              p?.isRecipientAddressesAutoFilled ?? false,
          }
        }
        return persisted as unknown as Partial<CreateProjectDraftState>
      },
    },
  ),
)
