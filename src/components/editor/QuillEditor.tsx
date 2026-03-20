'use client'

import { useMemo, useRef, useState, useCallback, useEffect, useId } from 'react'
import dynamic from 'next/dynamic'
import clsx from 'clsx'
import { ColorPickerPopover } from '@/components/editor/ColorPickerPopover'
import { EMOJI_CATEGORIES } from '@/components/editor/defaultEmojis'
import {
  DEFAULT_YOUTUBE_IFRAME_HEIGHT,
  DEFAULT_YOUTUBE_IFRAME_WIDTH,
  parseEmbedUrl,
  registerEmbedBlots,
  YOUTUBE_EDIT_EVENT,
} from '@/components/editor/embedBlots'
import type {
  EmbedPayload,
  EmbedType,
  YoutubeEditEventDetail,
} from '@/components/editor/embedBlots'
import { EmbedPopover } from '@/components/editor/EmbedPopover'
import { EmojiPickerPopover } from '@/components/editor/EmojiPickerPopover'
import { registerEmojiShortcuts } from '@/components/editor/emojiShortcutsModule'
import '@/components/editor/quill-toolbar.css'

/**
 * Normalize the hex value.
 * @param input - The input value.
 * @returns The normalized hex value.
 */
function normalizeToHex(input?: string): string {
  if (!input) return '#000000'
  const value = input.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase()

  const rgbMatch = value.match(
    /^rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/i,
  )
  if (rgbMatch) {
    const toHex = (n: number) =>
      Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
    return `#${toHex(Number(rgbMatch[1]))}${toHex(Number(rgbMatch[2]))}${toHex(Number(rgbMatch[3]))}`
  }
  return '#000000'
}

/**
 * The React Quill component.
 * @returns The React Quill component.
 */
const ReactQuill = dynamic(
  () =>
    import('react-quill-new').then(mod => {
      const RQ = mod.default
      if (RQ?.Quill) {
        registerEmojiShortcuts(RQ.Quill)
        registerEmbedBlots(RQ.Quill)
      }
      return mod
    }),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center rounded-b-lg border border-t-0 border-gray-200 bg-gray-50 px-4 py-8 text-giv-neutral-600"
        aria-label="Loading editor"
      >
        Loading editor...
      </div>
    ),
  },
)

/**
 * The formats of the Quill editor.
 * @returns The formats of the Quill editor.
 */
export const QUILL_FORMATS: string[] = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'code',
  'blockquote',
  'list',
  'indent',
  'link',
  'image',
  'video',
  'youtube',
  'twitter',
  'figma',
]

/**
 * The toolbar container of the Quill editor.
 * @returns The toolbar container of the Quill editor.
 */
const QUILL_TOOLBAR_CONTAINER = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike', 'code'],
  [{ textColor: 'A' }, { bgColor: 'A' }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote'],
  ['link', 'image', 'video', 'embed'],
]

/**
 * The props for the Quill editor.
 * @returns The props for the Quill editor.
 */
export interface QuillEditorProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  className?: string
  /** Min height of the editor area (e.g. '200px' or '8rem') */
  minHeight?: string
  'aria-label'?: string
}

/**
 * The instance of the Quill editor.
 * @returns The instance of the Quill editor.
 */
type QuillEditorInstance = {
  getSelection: (focus?: boolean) => { index: number; length: number } | null
  getFormat: (
    index?: number,
    length?: number,
  ) => { color?: string; background?: string }
  insertText: (index: number, text: string) => void
  insertEmbed: (index: number, type: string, value: EmbedPayload) => void
  setSelection: (index: number, length?: number) => void
  format: (name: 'color' | 'background', value: string | false) => void
  focus: () => void
}

/**
 * The Quill editor.
 * @param id - The id of the editor.
 * @param value - The value of the editor.
 * @param onChange - The function to call when the value changes.
 * @param placeholder - The placeholder for the editor.
 * @param disabled - Whether the editor is disabled.
 * @param error - Whether the editor has an error.
 * @param className - The class name for the editor.
 * @param minHeight - The minimum height of the editor.
 * @param 'aria-label' - The aria label for the editor.
 * @returns The Quill editor.
 */
