'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Paperclip, X } from 'lucide-react'
import { useSiweAuth } from '@/context/AuthContext'
import { uploadImageFile } from '@/lib/graphql/upload'
import { cn } from '@/lib/utils'
import {
  CREATE_PROJECT_CHAT_HISTORY_STORAGE_KEY,
  useCreateProjectDraftStore,
  type CreateProjectDraft,
} from '@/stores/createProjectDraft.store'

export function AiChatPanel({
  heading = 'Let’s create your Project',
  placeholder = 'My project is about...',
  showWelcomeBubble = true,
  onAiFormUpdated,
}: {
  heading?: string
  placeholder?: string
  showWelcomeBubble?: boolean
  onAiFormUpdated?: () => void
}) {
  const { token } = useSiweAuth()
  const draft = useCreateProjectDraftStore(s => s.draft)
  const applyPatch = useCreateProjectDraftStore(s => s.applyPatch)

  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const welcome = useMemo(
    () => ({
      title: 'Hi there!',
      body: [
        'Welcome to creating your project on Giveth. Tell me about your idea in the chat, and I’ll help fill out the form.',
        'Or edit the form directly, edits sync both ways.',
        'What’s your project about?',
      ],
    }),
    [],
  )

  const [messages, setMessages] = useState<
    { id: string; role: 'assistant' | 'user'; content: string }[]
  >(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(
          CREATE_PROJECT_CHAT_HISTORY_STORAGE_KEY,
        )
        if (raw) {
          const parsed = JSON.parse(raw) as unknown
          if (Array.isArray(parsed)) {
            return parsed.filter(
              item =>
                typeof item === 'object' &&
                item !== null &&
                ('role' in item || 'content' in item),
            ) as { id: string; role: 'assistant' | 'user'; content: string }[]
          }
        }
      } catch {
        // Ignore malformed local storage and use default welcome message.
      }
    }

    return showWelcomeBubble
      ? [
          {
            id: 'welcome',
            role: 'assistant',
            content: `${welcome.title}\n\n${welcome.body.join('\n')}`,
          },
        ]
      : []
  })
  const hasUserStartedChat = messages.some(m => m.role === 'user')
  const lastAssistantMessageId = [...messages]
    .reverse()
    .find(m => m.role === 'assistant')?.id

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CREATE_PROJECT_CHAT_HISTORY_STORAGE_KEY,
        JSON.stringify(messages),
      )
    } catch {
      // Ignore storage errors.
    }
  }, [messages])

  const send = async () => {
    const raw = input
    const text = raw.trim()
    if (!text || isSending || isUploadingImage) return

    const attachmentImageUrl = attachedImageUrl

    setError(null)
    setIsSending(true)
    setInput('')
    // Match ChatGPT behavior: once you send a message, clear the local attachment preview.
    // (This is an attachment only; it should not auto-fill the sidebar image field.)
    setAttachedImageUrl(null)
    resetComposerHeight(composerRef.current)
    const assistantMessageId = cryptoId()
    setMessages(prev => [
      ...prev,
      // Preserve the exact input for chat history (including newlines).
      { id: cryptoId(), role: 'user', content: raw },
      { id: assistantMessageId, role: 'assistant', content: '' },
    ])
    scrollToBottom()

    try {
      const res = await fetch('/api/ai/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          draft,
          attachmentImageUrl: attachmentImageUrl || undefined,
          history: messages.slice(-12),
        }),
      })

      if (!res.ok) {
        const msg = await safeReadText(res)
        throw new Error(msg || `AI request failed (${res.status})`)
      }

      const contentType = res.headers.get('content-type') || ''
      if (!contentType.includes('text/event-stream')) {
        const data = (await res.json()) as {
          assistantMessage: string
          patch?: Partial<CreateProjectDraft>
        }
        if (data.patch) applyPatch(data.patch)
        if (data.patch) onAiFormUpdated?.()
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: data.assistantMessage }
              : msg,
          ),
        )
        scrollToBottom()
      } else {
        const reader = res.body?.getReader()
        if (!reader) throw new Error('Unable to read AI stream')
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          const chunks = buffer.split('\n\n')
          buffer = chunks.pop() ?? ''

          for (const chunk of chunks) {
            const line = chunk
              .split('\n')
              .find(l => l.toLowerCase().startsWith('data:'))
            if (!line) continue
            const payloadText = line.slice(5).trim()
            if (!payloadText) continue

            const payload = safeJsonParse(payloadText) as {
              type?: 'assistant_delta' | 'patch' | 'done' | 'error' | string
              delta?: string
              patch?: Partial<CreateProjectDraft>
              message?: string
            } | null
            if (!payload?.type) continue

            if (payload.type === 'assistant_delta') {
              const delta = payload.delta || ''
              if (!delta) continue
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: msg.content + delta }
                    : msg,
                ),
              )
              scrollToBottom()
            } else if (payload.type === 'patch') {
              if (payload.patch) {
                applyPatch(payload.patch)
                onAiFormUpdated?.()
              }
            } else if (payload.type === 'error') {
              throw new Error(payload.message || 'AI stream failed')
            }
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message')
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  'I couldn’t process that message right now. Please try again.',
              }
            : msg,
        ),
      )
      scrollToBottom()
    } finally {
      setIsSending(false)
    }
  }

  const handleSelectImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    // 10MB soft cap (avoid huge uploads)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image is too large (max 10MB).')
      return
    }

    setError(null)
    setIsUploadingImage(true)
    setAttachedImageUrl(null)
    try {
      const url = await uploadImageFile({ file, token })
      setAttachedImageUrl(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Image upload failed')
    } finally {
      setIsUploadingImage(false)
    }
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex-1 min-h-0 overflow-hidden px-6">
        <div ref={listRef} className="mx-auto h-full max-w-2xl overflow-y-auto">
          <div className="mt-10 space-y-6">
            {messages.map(m => (
              <ChatMessage
                key={m.id}
                role={m.role}
                content={m.content}
                showAssistantIcon={
                  m.role === 'assistant' && m.id === lastAssistantMessageId
                }
              />
            ))}
            {isSending && (
              <div className="text-sm text-[#9ca3af]">Thinking…</div>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-6 pb-6">
        <div className="mx-auto max-w-2xl">
          {!hasUserStartedChat && (
            <div className="text-center text-2xl font-semibold text-[#4b5563]">
              {heading}
            </div>
          )}

          {(isUploadingImage || attachedImageUrl) && (
            <div className="mt-5">
              <div className="flex items-center gap-3 rounded-xl border border-[#eef0f7] bg-white p-3 shadow-xs">
                <div className="relative size-14 overflow-hidden rounded-lg bg-[#f3f4f6]">
                  {attachedImageUrl ? (
                    <Image
                      alt="Uploaded"
                      src={attachedImageUrl}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="h-full w-full animate-pulse bg-[#edeefe]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#111827]">
                    {isUploadingImage ? 'Uploading image…' : 'Image attached'}
                  </div>
                  {attachedImageUrl && (
                    <div className="truncate text-xs text-[#6b7280]">
                      {attachedImageUrl}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]',
                    isUploadingImage && 'opacity-50',
                  )}
                  aria-label="Remove image"
                  disabled={isUploadingImage}
                  onClick={() => {
                    setAttachedImageUrl(null)
                  }}
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-[#eef0f7] bg-white px-3 py-2 shadow-sm">
            <div className="flex items-end gap-2">
              <button
                type="button"
                className={cn(
                  'inline-flex h-[34px] w-14 items-center justify-center rounded-[20px] border border-[#dfe1ef] bg-[#f3f2ff] text-[#4f3de8] transition hover:bg-[#ebe9ff]',
                )}
                aria-label="Attach"
                disabled={isUploadingImage || isSending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="size-5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  // Allow re-selecting the same file later
                  e.target.value = ''
                  if (!file) return
                  void handleSelectImage(file)
                }}
              />

              <textarea
                ref={composerRef}
                id="ai-chat-input"
                name="ai-chat-input"
                rows={1}
                className="max-h-56 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed text-[#111827] outline-none placeholder:text-[#9ca3af] [scrollbar-width:thin]"
                placeholder={placeholder}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key !== 'Enter') return
                  if (e.shiftKey) {
                    // Let the browser insert a newline, then expand the composer.
                    queueMicrotask(() =>
                      resizeComposerToFit(composerRef.current),
                    )
                    return
                  }

                  e.preventDefault()
                  void send()
                }}
                onInput={() => resizeComposerToFit(composerRef.current)}
              />

              <button
                type="button"
                className={cn(
                  'inline-flex h-[34px] w-14 items-center justify-center rounded-[20px] border border-[#dfe1ef] bg-[#f3f2ff] text-[#4f3de8] transition hover:bg-[#ebe9ff]',
                )}
                aria-label="Send"
                disabled={isSending || isUploadingImage || !input.trim()}
                onClick={() => void send()}
              >
                <ArrowRight className="size-5" />
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-2 text-center text-xs font-medium text-red-600">
              {error}
            </p>
          )}

          <p className="mt-3 text-center text-xs text-[#9ca3af]">
            Please double-check AI generated contents.
          </p>
        </div>
      </div>
    </div>
  )
}

