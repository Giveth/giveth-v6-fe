'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSiweAuth } from '@/context/AuthContext'
import { uploadImageFile } from '@/lib/graphql/upload'
import {
  useCreateProjectDraftStore,
  validateCreateProjectDraft,
  type CreateProjectChainType,
} from '@/stores/createProjectDraft.store'

export function ManualSidebarForm() {
  const router = useRouter()
  const { token } = useSiweAuth()
  const [isSocialCollapsed, setIsSocialCollapsed] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const imageFileInputRef = useRef<HTMLInputElement | null>(null)

  const draft = useCreateProjectDraftStore(s => s.draft)
  const errors = useCreateProjectDraftStore(s => s.errors)
  const isSubmitting = useCreateProjectDraftStore(s => s.isSubmitting)
  const submitError = useCreateProjectDraftStore(s => s.submitError)
  const setTitle = useCreateProjectDraftStore(s => s.setTitle)
  const setDescription = useCreateProjectDraftStore(s => s.setDescription)
  const setImage = useCreateProjectDraftStore(s => s.setImage)
  const setImpactLocation = useCreateProjectDraftStore(s => s.setImpactLocation)
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
  const validate = useCreateProjectDraftStore(s => s.validate)
  const submitCreateProject = useCreateProjectDraftStore(
    s => s.submitCreateProject,
  )

  const liveErrors = useMemo(() => validateCreateProjectDraft(draft), [draft])
  const canPublish = Object.keys(liveErrors).length === 0

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-6">
        <div className="text-lg font-semibold text-giv-neutral-900">
          Project details
        </div>
        <div className="mt-1 text-sm text-[#6b7280]">
          You can enter manually or let Giveth AI fill the form for you.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#374151]">
              Project name
            </label>
            <Input
              value={draft.title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter project name"
              aria-invalid={Boolean(errors.title)}
            />
            <p className="text-xs text-[#9ca3af]">Max 60 letters</p>
            {errors.title && (
              <p className="text-xs font-medium text-red-600">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#374151]">
              Project Description
            </label>
            <textarea
              className="min-h-28 w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-[#111827] shadow-xs outline-none placeholder:text-[#9ca3af] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              placeholder="Enter a description..."
              value={draft.description}
              onChange={e => setDescription(e.target.value)}
              aria-invalid={Boolean(errors.description)}
            />
            <p className="text-xs text-[#9ca3af]">Aim for 200-500 words.</p>
            <button
              type="button"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#7c6af2] hover:text-[#5f4cf0]"
            >
              How to write a good project description <span>›</span>
            </button>
            {errors.description && (
              <p className="text-xs font-medium text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#374151]">
              Project image
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={draft.image}
                onChange={e => setImage(e.target.value)}
                placeholder="https://..."
                aria-invalid={Boolean(errors.image)}
              />
              <input
                ref={imageFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploadingImage || isSubmitting}
                onChange={e => {
                  const file = e.target.files?.[0]
                  // Allow selecting the same file again
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
                className="h-10 shrink-0 rounded-lg bg-[#f3f2ff] px-3 text-xs font-semibold text-[#5f4cf0] hover:bg-[#ebe9ff]"
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#374151]">
              Impact location
            </label>
            <select
              className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm text-[#111827] shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              value={draft.impactLocation}
              onChange={e => setImpactLocation(e.target.value)}
            >
              <option value="">Select…</option>
              <option value="Worldwide">Worldwide</option>
              <option value="North America">North America</option>
              <option value="South America">South America</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="Africa">Africa</option>
              <option value="Oceania">Oceania</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#111827]">
                  Social media links
                </div>
                <div className="text-xs text-[#9ca3af]">
                  Add your project’s social media links
                </div>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-[#7c6af2] hover:text-[#5f4cf0]"
                onClick={() => setIsSocialCollapsed(v => !v)}
              >
                {isSocialCollapsed ? 'Expand links' : 'Collapse links'}{' '}
                <span className="ml-1">^</span>
              </button>
            </div>

            {!isSocialCollapsed && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#374151]">
                    Website
                  </label>
                  <Input
                    value={
                      draft.socialMedia.find(s => s.type === 'website')?.link ||
                      ''
                    }
                    onChange={e => setSocialLink('website', e.target.value)}
                    placeholder="Enter link"
                    aria-invalid={Boolean(errors['socialMedia.website'])}
                  />
                  {errors['socialMedia.website'] && (
                    <p className="text-xs font-medium text-red-600">
                      {errors['socialMedia.website']}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#374151]">
                    Facebook
                  </label>
                  <Input
                    value={
                      draft.socialMedia.find(s => s.type === 'facebook')
                        ?.link || ''
                    }
                    onChange={e => setSocialLink('facebook', e.target.value)}
                    placeholder="Enter link"
                    aria-invalid={Boolean(errors['socialMedia.facebook'])}
                  />
                  {errors['socialMedia.facebook'] && (
                    <p className="text-xs font-medium text-red-600">
                      {errors['socialMedia.facebook']}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#374151]">
                    X / Twitter
                  </label>
                  <Input
                    value={
                      draft.socialMedia.find(s => s.type === 'x')?.link || ''
                    }
                    onChange={e => setSocialLink('x', e.target.value)}
                    placeholder="Enter link"
                    aria-invalid={Boolean(errors['socialMedia.x'])}
                  />
                  {errors['socialMedia.x'] && (
                    <p className="text-xs font-medium text-red-600">
                      {errors['socialMedia.x']}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[#374151]">
                    LinkedIn
                  </label>
                  <Input
                    value={
                      draft.socialMedia.find(s => s.type === 'linkedin')
                        ?.link || ''
                    }
                    onChange={e => setSocialLink('linkedin', e.target.value)}
                    placeholder="Enter link"
                    aria-invalid={Boolean(errors['socialMedia.linkedin'])}
                  />
                  {errors['socialMedia.linkedin'] && (
                    <p className="text-xs font-medium text-red-600">
                      {errors['socialMedia.linkedin']}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[#111827]">
                Receiving funds
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#7c6af2] hover:text-[#5f4cf0]"
                onClick={() => addRecipientAddress()}
              >
                <Plus className="size-4" />
                Add address
              </button>
            </div>

            {draft.recipientAddresses.length === 0 ? (
              <div className="rounded-xl border border-[#eef0f7] bg-[#fbfbff] px-4 py-3 text-sm text-[#6b7280]">
                Add at least one recipient address (EVM, Solana, or Stellar).
              </div>
            ) : (
              <div className="space-y-3">
                {draft.recipientAddresses.map(addr => (
                  <div
                    key={addr.id}
                    className="rounded-xl border border-[#eef0f7] bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <select
                          className="h-9 rounded-lg border border-input bg-transparent px-2 text-xs text-[#111827]"
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
                          className="h-9 w-24 text-xs"
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
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-[#eef0f7] text-[#9ca3af] hover:text-red-600"
                        onClick={() => removeRecipientAddress(addr.id)}
                        aria-label="Remove address"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="mt-2 space-y-2">
                      <Input
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
                      {addr.chainType === 'STELLAR' && (
                        <Input
                          value={addr.memo || ''}
                          onChange={e =>
                            updateRecipientAddress(addr.id, {
                              memo: e.target.value,
                            })
                          }
                          placeholder="Memo (optional)"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.recipientAddresses && (
              <p className="text-xs font-medium text-red-600">
                {errors.recipientAddresses}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#f0f1f7] p-6">
        {submitError && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {submitError}
          </div>
        )}
        <Button
          type="button"
          variant="secondary"
          disabled={isSubmitting || !canPublish}
          className="w-full rounded-xl bg-[#edeefe] text-[#3b2ed0] hover:bg-[#e4e6ff] disabled:bg-[#edeefe] disabled:text-[#9aa0bd] disabled:hover:bg-[#edeefe]"
          onClick={async () => {
            const ok = validate()
            if (!ok) return
            const { slug } = await submitCreateProject()
            router.push(`/project/${slug}`)
          }}
        >
          {isSubmitting ? 'Publishing…' : 'Publish Project'}
        </Button>
      </div>
    </div>
  )
}
