import dynamic from 'next/dynamic'
import clsx from 'clsx'
import { ProjectCategories } from '@/components/project/ProjectCategories'
import {
  type ProjectSocialMedia,
  ProjectSocials,
} from '@/components/project/ProjectSocials'
import type { ProjectBySlugQuery } from '@/lib/graphql/generated/graphql'
import { groupByMainCategory } from '@/lib/helpers/projectHelper'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
})

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
  const displayDescription =
    description || descriptionSummary || 'No description available.'

  const modules = {
    toolbar: false, // Disable toolbar for read-only mode
  }

  const projectCategories = groupByMainCategory(_categories ?? [])

  const formats = [
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
  ]

  return (
    <div>
      <div className="prose prose-lg max-w-none">
        <ReactQuill
          value={displayDescription}
          readOnly={true}
          theme="snow"
          modules={modules}
          formats={formats}
          className={clsx(
            'ql-readonly',
            '[&_.ql-container]:border-none!',
            '[&_.ql-toolbar]:hidden',
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
        />
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
