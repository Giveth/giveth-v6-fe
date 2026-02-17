'use client'

import Link from 'next/link'
import { ExternalLink, PanelLeft, PanelLeftClose } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCreateProjectDraftStore } from '@/stores/createProjectDraft.store'
import type { Route } from 'next'

export function CreateProjectLayout({
  isSidebarOpen,
  showAiUpdateCue,
  onToggleSidebar,
  sidebar,
  chat,
}: {
  isSidebarOpen: boolean
  showAiUpdateCue: boolean
  onToggleSidebar: () => void
  sidebar: React.ReactNode
  chat: React.ReactNode
}) {
  const draft = useCreateProjectDraftStore(s => s.draft)
  const isPreviewEnabled =
    Boolean(draft.title.trim()) && Boolean(draft.description.trim())

  const actionButtonClasses =
    'inline-flex h-12 items-center gap-2 rounded-[8px] border border-[#d8d8f0] bg-[#f1f0fb] px-6 text-lg font-semibold leading-none shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-colors'
  const actionButtonEnabledClasses =
    '!text-[rgb(39,38,137)] hover:bg-[#eceafe] visited:!text-[rgb(39,38,137)]'
  const actionButtonDisabledClasses =
    'cursor-not-allowed border-[#e5e7f3] bg-[#f4f4fa] text-[#b3aef0]'

  return (
    <div className="bg-[#f7f8fc]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:items-start xl:flex-row">
          <main className="relative min-w-0 flex-1 flex flex-col overflow-hidden rounded-2xl border border-[#ececf4] bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)] h-[calc(100vh-128px)]">
            <div className="shrink-0 flex items-center justify-end gap-3 px-4 py-3 sm:px-5">
              {isPreviewEnabled ? (
                <Link
                  href={'/project/preview' as Route}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    actionButtonClasses,
                    actionButtonEnabledClasses,
                  )}
                >
                  Project Preview <ExternalLink className="size-6" />
                </Link>
              ) : (
                <span
                  className={cn(
                    actionButtonClasses,
                    actionButtonDisabledClasses,
                  )}
                >
                  Project Preview <ExternalLink className="size-6" />
                </span>
              )}

              <button
                type="button"
                className={cn(actionButtonClasses, actionButtonEnabledClasses)}
                onClick={onToggleSidebar}
              >
                {isSidebarOpen ? (
                  <>
                    Hide Form <PanelLeftClose className="size-5" />
                  </>
                ) : (
                  <>
                    Manual Edit <PanelLeft className="size-5" />
                  </>
                )}
              </button>
            </div>
            {!isSidebarOpen && showAiUpdateCue && (
              <div className="pointer-events-none absolute right-6 top-[72px] z-10 rounded-full border border-[#ece8ff] bg-white px-3 py-1 text-sm font-semibold text-[#7c6af2] shadow-[0_6px_20px_rgba(124,106,242,0.18)]">
                Updated! <span className="text-sm">✨</span>
              </div>
            )}

            {showAiUpdateCue && (
              <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-4 bg-gradient-to-r from-transparent to-[rgba(139,120,255,0.55)]" />
            )}
            <div className="flex-1 min-h-0">{chat}</div>
          </main>

          <aside
            className={cn(
              'relative min-w-0 overflow-hidden rounded-2xl bg-transparent transition-[width,opacity,transform] duration-300 ease-out',
              'xl:block',
              'xl:sticky xl:top-24',
              isSidebarOpen
                ? 'w-full opacity-100 translate-x-0 xl:w-[420px]'
                : 'w-0 opacity-0 translate-x-4',
            )}
            aria-hidden={!isSidebarOpen}
          >
            <div
              className={cn(
                'min-h-[calc(100vh-220px)] transition-opacity duration-200 xl:h-[calc(100vh-128px)] xl:min-h-0',
                isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
            >
              {sidebar}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
