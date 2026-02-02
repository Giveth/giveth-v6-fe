'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useCreateProjectDraftStore } from '@/stores/createProjectDraft.store'
import type { Route } from 'next'

export default function CreateProjectPreviewPage() {
  const draft = useCreateProjectDraftStore(s => s.draft)

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f7f8fc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href={'/create/project' as Route}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#5f4cf0] hover:text-[#3b2ed0]"
        >
          <ArrowLeft className="size-4" />
          Back to create
        </Link>

        <div className="mt-6 overflow-hidden rounded-2xl border border-[#ececf4] bg-white shadow-sm">
          <div className="border-b border-[#f0f1f7] px-6 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9ca3af]">
              Project preview
            </div>
            <div className="mt-2 text-2xl font-semibold text-[#111827]">
              {draft.title.trim() || 'Untitled project'}
            </div>
          </div>

          <div className="space-y-6 px-6 py-6">
            {draft.image.trim() && (
              <div className="overflow-hidden rounded-xl border border-[#eef0f7]">
                <Image
                  alt="Project"
                  src={draft.image}
                  width={1200}
                  height={675}
                  className="h-56 w-full object-cover"
                />
              </div>
            )}

            <section className="space-y-2">
              <div className="text-sm font-semibold text-[#111827]">
                Description
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#4b5563]">
                {draft.description.trim() || 'No description yet.'}
              </div>
            </section>

            <section className="space-y-2">
              <div className="text-sm font-semibold text-[#111827]">
                Impact location
              </div>
              <div className="text-sm text-[#4b5563]">
                {draft.impactLocation.trim() || 'Not set.'}
              </div>
            </section>

            <section className="space-y-2">
              <div className="text-sm font-semibold text-[#111827]">
                Social links
              </div>
              {draft.socialMedia.filter(s => s.link.trim()).length ? (
                <div className="space-y-1 text-sm text-[#4b5563]">
                  {draft.socialMedia
                    .filter(s => s.link.trim())
                    .map(s => (
                      <div key={s.type}>
                        <span className="font-medium">{s.type}:</span>{' '}
                        <span>{s.link}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-sm text-[#4b5563]">No links yet.</div>
              )}
            </section>

            <section className="space-y-2">
              <div className="text-sm font-semibold text-[#111827]">
                Recipient addresses
              </div>
              {draft.recipientAddresses.length ? (
                <div className="space-y-2 text-sm text-[#4b5563]">
                  {draft.recipientAddresses.map(a => (
                    <div
                      key={`${a.chainType}:${a.networkId}:${a.address}`}
                      className="rounded-xl border border-[#eef0f7] bg-[#fbfbff] px-4 py-3"
                    >
                      <div className="font-medium text-[#111827]">
                        {a.chainType} · {a.networkId}
                      </div>
                      <div className="font-mono text-xs">{a.address}</div>
                      {a.memo?.trim() && (
                        <div className="mt-1 text-xs">
                          <span className="font-medium">Memo:</span> {a.memo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[#4b5563]">
                  No recipient addresses yet.
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