export function QuillEditor({
  id,
  value,
  onChange,
  placeholder = 'Write something...',
  disabled = false,
  error = false,
  className,
  minHeight = '200px',
  'aria-label': ariaLabel,
}: QuillEditorProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const eventId = useId()
  const emojiEventName = `quill-emoji-open-${eventId}`.replace(/:/g, '')
  const embedEventName = `quill-embed-open-${eventId}`.replace(/:/g, '')
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [embedPopoverOpen, setEmbedPopoverOpen] = useState(false)
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false)
  const [colorMode, setColorMode] = useState<'color' | 'background'>('color')
  const [colorValue, setColorValue] = useState('#000000')
  const [editingYoutube, setEditingYoutube] =
    useState<YoutubeEditEventDetail | null>(null)
  const insertIndexRef = useRef(0)
  const formatRangeRef = useRef<{ index: number; length: number } | null>(null)
  const quillInstanceRef = useRef<QuillEditorInstance | null>(null)

  const modules = useMemo(() => {
    if (disabled) {
      return {
        toolbar: false,
        emojiShortcuts: false,
      }
    }

    return {
      toolbar: {
        container: [...QUILL_TOOLBAR_CONTAINER, [{ emoji: '😀' }]],
        handlers: {
          emoji(this: { quill: QuillEditorInstance }) {
            const sel = this.quill.getSelection(true)
            insertIndexRef.current = sel ? sel.index : 0
            quillInstanceRef.current = this.quill
            window.dispatchEvent(
              new CustomEvent(emojiEventName, {
                detail: { quill: this.quill },
              }),
            )
          },
          embed(this: { quill: QuillEditorInstance }) {
            const sel = this.quill.getSelection(true)
            insertIndexRef.current = sel ? sel.index : 0
            quillInstanceRef.current = this.quill
            setEditingYoutube(null)
            window.dispatchEvent(
              new CustomEvent(embedEventName, {
                detail: { quill: this.quill },
              }),
            )
          },
          textColor(this: { quill: QuillEditorInstance }) {
            const sel = this.quill.getSelection(true)
            if (sel) {
              insertIndexRef.current = sel.index
              formatRangeRef.current = { index: sel.index, length: sel.length }
            } else {
              formatRangeRef.current = null
            }
            quillInstanceRef.current = this.quill
            const format = sel
              ? this.quill.getFormat(sel.index, sel.length)
              : this.quill.getFormat()
            setColorMode('color')
            setColorValue(normalizeToHex(format.color))
            setColorPopoverOpen(true)
          },
          bgColor(this: { quill: QuillEditorInstance }) {
            const sel = this.quill.getSelection(true)
            if (sel) {
              insertIndexRef.current = sel.index
              formatRangeRef.current = { index: sel.index, length: sel.length }
            } else {
              formatRangeRef.current = null
            }
            quillInstanceRef.current = this.quill
            const format = sel
              ? this.quill.getFormat(sel.index, sel.length)
              : this.quill.getFormat()
            setColorMode('background')
            setColorValue(normalizeToHex(format.background))
            setColorPopoverOpen(true)
          },
        },
      },
      emojiShortcuts: true,
    }
  }, [disabled, emojiEventName, embedEventName])

  useEffect(() => {
    if (disabled) return
    const handler = () => setEmojiPickerOpen(true)
    window.addEventListener(emojiEventName, handler)
    return () => window.removeEventListener(emojiEventName, handler)
  }, [disabled, emojiEventName])

  useEffect(() => {
    if (disabled) return
    const handler = () => setEmbedPopoverOpen(true)
    window.addEventListener(embedEventName, handler)
    return () => window.removeEventListener(embedEventName, handler)
  }, [disabled, embedEventName])

  useEffect(() => {
    if (disabled) return
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<YoutubeEditEventDetail>
      const detail = customEvent.detail
      if (!detail?.node) return
      if (!wrapperRef.current?.contains(detail.node)) return
      setEditingYoutube(detail)
      setEmbedPopoverOpen(true)
    }
    window.addEventListener(YOUTUBE_EDIT_EVENT, handler)
    return () => window.removeEventListener(YOUTUBE_EDIT_EVENT, handler)
  }, [disabled])

  const insertEmoji = useCallback((emoji: string) => {
    const editor = quillInstanceRef.current
    if (editor) {
      const index = insertIndexRef.current
      editor.insertText(index, emoji)
      editor.setSelection(index + emoji.length, 0)
      editor.focus()
    }
    setEmojiPickerOpen(false)
  }, [])

  const applyColorFormat = useCallback(
    (value: string | false) => {
      const editor = quillInstanceRef.current
      if (!editor) return

      const range = formatRangeRef.current
      if (range) {
        editor.setSelection(range.index, range.length)
      }
      editor.format(colorMode, value)
      editor.focus()
      setColorPopoverOpen(false)
    },
    [colorMode],
  )

  const insertEmbed = useCallback((type: EmbedType, payload: EmbedPayload) => {
    const editor = quillInstanceRef.current
    if (editor) {
      const index = insertIndexRef.current
      editor.insertEmbed(index, type, payload)
      editor.setSelection(index + 1, 0)
      editor.focus()
    }
    setEmbedPopoverOpen(false)
  }, [])

  const updateYoutubeEmbed = useCallback(
    (payload: EmbedPayload) => {
      if (!editingYoutube || typeof payload === 'string') return
      const node = editingYoutube.node
      if (!wrapperRef.current?.contains(node)) return

      const videoId = parseEmbedUrl('youtube', payload.url)
      if (!videoId) return

      const clampDimension = (value: number | undefined, fallback: number) => {
        const numeric = Number(value)
        if (!Number.isFinite(numeric) || numeric <= 0) return fallback
        return Math.min(3000, Math.round(numeric))
      }

      const width = clampDimension(payload.width, DEFAULT_YOUTUBE_IFRAME_WIDTH)
      const height = clampDimension(
        payload.height,
        DEFAULT_YOUTUBE_IFRAME_HEIGHT,
      )

      const iframe = node.querySelector<HTMLIFrameElement>('iframe')
      if (!iframe) return

      node.setAttribute('data-video-id', videoId)
      node.setAttribute('data-youtube-url', payload.url)
      node.setAttribute('data-width', String(width))
      node.setAttribute('data-height', String(height))

      iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}`)
      iframe.setAttribute('width', String(width))
      iframe.setAttribute('height', String(height))
      iframe.style.maxWidth = `${width}px`
      iframe.style.aspectRatio = `${width} / ${height}`

      const editorRoot = node.closest('.ql-editor')
      if (editorRoot instanceof HTMLElement) {
        onChange(editorRoot.innerHTML)
      }
      setEmbedPopoverOpen(false)
      setEditingYoutube(null)
    },
    [editingYoutube, onChange],
  )

  const handleEmbedSubmit = useCallback(
    (type: EmbedType, payload: EmbedPayload) => {
      if (editingYoutube?.node && type === 'youtube') {
        updateYoutubeEmbed(payload)
        return
      }
      insertEmbed(type, payload)
    },
    [editingYoutube?.node, insertEmbed, updateYoutubeEmbed],
  )

  return (
    <div
      ref={wrapperRef}
      className={clsx('quill-editor-wrapper relative', className)}
    >
      <ReactQuill
        id={id}
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={disabled}
        modules={modules}
        formats={QUILL_FORMATS}
        aria-label={ariaLabel}
        className={clsx(
          'overflow-hidden rounded-xl border border-gray-200 bg-white',
          '[&_.ql-toolbar]:rounded-none',
          '[&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b',
          '[&_.ql-toolbar]:border-gray-200 [&_.ql-toolbar]:bg-gray-50',
          '[&_.ql-container]:border-0 [&_.ql-editor]:min-h-(--quill-min-height)',
          error && 'border-red-500 [&_.ql-toolbar]:border-red-500',
        )}
        style={{ ['--quill-min-height' as string]: minHeight }}
      />
      {!disabled && emojiPickerOpen && (
        <EmojiPickerPopover
          categories={EMOJI_CATEGORIES}
          onSelect={insertEmoji}
          onClose={() => setEmojiPickerOpen(false)}
        />
      )}
      {!disabled && colorPopoverOpen && (
        <ColorPickerPopover
          mode={colorMode}
          value={colorValue}
          onSelect={applyColorFormat}
          onClose={() => setColorPopoverOpen(false)}
        />
      )}
      {!disabled && embedPopoverOpen && (
        <EmbedPopover
          onInsert={handleEmbedSubmit}
          onClose={() => {
            setEmbedPopoverOpen(false)
            setEditingYoutube(null)
          }}
          initialData={
            editingYoutube
              ? {
                  type: 'youtube',
                  url: editingYoutube.url,
                  width: editingYoutube.width,
                  height: editingYoutube.height,
                }
              : undefined
          }
          lockType={Boolean(editingYoutube)}
          submitLabel={editingYoutube ? 'Update' : 'Embed'}
        />
      )}
    </div>
  )
}
