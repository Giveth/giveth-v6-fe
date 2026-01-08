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
