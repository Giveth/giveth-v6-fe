'use client'

import Link from 'next/link'
import { ExternalLink, PanelLeft, PanelLeftClose } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Route } from 'next'

export function CreateProjectLayout({
  isSidebarOpen,
  onToggleSidebar,
  sidebar,
  chat,
}: {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  sidebar: React.ReactNode
  chat: React.ReactNode
}) {
  return (
    <div className="bg-[#f7f8fc]">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#ececf4] bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#f0f1f7] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                className="h-9 rounded-lg bg-[#f3f2ff] px-3 text-xs font-semibold text-[#3b2ed0] hover:bg-[#ebe9ff]"
                onClick={onToggleSidebar}
              >
                {isSidebarOpen ? (
                  <>
                    Hide Form <PanelLeftClose className="size-4" />
                  </>
                ) : (
                  <>
                    Manual Edit <PanelLeft className="size-4" />
                  </>
                )}
              </Button>

              <Link
                href={'/create/project/preview' as Route}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#7c6af2] hover:text-[#5f4cf0]"
              >
                Project Preview <ExternalLink className="size-4" />
              </Link>
            </div>
          </div>

          <div className="flex min-h-[calc(100vh-220px)]">
            <aside
              className={cn(
                'shrink-0 border-r border-[#f0f1f7] bg-white transition-[width] duration-200',
                isSidebarOpen ? 'w-[380px]' : 'w-0',
              )}
              aria-hidden={!isSidebarOpen}
            >
              <div className={cn('h-full', isSidebarOpen ? 'block' : 'hidden')}>
                {sidebar}
              </div>
            </aside>

            <main className="min-w-0 flex-1 bg-white">{chat}</main>
          </div>
        </div>
      </div>
    </div>
  )
}
