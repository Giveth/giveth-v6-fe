'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Share2 } from 'lucide-react'
import { type Route } from 'next'
import { IconFacebook } from '@/components/icons/IconFacebook'
import { IconLinkedIn } from '@/components/icons/IconLinkedIn'
import { IconX } from '@/components/icons/IconX'
import { useSiweAuth } from '@/context/AuthContext'
import { env } from '@/lib/env'

export function ShareSection() {
  const { walletAddress } = useSiweAuth()
  // Share link for all is this website
  const shareLink = useMemo(() => {
    return `${env.FRONTEND_URL}/user/${walletAddress}`
  }, [])

  const shareTextX = useMemo(() => {
    return `I just donated on @Giveth! Check out the projects I supported 💜  ${shareLink}`
  }, [shareLink])

  const xHref = useMemo(() => {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextX)}`
  }, [shareTextX])

  const shareTextLinkedin = useMemo(() => {
    return `I just donated on @Giveth! Check out the projects I supported 💜  ${shareLink}`
  }, [shareLink])

  const linkedinHref = useMemo(() => {
    return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareLink)}&title=${encodeURIComponent(shareTextLinkedin)}&summary=${encodeURIComponent(shareTextLinkedin)}`
  }, [shareLink, shareTextLinkedin])

  const shareTextFacebook = useMemo(() => {
    return `I just donated on @Giveth! Check out the projects I supported 💜  ${shareLink}`
  }, [shareLink])

  const facebookHref = useMemo(() => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(shareTextFacebook)}`
  }, [shareLink, shareTextFacebook])

  return (
    <div className="bg-white rounded-2xl p-6 font-inter">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-giv-gray-900" />
        <h2 className="text-2xl font-bold text-giv-gray-900">
          Spread the Impact!
        </h2>
      </div>

      {/* Share Message Box */}
      <div className="bg-giv-gray-200 border border-dashed border-giv-gray-500 rounded-xl p-6 mb-4">
        <p className="text-lg text-center text-giv-gray-900">
          Share your cart on socials to help projects attract even more
          donations!
        </p>
        {/* Social Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Link
            href={xHref as Route}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
            className="w-16 h-12 rounded-md bg-giv-primary-50 border border-giv-primary-100 flex items-center justify-center hover:opacity-85 transition-colors cursor-pointer"
          >
            <IconX height={24} width={24} />
          </Link>
          <Link
            href={linkedinHref as Route}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
            className="w-16 h-12 rounded-md bg-giv-primary-50 border border-giv-primary-100 flex items-center justify-center hover:opacity-85 transition-colors cursor-pointer"
          >
            <IconLinkedIn height={24} width={24} />
          </Link>
          <Link
            href={facebookHref as Route}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
            className="w-16 h-12 rounded-md bg-giv-primary-50 border border-giv-primary-100 flex items-center justify-center hover:opacity-85 transition-colors cursor-pointer"
          >
            <IconFacebook height={24} width={24} />
          </Link>
        </div>
      </div>
    </div>
  )
}
