'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import clsx from 'clsx'
import { format } from 'date-fns'
import { useProjectUpdates } from '@/hooks/useProjectUpdates'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
})

type UpdatesTabProps = {
  projectId: number
  projectCreatedAt: string
}

type TimelineUpdate = {
  id: string
  title: string
  createdAt: string
  content?: string | null
  kind: 'update' | 'project_launched'
}

export function UpdatesTab({ projectId, projectCreatedAt }: UpdatesTabProps) {
  const { data, isLoading, error } = useProjectUpdates({ projectId, take: 20 })

  const updates = data?.projectUpdates.projectUpdates ?? []
  const total = data?.projectUpdates.totalCount ?? 0

  const emptyState = !isLoading && !error && total === 0

  const timelineUpdates = useMemo(() => {
    const apiUpdates: TimelineUpdate[] = updates.map(u => ({
      id: u.id,
      title: u.title,
      createdAt: u.createdAt,
      content: u.content,
      kind: 'update',
    }))

    // Always show "Project Launched!" as the earliest/first chronological item.
    const launch: TimelineUpdate = {
      id: `project-launched-${projectId}`,
      title: 'Project Launched! 🎉',
      createdAt: projectCreatedAt,
      content: null,
      kind: 'project_launched',
    }

    // API returns updates in DESC order; launch should be the oldest item at the end.
    return [...apiUpdates, launch]
  }, [projectCreatedAt, projectId, updates])

  const modules = useMemo(() => ({ toolbar: false }), [])
  const formats = useMemo(
    () => [
      'header',
      'font',
      'size',
      'bold',
      'italic',
      'underline',
      'strike',
      'blockquote',
      'list',
      'indent',
      'link',
      'image',
      'video',
    ],
    [],
  )

  return (
    <div>
      {isLoading && (
        <div className="flex items-center justify-center py-12 text-giv-neutral-700">
          Loading updates...
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-12 text-giv-neutral-700">
          Failed to load updates.
        </div>
      )}

      {emptyState && (
        <div className="text-center py-12">
          <div className="text-giv-neutral-700 text-lg">No updates yet.</div>
          <div className="text-giv-neutral-700 text-sm mt-2">
            When the project posts updates, they’ll show up here.
          </div>
        </div>
      )}

      {!isLoading && !error && (timelineUpdates.length > 0 || total > 0) && (
        <div className="space-y-0 relative">
          {timelineUpdates.map((u, idx) => {
            const date = new Date(u.createdAt)
            const day = format(date, 'd')
            const month = format(date, 'MMM').toUpperCase()
            const year = format(date, 'yyyy')
            const isLast = idx === timelineUpdates.length - 1
            const dateKey = format(date, 'yyyy-MM-dd')
            const nextDateKey =
              idx < timelineUpdates.length - 1
                ? format(
                    new Date(timelineUpdates[idx + 1].createdAt),
                    'yyyy-MM-dd',
                  )
                : null
            // Only show the date label for the *last* item in a same-day group,
            // so "Project Launched! 🎉" keeps its own date even if the update above shares it.
            const showDate = isLast || dateKey !== nextDateKey

            return (
              <div
                key={u.id}
                className={`grid grid-cols-[60px_1fr] gap-12 ${
                  isLast ? '' : 'pb-28'
                }`}
              >
                {/* Date + timeline */}
                <div className="relative text-center">
                  <div className="leading-none">
                    <div className="text-xs font-medium text-giv-neutral-600">
                      <span className={showDate ? '' : 'invisible'}>{day}</span>
                    </div>
                    <div className="text-base font-medium tracking-wide text-giv-neutral-800">
                      <span className={showDate ? '' : 'invisible'}>
                        {month}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-giv-neutral-600">
                      <span className={showDate ? '' : 'invisible'}>
                        {year}
                      </span>
                    </div>
                  </div>
                  <div className="mx-auto mt-4 h-full w-px bg-giv-neutral-300" />
                </div>

                {/* Content */}
                <div className="border-b border-giv-neutral-400 pb-6">
                  <div className="text-2xl text-giv-neutral-700">{u.title}</div>

                  {u.content?.trim() && (
                    <div className="mt-6">
                      <ReactQuill
                        value={u.content}
                        readOnly={true}
                        theme="snow"
                        modules={modules}
                        formats={formats}
                        className={clsx(
                          'ql-readonly',
                          '[&_.ql-container]:border-none!',
                          '[&_.ql-toolbar]:hidden',
                          '[&_.ql-editor]:text-giv-deep-blue-800',
                          '[&_.ql-editor]:leading-7',
                          '[&_.ql-editor]:p-0',
                          '[&_.ql-editor_p]:text-base',
                          '[&_.ql-editor_p]:text-giv-neutral-900',
                          '[&_.ql-editor_h1]:text-giv-deep-blue-800',
                          '[&_.ql-editor_h1]:font-bold',
                          '[&_.ql-editor_h1]:tracking-tight',
                          '[&_.ql-editor_h2]:text-giv-deep-blue-800',
                          '[&_.ql-editor_h2]:font-semibold',
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
