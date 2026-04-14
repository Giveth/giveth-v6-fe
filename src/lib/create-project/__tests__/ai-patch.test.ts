import {
  mergeCreateProjectAiOverwriteConfirmations,
  partitionCreateProjectAiPatch,
  type CreateProjectAiOverwriteConfirmation,
} from '@/lib/create-project/ai-patch'
import { createEmptyCreateProjectSocialMedia } from '@/lib/create-project/types'

function createDraft() {
  return {
    title: '',
    description: '',
    image: '',
    impactLocation: '',
    categoryIds: [],
    socialMedia: createEmptyCreateProjectSocialMedia(),
    recipientAddresses: [],
  }
}

describe('partitionCreateProjectAiPatch', () => {
  it('auto-applies changes into empty fields', () => {
    const result = partitionCreateProjectAiPatch(createDraft(), {
      title: 'Impact Collective',
      impactLocation: 'Worldwide',
      categoryIds: [1, 2],
    })

    expect(result.autoApplyPatch).toEqual({
      title: 'Impact Collective',
      impactLocation: 'Worldwide',
      categoryIds: [1, 2],
    })
    expect(result.confirmation).toBeUndefined()
  })

  it('requires confirmation before replacing an existing scalar value', () => {
    const result = partitionCreateProjectAiPatch(
      {
        ...createDraft(),
        title: 'Old title',
      },
      {
        title: 'New title',
      },
    )

    expect(result.autoApplyPatch).toBeUndefined()
    expect(result.confirmation).toEqual({
      patch: { title: 'New title' },
      fields: ['title'],
    } satisfies CreateProjectAiOverwriteConfirmation)
  })

  it('splits safe and conflicting social link updates', () => {
    const result = partitionCreateProjectAiPatch(
      {
        ...createDraft(),
        socialMedia: createEmptyCreateProjectSocialMedia().map(item =>
          item.type === 'x'
            ? { ...item, link: 'https://x.com/current_project' }
            : item,
        ),
      },
      {
        socialMedia: [
          { type: 'x', link: 'https://x.com/new_project' },
          { type: 'website', link: 'https://giveth.io' },
        ],
      },
    )

    expect(result.autoApplyPatch).toEqual({
      socialMedia: [{ type: 'website', link: 'https://giveth.io' }],
    })
    expect(result.confirmation).toEqual({
      patch: {
        socialMedia: [{ type: 'x', link: 'https://x.com/new_project' }],
      },
      fields: ['socialMedia'],
    } satisfies CreateProjectAiOverwriteConfirmation)
  })

  it('requires confirmation before replacing recipient addresses', () => {
    const result = partitionCreateProjectAiPatch(
      {
        ...createDraft(),
        recipientAddresses: [
          {
            id: 'existing',
            chainType: 'EVM',
            networkId: 1,
            address: '0x0000000000000000000000000000000000000001',
          },
        ],
      },
      {
        recipientAddresses: [
          {
            id: 'incoming',
            chainType: 'EVM',
            networkId: 10,
            address: '0x0000000000000000000000000000000000000010',
          },
        ],
      },
    )

    expect(result.autoApplyPatch).toBeUndefined()
    expect(result.confirmation).toEqual({
      patch: {
        recipientAddresses: [
          {
            id: 'incoming',
            chainType: 'EVM',
            networkId: 10,
            address: '0x0000000000000000000000000000000000000010',
          },
        ],
      },
      fields: ['recipientAddresses'],
    } satisfies CreateProjectAiOverwriteConfirmation)
  })

  it('ignores empty recipient placeholders when deciding overwrite confirmation', () => {
    const result = partitionCreateProjectAiPatch(
      {
        ...createDraft(),
        recipientAddresses: [
          {
            id: 'placeholder',
            chainType: 'EVM',
            networkId: 1,
            address: '',
          },
        ],
      },
      {
        recipientAddresses: [
          {
            id: 'incoming',
            chainType: 'EVM',
            networkId: 10,
            address: '0x0000000000000000000000000000000000000010',
          },
        ],
      },
    )

    expect(result.autoApplyPatch).toEqual({
      recipientAddresses: [
        {
          id: 'incoming',
          chainType: 'EVM',
          networkId: 10,
          address: '0x0000000000000000000000000000000000000010',
        },
      ],
    })
    expect(result.confirmation).toBeUndefined()
  })

  it('requires confirmation when a recipient row has manual chain or network edits', () => {
    const result = partitionCreateProjectAiPatch(
      {
        ...createDraft(),
        recipientAddresses: [
          {
            id: 'manual-metadata',
            chainType: 'SOLANA',
            networkId: 10,
            address: '',
          },
        ],
      },
      {
        recipientAddresses: [
          {
            id: 'incoming',
            chainType: 'EVM',
            networkId: 1,
            address: '0x0000000000000000000000000000000000000010',
          },
        ],
      },
    )

    expect(result.autoApplyPatch).toBeUndefined()
    expect(result.confirmation).toEqual({
      patch: {
        recipientAddresses: [
          {
            id: 'incoming',
            chainType: 'EVM',
            networkId: 1,
            address: '0x0000000000000000000000000000000000000010',
          },
        ],
      },
      fields: ['recipientAddresses'],
    } satisfies CreateProjectAiOverwriteConfirmation)
  })
})

describe('mergeCreateProjectAiOverwriteConfirmations', () => {
  it('preserves older pending fields while adding new ones', () => {
    expect(
      mergeCreateProjectAiOverwriteConfirmations(
        {
          patch: { title: 'First title' },
          fields: ['title'],
        },
        {
          patch: {
            socialMedia: [{ type: 'website', link: 'https://giveth.io' }],
          },
          fields: ['socialMedia'],
        },
      ),
    ).toEqual({
      patch: {
        title: 'First title',
        socialMedia: [{ type: 'website', link: 'https://giveth.io' }],
      },
      fields: ['title', 'socialMedia'],
    } satisfies CreateProjectAiOverwriteConfirmation)
  })

  it('merges social link confirmations by type using the latest suggestion', () => {
    expect(
      mergeCreateProjectAiOverwriteConfirmations(
        {
          patch: {
            socialMedia: [{ type: 'x', link: 'https://x.com/old_name' }],
          },
          fields: ['socialMedia'],
        },
        {
          patch: {
            socialMedia: [
              { type: 'x', link: 'https://x.com/new_name' },
              { type: 'website', link: 'https://giveth.io' },
            ],
          },
          fields: ['socialMedia'],
        },
      ),
    ).toEqual({
      patch: {
        socialMedia: [
          { type: 'x', link: 'https://x.com/new_name' },
          { type: 'website', link: 'https://giveth.io' },
        ],
      },
      fields: ['socialMedia'],
    } satisfies CreateProjectAiOverwriteConfirmation)
  })
})
