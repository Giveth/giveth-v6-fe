'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type Route } from 'next/types'
import { IconX } from '@/components/icons/IconX'
import { IconDiscord } from '@/components/icons/socials-networks/IconDiscord'
import { IconDocs } from '@/components/icons/socials-networks/IconDocs'
import { IconGithub } from '@/components/icons/socials-networks/IconGithub'
import { IconInstagram } from '@/components/icons/socials-networks/IconInstagram'
import { IconMedium } from '@/components/icons/socials-networks/IconMedium'
import { IconReddit } from '@/components/icons/socials-networks/IconReddit'
import { IconWarpcast } from '@/components/icons/socials-networks/IconWarpcast'
import { IconYoutube } from '@/components/icons/socials-networks/IconYoutube'
import {
  aboutUsLink,
  documentationLink,
  faqLink,
  joinUsLink,
  onboardingGuideLink,
  partnershipsLink,
  supportLink,
  termsOfUseLink,
  leaveFeedbackLink,
  InstagramLink,
  MediumLink,
  GithubLink,
  RedditLink,
  XLink,
  WarpcastLink,
  YoutubeLink,
  DiscordLink,
} from '@/lib/constants/menu-links'

export function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith('/create/project')) return null

  return (
    <footer className="bg-giv-neutral-200 pt-16 pb-8">
      <div className="px-4 md:px-16">
        <div
          className="
            grid gap-8
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-[1fr_1fr__2fr]
          "
        >
          {/* Column 1 */}
          <div className="flex flex-col gap-2">
            <Link
              href={{ pathname: aboutUsLink.href as Route }}
              className="text-base text-gray-600 hover:text-gray-900"
            >
              {aboutUsLink.label}
            </Link>

            <Link
              href={{ pathname: onboardingGuideLink.href as Route }}
              className="text-base text-gray-600 hover:text-gray-900"
            >
              {onboardingGuideLink.label}
            </Link>

            <Link
              href={{ pathname: documentationLink.href as Route }}
              target={documentationLink.target}
              rel={
                documentationLink.target === '_blank'
                  ? 'noopener noreferrer'
                  : undefined
              }
              className="text-base text-gray-600 hover:text-gray-900"
            >
              {documentationLink.label}
            </Link>
            <Link
              href={{ pathname: partnershipsLink.href as Route }}
              className="text-base text-gray-600 hover:text-gray-900"
            >
              {partnershipsLink.label}
            </Link>

            <Link
              href={{ pathname: joinUsLink.href as Route }}
              className="text-base text-gray-600 hover:text-gray-900"
            >
              {joinUsLink.label}
            </Link>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-2">
            <Link
              href={{ pathname: faqLink.href as Route }}
              className="text-base text-gray-600 hover:text-gray-900"
            >
              {faqLink.label}
            </Link>

            <Link
              href={{ pathname: supportLink.href as Route }}
              className="text-base text-gray-600 hover:text-gray-900"
            >
              {supportLink.label}
            </Link>

            <Link
              href={{ pathname: leaveFeedbackLink.href as Route }}
              target={leaveFeedbackLink.target}
              rel={
                leaveFeedbackLink.target === '_blank'
                  ? 'noopener noreferrer'
                  : undefined
              }
              className="text-base text-gray-600 hover:text-gray-900"
            >
              {leaveFeedbackLink.label}
            </Link>

            <Link
              href={{ pathname: termsOfUseLink.href as Route }}
              className="text-base text-gray-600 hover:text-gray-900"
            >
              {termsOfUseLink.label}
            </Link>
          </div>

          {/* Column 3*/}
          <div className="flex flex-col gap-6 md:justify-self-end">
            <div className="flex flex-wrap gap-4">
              <Link
                href={{ pathname: InstagramLink.href as Route }}
                target={InstagramLink.target}
                rel={
                  InstagramLink.target === '_blank'
                    ? 'noopener noreferrer'
                    : undefined
                }
                className="text-gray-400 hover:text-gray-900"
              >
                <IconInstagram width={20} height={20} />
              </Link>
              <Link
                href={{ pathname: MediumLink.href as Route }}
                target={MediumLink.target}
                rel={
                  MediumLink.target === '_blank'
                    ? 'noopener noreferrer'
                    : undefined
                }
                className="text-gray-400 hover:text-gray-900"
              >
                <IconMedium width={20} height={20} />
              </Link>
              <Link
                href={{ pathname: GithubLink.href as Route }}
                target={GithubLink.target}
                rel={
                  GithubLink.target === '_blank'
                    ? 'noopener noreferrer'
                    : undefined
                }
                className="text-gray-400 hover:text-gray-900"
              >
                <IconGithub width={20} height={20} />
              </Link>
              <Link
                href={{ pathname: RedditLink.href as Route }}
                target={RedditLink.target}
                rel={
                  RedditLink.target === '_blank'
                    ? 'noopener noreferrer'
                    : undefined
                }
                className="text-gray-400 hover:text-gray-900"
              >
                <IconReddit width={20} height={20} />
              </Link>
              <Link
                href={{ pathname: XLink.href as Route }}
                target={XLink.target}
                rel={
                  XLink.target === '_blank' ? 'noopener noreferrer' : undefined
                }
                className="text-gray-400 hover:text-gray-900"
              >
                <IconX width={20} height={20} />
              </Link>
              <Link
                href={{ pathname: WarpcastLink.href as Route }}
                target={WarpcastLink.target}
                rel={
                  WarpcastLink.target === '_blank'
                    ? 'noopener noreferrer'
                    : undefined
                }
                className="text-gray-400 hover:text-gray-900"
              >
                <IconWarpcast width={20} height={20} />
              </Link>
              <Link
                href={{ pathname: YoutubeLink.href as Route }}
                target={YoutubeLink.target}
                rel={
                  YoutubeLink.target === '_blank'
                    ? 'noopener noreferrer'
                    : undefined
                }
                className="text-gray-400 hover:text-gray-900"
              >
                <IconYoutube width={20} height={20} />
              </Link>
              <Link
                href={{ pathname: DiscordLink.href as Route }}
                target={DiscordLink.target}
                rel={
                  DiscordLink.target === '_blank'
                    ? 'noopener noreferrer'
                    : undefined
                }
                className="text-gray-400 hover:text-gray-900"
              >
                <IconDiscord width={20} height={20} />
              </Link>
              <Link
                href={{ pathname: documentationLink.href as Route }}
                target={documentationLink.target}
                rel={
                  documentationLink.target === '_blank'
                    ? 'noopener noreferrer'
                    : undefined
                }
                className="text-gray-400 hover:text-gray-900"
              >
                <IconDocs width={20} height={20} />
              </Link>
            </div>

            <div className="flex items-center justify-start gap-1">
              <span className="text-sm font-bold text-gray-900">
                Support us
              </span>
              <Link
                href="https://giveth.io/project/the-giveth-community-of-makers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-giv-pink-500! hover:text-giv-pink-200!"
              >
                with your donation
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        {/* <div className="mt-16 flex justify-end border-t border-gray-100 pt-8">
          <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 0L10.3511 5.23607L16.0902 5.87785L11.8197 9.76393L12.9787 15.3666L8 12.5L3.02127 15.3666L4.18034 9.76393L-0.0901699 5.87785L5.64886 5.23607L8 0Z" />
            </svg>
            Choose Language
          </button>
        </div> */}
      </div>
    </footer>
  )
}
