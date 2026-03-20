'use client'

import { useCallback, useEffect, useRef } from 'react'
import Script from 'next/script'
import clsx from 'clsx'
import {
  formatContentForReadonlyQuill,
  loadTwitterWidgets,
} from '@/components/editor/readonlyQuillContent'
import { ProjectCategories } from '@/components/project/ProjectCategories'
import {
  type ProjectSocialMedia,
  ProjectSocials,
} from '@/components/project/ProjectSocials'
import type { ProjectBySlugQuery } from '@/lib/graphql/generated/graphql'
import { groupByMainCategory } from '@/lib/helpers/projectHelper'

interface AboutTabProps {
  description?: string | null
  descriptionSummary?: string | null
  socialMedia?: ProjectSocialMedia[] | null
  categories?: ProjectBySlugQuery['projectBySlug']['categories']
}

export function AboutTab({
  description,
  descriptionSummary,
  socialMedia,
  categories: _categories,
}: AboutTabProps) {
  const quillWrapperRef = useRef<HTMLDivElement>(null)
  const rawDescription =
    description || descriptionSummary || 'No description available.'
  const displayDescription = formatContentForReadonlyQuill(rawDescription)

  const hydrateTwitterEmbeds = useCallback(() => {
    loadTwitterWidgets(quillWrapperRef.current)
  }, [])

  useEffect(() => {
    hydrateTwitterEmbeds()
    const timeoutId = window.setTimeout(hydrateTwitterEmbeds, 300)
    return () => window.clearTimeout(timeoutId)
  }, [displayDescription, hydrateTwitterEmbeds])

  const projectCategories = groupByMainCategory(_categories ?? [])

  return (
    <div>
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onLoad={hydrateTwitterEmbeds}
      />
      <div className="prose prose-lg max-w-none" ref={quillWrapperRef}>
        <div
          className={clsx(
            'quill-editor-wrapper',
            'ql-readonly',
            '[&_.ql-editor]:text-giv-deep-blue-800',
            '[&_.ql-editor]:px-0!',
            '[&_.ql-editor]:text-base!',
            '[&_.ql-editor]:leading-relaxed',
            '[&_.ql-editor_.ql-video-wrapper]:mb-4',
            '[&_.ql-editor_.ql-video-wrapper]:relative',
            '[&_.ql-editor_.ql-video-wrapper]:pb-[56.25%]',
            '[&_.ql-editor_.ql-video-wrapper]:h-0',
            '[&_.ql-editor_.ql-video-wrapper]:overflow-hidden',
            '[&_.ql-editor_.ql-video-wrapper_iframe]:absolute',
            '[&_.ql-editor_.ql-video-wrapper_iframe]:top-0',
            '[&_.ql-editor_.ql-video-wrapper_iframe]:left-0',
            '[&_.ql-editor_.ql-video-wrapper_iframe]:w-full',
            '[&_.ql-editor_.ql-video-wrapper_iframe]:h-full',
            '[&_.ql-editor_img]:max-w-full',
            '[&_.ql-editor_img]:h-auto',
            '[&_.ql-editor_img]:rounded-lg',
          )}
        >
          <div
            className="ql-editor"
            dangerouslySetInnerHTML={{ __html: displayDescription }}
          />
        </div>
      </div>
      {!!socialMedia?.length && (
        <>
          <div className="my-4 h-px bg-giv-neutral-500" />
          <ProjectSocials socialMedia={socialMedia} />
        </>
      )}
      {!!projectCategories?.length && (
        <>
          <div className="my-4 h-px bg-giv-neutral-500" />
          <ProjectCategories categories={projectCategories} />
        </>
      )}
    </div>
  )
}
