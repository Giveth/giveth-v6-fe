export const LogoLink = process.env.NEXT_PUBLIC_OLD_FRONTEND_URL || '/'

// Menu items for the navigation
export const menuItems = [
  {
    label: 'Donate',
    href: '/qf',
  },
  {
    label: 'GIVeconomy',
    href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/givfarm' || '/givfarm',
    submenu: [
      {
        label: 'Stake GIV',
        href:
          process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/givfarm' || '/givfarm',
      },
      {
        label: 'GIVbacks',
        href:
          process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/givbacks' || '/givbacks',
      },
    ],
  },
  {
    label: 'Community',
    href:
      process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/onboarding' || '/onboarding',
    submenu: [
      {
        label: 'Get Started',
        href:
          process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/onboarding' ||
          '/onboarding',
      },
      {
        label: 'Givers NFT',
        href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/nft' || '/nft',
      },
      {
        label: 'About Us',
        href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/about' || '/about',
      },
      {
        label: 'Vote',
        href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/vote' || '/vote',
      },
      {
        label: 'Join Us',
        href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/join' || '/join',
      },
      {
        label: 'Leave Feedback',
        href:
          process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/feedback' || '/feedback',
      },
    ],
  },
]
