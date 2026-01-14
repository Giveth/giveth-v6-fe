import { env } from '@/lib/env'

const oldFrontend = env.OLD_FRONTEND_URL

const oldFrontendPath = (path: string, fallback: string) =>
  oldFrontend ? `${oldFrontend}${path}` : fallback

export const LogoLink = oldFrontend ?? '/'

// Menu items for the navigation
export const menuItems = [
  {
    label: 'Donate',
    href: '/qf',
  },
  {
    label: 'GIVeconomy',
    href: oldFrontendPath('/givfarm', '/givfarm'),
    submenu: [
      {
        label: 'Stake GIV',
        href: oldFrontendPath('/givfarm', '/givfarm'),
      },
      {
        label: 'GIVbacks',
        href: oldFrontendPath('/givbacks', '/givbacks'),
      },
    ],
  },
  {
    label: 'Community',
    href: oldFrontendPath('/onboarding', '/onboarding'),
    submenu: [
      {
        label: 'Get Started',
        href: oldFrontendPath('/onboarding', '/onboarding'),
      },
      {
        label: 'Givers NFT',
        href: oldFrontendPath('/nft', '/nft'),
      },
      {
        label: 'About Us',
        href: oldFrontendPath('/about', '/about'),
      },
      {
        label: 'Vote',
        href: oldFrontendPath('/vote', '/vote'),
      },
      {
        label: 'Join Us',
        href: oldFrontendPath('/join', '/join'),
      },
      {
        label: 'Leave Feedback',
        href: oldFrontendPath('/feedback', '/feedback'),
      },
    ],
  },
]

export const createProjectLink = {
  label: 'Create A Project',
  href: oldFrontendPath('/create', '/create'),
}

export const givpowerDocLink = {
  label: 'GIVpower Documentation',
  href: 'https://docs.giveth.io/givpower',
}

export const givBacksLink = {
  label: 'GIVBacks',
  href: oldFrontendPath('/givbacks', '/givbacks'),
}

export const projectsLink = {
  label: 'Projects',
  href: oldFrontendPath('/projects/all', '/projects/all'),
}

export const aboutUsLink = {
  label: 'About Us',
  href: oldFrontendPath('/about', '/about'),
}

export const faqLink = {
  label: 'FAQ',
  href: oldFrontendPath('/faq', '/faq'),
}

export const supportLink = {
  label: 'Support',
  href: oldFrontendPath('/support', '/support'),
}

export const joinUsLink = {
  label: 'Join Us',
  href: oldFrontendPath('/join', '/join'),
}

export const documentationLink = {
  label: 'Documentation',
  href: 'https://docs.giveth.io',
  target: '_blank',
}

export const termsOfUseLink = {
  label: 'Terms of Use',
  href: oldFrontendPath('/tos', '/tos'),
}

export const onboardingGuideLink = {
  label: 'Onboarding Guide',
  href: oldFrontendPath('/onboarding', '/onboarding'),
}

export const partnershipsLink = {
  label: 'Partnerships',
  href: oldFrontendPath('/partnerships', '/partnerships'),
}

export const leaveFeedbackLink = {
  label: 'Leave Feedback',
  href: 'https://giveth.typeform.com/feedback',
  target: '_blank',
}
export const hiringLink = {
  label: "We're Hiring!",
  href: oldFrontendPath('/hiring', '/hiring'),
}

export const QaccLink = {
  label: 'Q/acc',
  href: 'https://qacc.giveth.io/',
  target: '_blank',
}

export const QaccNewsLink = {
  label: 'Q/acc News',
  href: 'https://qacc.giveth.io/news',
  target: '_blank',
}

export const InstagramLink = {
  label: 'Instagram',
  href: 'https://www.instagram.com/giveth.io/',
  target: '_blank',
}

export const MediumLink = {
  label: 'Medium',
  href: 'https://blog.giveth.io/',
  target: '_blank',
}

export const GithubLink = {
  label: 'Github',
  href: 'https://github.com/Giveth/',
  target: '_blank',
}

export const RedditLink = {
  label: 'Reddit',
  href: 'https://www.reddit.com/r/giveth/',
  target: '_blank',
}

export const XLink = {
  label: 'X (Twitter)',
  href: 'https://x.com/giveth',
  target: '_blank',
}

export const WarpcastLink = {
  label: 'Warpcast',
  href: 'https://warpcast.com/~/channel/giveth',
  target: '_blank',
}

export const YoutubeLink = {
  label: 'Youtube',
  href: 'https://www.youtube.com/givethio',
  target: '_blank',
}

export const DiscordLink = {
  label: 'Discord',
  href: 'https://discord.giveth.io/',
  target: '_blank',
}

export const HowItWorksLink = {
  label: 'How it works?',
  href: 'https://docs.giveth.io/quadraticfunding',
  target: '_blank',
}
