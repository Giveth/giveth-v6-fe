'use client'

import { SocialLinkField } from '@/components/project/project-form/SocialLinkField'

// Social media platform configuration
const SOCIAL_PLATFORMS = [
  {
    id: 'twitter',
    label: 'X',
    placeholder: 'https://x.com/username',
    icon: 'X',
  },
  {
    id: 'farcaster',
    label: 'Farcaster',
    placeholder: 'https://warpcast.com/username',
    icon: 'FC',
  },
  {
    id: 'lens',
    label: 'Lens',
    placeholder: 'https://lens.xyz/username',
    icon: 'L',
  },
  {
    id: 'website',
    label: 'Website',
    placeholder: 'https://yourwebsite.com',
    icon: 'W',
  },
  {
    id: 'discord',
    label: 'Discord',
    placeholder: 'https://discord.gg/invite',
    icon: 'D',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    placeholder: 'https://t.me/username',
    icon: 'T',
  },
  {
    id: 'github',
    label: 'Github',
    placeholder: 'https://github.com/username',
    icon: 'GH',
  },
  {
    id: 'youtube',
    label: 'Youtube',
    placeholder: 'https://youtube.com/@channel',
    icon: 'YT',
  },
  {
    id: 'reddit',
    label: 'Reddit',
    placeholder: 'https://reddit.com/r/subreddit',
    icon: 'R',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/username',
    icon: 'IG',
  },
  {
    id: 'threads',
    label: 'Threads',
    placeholder: 'https://threads.net/@username',
    icon: 'TH',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    placeholder: 'https://facebook.com/page',
    icon: 'FB',
  },
  {
    id: 'linkedin',
    label: 'Linkedin',
    placeholder: 'https://linkedin.com/in/username',
    icon: 'LI',
  },
] as const

export interface SocialPlatformConfig {
  id: string
  label: string
  placeholder: string
  icon: string
}

interface SocialLinksSectionProps {
  socialLinks: Record<string, string>
  onSocialLinkChange: (platform: string, value: string) => void
  onActivate: () => void
}

export function SocialLinksSection({
  socialLinks,
  onSocialLinkChange,
  onActivate,
}: SocialLinksSectionProps) {
  const platforms = SOCIAL_PLATFORMS
  return (
    <section
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      <h2 className="text-base font-semibold text-giv-neutral-900 mb-4">
        Social Media Links
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Add your project&apos;s social media links (optional).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map(platform => (
          <SocialLinkField
            key={platform.id}
            id={platform.id}
            label={platform.label}
            icon={platform.icon}
            placeholder={platform.placeholder}
            value={socialLinks[platform.id] || ''}
            onChange={value => onSocialLinkChange(platform.id, value)}
          />
        ))}
      </div>
    </section>
  )
}
