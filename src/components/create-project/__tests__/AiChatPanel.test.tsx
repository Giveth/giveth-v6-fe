import type { ComponentProps } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AiChatPanel } from '@/components/create-project/AiChatPanel'
import { createEmptyCreateProjectSocialMedia } from '@/lib/create-project/types'
import { useCreateProjectDraftStore } from '@/stores/createProjectDraft.store'

vi.mock('next/image', () => ({
  default: (props: ComponentProps<'img'>) => (
    <img {...props} alt={props.alt || ''} />
  ),
}))

vi.mock('@/context/AuthContext', () => ({
  useSiweAuth: () => ({
    token: null,
  }),
}))

vi.mock('@/lib/graphql/upload', () => ({
  uploadImageFile: vi.fn(),
}))

describe('AiChatPanel', () => {
  beforeEach(() => {
    window.localStorage.clear()
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    })
    useCreateProjectDraftStore.setState(state => ({
      ...state,
      draft: {
        title: 'Existing title',
        description: '',
        image: '',
        impactLocation: '',
        categoryIds: [],
        socialMedia: createEmptyCreateProjectSocialMedia(),
        recipientAddresses: [],
      },
      errors: {},
      isSubmitting: false,
      isRecipientAddressesAutoFilled: false,
      submitError: undefined,
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('keeps conflicting AI edits pending until the user confirms them', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            assistantMessage: 'I drafted a better title suggestion for you.',
            patch: { title: 'Updated by AI' },
          }),
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      ),
    )

    render(<AiChatPanel showWelcomeBubble={false} />)

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Suggest a stronger title' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send/i }))

    expect(await screen.findByText(/review ai changes/i)).toBeVisible()
    expect(useCreateProjectDraftStore.getState().draft.title).toBe(
      'Existing title',
    )

    fireEvent.click(screen.getByRole('button', { name: /apply ai changes/i }))

    await waitFor(() => {
      expect(useCreateProjectDraftStore.getState().draft.title).toBe(
        'Updated by AI',
      )
    })
  })
})
