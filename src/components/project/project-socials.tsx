'use client'

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
import { ensureHttps, getSocialMediaHandle } from '@/lib/social-media'

export type ProjectSocialMedia = {
  id: string
  type: string
  link: string
}

const SOCIAL_COLORS: Record<string, string> = {
  facebook: '#4267B2',
  x: '#26A7DE',
  twitter: '#26A7DE',
  instagram: '#8668FC',
  youtube: '#C4302B',
  linkedin: '#165FFA',
  reddit: '#FF5700',
  discord: '#7289DA',
  website: '#2EA096',
  telegram: '#229ED9',
  github: '#1D1E1F',
}

function getSocialColor(type: string) {
  return SOCIAL_COLORS[type.toLowerCase()] ?? SOCIAL_COLORS.website
}

function SocialIcon({ type, color }: { type: string; color: string }) {
  const t = type.toLowerCase()
  const props = { size: 18, color, strokeWidth: 2 } as const

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
    <div>
      <div className="font-semibold text-[#1f2333]">
        Find us on Social Media
      </div>
      <div className="mt-4 flex flex-wrap gap-6">
        {socialMedia.map(social => {
          const color = getSocialColor(social.type)
          return (
            <a
              key={social.id || `${social.type}:${social.link}`}
              href={ensureHttps(social.link)}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex"
            >
              <div className="px-6 py-4 rounded-full bg-[#f3f4f8] shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-2">
                  <SocialIcon type={social.type} color={color} />
                  <div className="font-semibold" style={{ color }}>
                    {getSocialMediaHandle(social.link, social.type)}
                  </div>
                </div>
              </div>
            </a>
          )
        })}
      </div>
      <div className="mt-4 text-[#4b5563] text-sm italic">
        Giveth does NOT verify social media links published by projects, click
        at your own discretion!
      </div>
    </div>
  )
}