function cryptoId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

async function safeReadText(res: Response) {
  try {
    return await res.text()
  } catch {
    return ''
  }
}

function resizeComposerToFit(el: HTMLTextAreaElement | null) {
  if (!el) return
  // Allow it to shrink when text is removed.
  el.style.height = 'auto'
  // Clamp growth for huge pastes; then scroll within.
  const maxPx = 224 // matches max-h-56 (14rem)
  const next = Math.min(el.scrollHeight, maxPx)
  el.style.height = `${Math.max(next, 40)}px`
  el.style.overflowY = el.scrollHeight > maxPx ? 'auto' : 'hidden'
}

function resetComposerHeight(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = '40px'
  el.style.overflowY = 'hidden'
}

function ChatMessage({
  role,
  content,
  showAssistantIcon,
}: {
  role: 'assistant' | 'user'
  content: string
  showAssistantIcon?: boolean
}) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-[34px] rounded-br-[14px] border border-[#e3e2fb] bg-[#f3f2ff] px-5 py-3 text-sm text-[#111827]">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4">
      <div className="relative mt-1 size-12 shrink-0">
        {showAssistantIcon ? (
          <Image
            alt="AI assistant"
            src="/images/create-project/agent-icon.png"
            fill
            className="rounded-full object-cover"
            sizes="48px"
            priority
          />
        ) : null}
      </div>
      <div className="max-w-[85%] whitespace-pre-wrap rounded-[34px] rounded-tl-[14px] border border-[#eef0f7] bg-white px-5 py-4 text-sm leading-relaxed text-[#4b5563] shadow-sm">
        {content}
      </div>
    </div>
  )
}

function safeJsonParse(text: string): unknown | null {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}
