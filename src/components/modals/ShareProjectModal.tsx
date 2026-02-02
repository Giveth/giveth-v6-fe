'use client'

import { useMemo, useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Dialog, Flex, Text } from '@radix-ui/themes'
import { Facebook, Linkedin, Share2, X } from 'lucide-react'
import type {
  EContentType,
  EContentTypeCause,
} from '@/lib/constants/share-constants'
import {
  ESocialType,
  shareContentCreator,
  shareContentCreatorCause,
} from '@/lib/constants/share-constants'
import { env } from '@/lib/env'

type ShareProjectModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** If provided, this exact URL will be shared/copied. */
  shareUrl?: string
  /** Convenience: builds URL as `${env.OLD_FRONTEND_URL}/project/${projectSlug}` when shareUrl is not provided. */
  projectSlug?: string
  /** Main heading in the modal body. */
  heading?: string
  /** Optional description under heading. */
  description?: string
  /** If provided, share copy will be generated via `shareContentCreator*` (matches old FE behavior). */
  contentType?: EContentType | EContentTypeCause
  /** For causes only (affects copy generation and Warpcast URL formatting). */
  isCause?: boolean
  /** Used for cause share copy generation. */
  numberOfProjects?: number
  /** Optional share text used when `contentType` is not provided. */
  shareText?: string
}

export function ShareProjectModal({
  open,
  onOpenChange,
  shareUrl,
  projectSlug,
  heading = 'Share this with your friends!',
  description = 'Share this project with your friends and family to help it grow.',
  contentType,
  isCause = false,
  numberOfProjects = 0,
  shareText = 'Check out this project on Giveth',
}: ShareProjectModalProps) {
  const [copied, setCopied] = useState(false)

  const url = useMemo(() => {
    if (shareUrl) return shareUrl
    if (projectSlug) return `${env.OLD_FRONTEND_URL}/project/${projectSlug}`
    return env.OLD_FRONTEND_URL
  }, [shareUrl, projectSlug])

  const shareTextTwitter = useMemo(() => {
    if (!contentType) return shareText
    if (isCause) {
      return shareContentCreatorCause(
        contentType,
        ESocialType.twitter,
        numberOfProjects,
      )
    }
    return shareContentCreator(contentType as EContentType, ESocialType.twitter)
  }, [contentType, isCause, numberOfProjects, shareText])

  const shareTextLinkedin = useMemo(() => {
    if (!contentType) return shareText
    if (isCause) {
      return shareContentCreatorCause(
        contentType,
        ESocialType.linkedin,
        numberOfProjects,
      )
    }
    return shareContentCreator(
      contentType as EContentType,
      ESocialType.linkedin,
    )
  }, [contentType, isCause, numberOfProjects, shareText])

  const shareTextFacebook = useMemo(() => {
    if (!contentType) return shareText
    if (isCause) {
      return shareContentCreatorCause(
        contentType,
        ESocialType.facebook,
        numberOfProjects,
      )
    }
    return shareContentCreator(
      contentType as EContentType,
      ESocialType.facebook,
    )
  }, [contentType, isCause, numberOfProjects, shareText])

  const xHref = useMemo(() => {
    // Note: `shareContentCreator*` already includes trailing newlines.
    const text = `${shareTextTwitter}${url}`
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
  }, [shareTextTwitter, url])

  const linkedinHref = useMemo(() => {
    // Use shareArticle so we can pass text. (LinkedIn may ignore title/summary depending on platform.)
    const title = shareTextLinkedin.trim()
    return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
      url,
    )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(title)}`
  }, [url, shareTextLinkedin])

  const facebookHref = useMemo(() => {
    const quote = shareTextFacebook
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url,
    )}&quote=${encodeURIComponent(quote)}`
  }, [url, shareTextFacebook])

  const warpcastHref = useMemo(() => {
    if (isCause) {
      // Matches old FE behavior for causes: embed the link + separate text.
      return `https://warpcast.com/~/compose?embeds[]=${encodeURIComponent(
        url,
      )}&text=${encodeURIComponent(shareTextTwitter)}`
    }
    const text = `${shareTextTwitter}${url}`
    return `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`
  }, [isCause, shareTextTwitter, url])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="3" className="w-[92vw] max-w-[720px] rounded-3xl">
        <Dialog.Title className="sr-only">Share</Dialog.Title>
        <Dialog.Description className="sr-only">
          Share this page via social media or copy the link.
        </Dialog.Description>

        <div className="px-6 py-5">
          {/* Header */}
          <Flex align="center" justify="between" className="mb-10">
            <div className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-giv-neutral-900" />
              <Text size="4" weight="bold" className="text-giv-neutral-900">
                Share
              </Text>
            </div>
            <Dialog.Close>
              <button
                type="button"
                aria-label="Close"
                className="rounded-full p-2 hover:bg-black/5 cursor-pointer"
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Flex>

          {/* Body */}
          <div className="text-center">
            <Text
              as="div"
              size="7"
              weight="bold"
              className="text-giv-neutral-900"
            >
              {heading}
            </Text>
            {description && (
              <Text as="div" size="3" className="mt-2 text-giv-neutral-700">
                {description}
              </Text>
            )}
          </div>

          {/* Social buttons */}
          <div className="mt-10 flex justify-center gap-4">
            <ShareSquareLink href={xHref} label="Share on X">
              <X className="h-5 w-5 text-giv-neutral-900" />
            </ShareSquareLink>
            <ShareSquareLink href={linkedinHref} label="Share on LinkedIn">
              <Linkedin className="h-5 w-5 text-giv-link-500" />
            </ShareSquareLink>
            <ShareSquareLink href={facebookHref} label="Share on Facebook">
              <Facebook className="h-5 w-5 text-giv-link-500" />
            </ShareSquareLink>
            <ShareSquareLink href={warpcastHref} label="Share on Warpcast">
              <WarpcastIcon className="h-5 w-5 text-giv-brand-500" />
            </ShareSquareLink>
          </div>

          {/* Copy link */}
          <div className="mt-10 text-center">
            <Text as="div" size="3" className="text-giv-neutral-900">
              Or copy the link
            </Text>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-giv-neutral-100 bg-white px-4 py-3">
              <Text
                as="div"
                size="2"
                className="truncate text-giv-link-500"
                title={url}
              >
                {url}
              </Text>

              <button
                type="button"
                onClick={copyToClipboard}
                className="shrink-0 rounded-full bg-giv-neutral-100 px-4 py-2 text-sm font-bold text-giv-neutral-900 hover:bg-giv-neutral-200 transition-colors cursor-pointer"
              >
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Dismiss */}
          <div className="mt-10 text-center">
            <Dialog.Close>
              <button
                type="button"
                className="text-sm font-medium text-giv-neutral-700 hover:text-giv-neutral-900 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </Dialog.Close>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}

function ShareSquareLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-giv-neutral-100 bg-white hover:bg-giv-neutral-200 transition-colors"
    >
      {children}
    </a>
  )
}

function WarpcastIcon({ className }: { className?: string }) {
  // Minimal Warpcast/Farcaster-style icon
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 3h12v18h-2.5v-7.2c0-2-1.6-3.6-3.6-3.6h-.8c-2 0-3.6 1.6-3.6 3.6V21H6V3Zm4.3 18v-7.2c0-.9.7-1.6 1.6-1.6h.8c.9 0 1.6.7 1.6 1.6V21h-4Z" />
    </svg>
  )
}
