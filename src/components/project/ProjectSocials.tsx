'use client'

import Link from 'next/link'
import {
  Facebook,
  Github,
  Globe,
  Instagram,
  Linkedin,
  MessageCircle,
  Send,
  Twitter,
  Youtube,
} from 'lucide-react'
import { type Route } from 'next'
import { ensureHttps, getSocialMediaHandle } from '@/lib/social-media'

export type ProjectSocialMedia = {
  id: string
  type: string
  link: string
}

function SocialIcon({ type }: { type: string }) {
  const t = type.toLowerCase()
  const props = { size: 18, strokeWidth: 2 } as const

  switch (t) {
    case 'facebook':
      return <Facebook {...props} />
    case 'x':
    case 'twitter':
      return <Twitter {...props} />
    case 'instagram':
      return <Instagram {...props} />
    case 'youtube':
      return <Youtube {...props} />
    case 'linkedin':
      return <Linkedin {...props} />
    case 'telegram':
      return <Send {...props} />
    case 'discord':
      // lucide doesn't ship a brand Discord icon; this is the closest "chat" glyph.
      return <MessageCircle {...props} />
    case 'github':
      return <Github {...props} />
    case 'website':
    default:
      return <Globe {...props} />
  }
}

export function ProjectSocials({
  socialMedia,
}: {
  socialMedia: ProjectSocialMedia[]
}) {
  if (!socialMedia?.length) return null

  return (
    <div className="mt-2">
      <div className="font-semibold text-giv-gray-800">
        Find us on Social Media
      </div>
      <div className="mt-4 flex flex-wrap gap-6">
        {socialMedia.map(social => {
          return (
            <Link
              key={social.id || `${social.type}:${social.link}`}
              href={{ pathname: ensureHttps(social.link) as Route }}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex"
            >
              <div className="px-6 py-3 rounded-md border border-giv-gray-300 text-giv-gray-900 hover:bg-giv-gray-300 transition-colors">
                <div className="flex items-center gap-2">
                  <SocialIcon type={social.type} />
                  <div className="text-base font-medium">
                    {getSocialMediaHandle(social.link, social.type)}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      <div className="mt-4 text-giv-gray-800 text-sm">
        Giveth does NOT verify social media links published by projects, click
        at your own discretion!
      </div>
    </div>
  )
}
