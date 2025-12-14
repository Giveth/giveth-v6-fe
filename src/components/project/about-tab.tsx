import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
})

interface AboutTabProps {
  description?: string | null
  descriptionSummary?: string | null
}

export function AboutTab({ description, descriptionSummary }: AboutTabProps) {
  const displayDescription =
    description || descriptionSummary || 'No description available.'

  const modules = {
    toolbar: false, // Disable toolbar for read-only mode
  }

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
    'bullet',
    'indent',
    'link',
    'image',
    'video',
  ]

  return (
    <div className="max-w-4xl">
      <div className="prose prose-lg max-w-none">
        <ReactQuill
          value={displayDescription}
          readOnly={true}
          theme="snow"
          modules={modules}
          formats={formats}
          className="ql-readonly [&_.ql-container]:!border-none [&_.ql-toolbar]:hidden [&_.ql-editor]:text-[#1f2333] [&_.ql-editor]:leading-relaxed [&_.ql-editor_.ql-video-wrapper]:mb-4 [&_.ql-editor_.ql-video-wrapper]:relative [&_.ql-editor_.ql-video-wrapper]:pb-[56.25%] [&_.ql-editor_.ql-video-wrapper]:h-0 [&_.ql-editor_.ql-video-wrapper]:overflow-hidden [&_.ql-editor_.ql-video-wrapper_iframe]:absolute [&_.ql-editor_.ql-video-wrapper_iframe]:top-0 [&_.ql-editor_.ql-video-wrapper_iframe]:left-0 [&_.ql-editor_.ql-video-wrapper_iframe]:w-full [&_.ql-editor_.ql-video-wrapper_iframe]:h-full [&_.ql-editor_img]:max-w-full [&_.ql-editor_img]:h-auto [&_.ql-editor_img]:rounded-lg"
        />
      </div>
    </div>
  )
}
