export const LogoLink = process.env.NEXT_PUBLIC_OLD_FRONTEND_URL || '/'

// Menu items for the navigation
export const menuItems = [
  {
    label: 'Donate',
    href: '/qf',
  },
  {
    label: 'GIVeconomy',
    href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/givfarm',
    submenu: [
      {
        label: 'Stake GIV',
        href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/givfarm',
      },
      {
        label: 'GIVbacks',
        href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/givbacks',
      },
    ],
  },
  {
    label: 'Community',
    href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/onboarding',
    submenu: [
      {
        label: 'Get Started',
        href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/onboarding',
      },
      {
        label: 'Givers NFT',
        href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/nft',
      },
      {
        label: 'About Us',
        href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/about',
      },
      {
        label: 'Vote',
        href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/vote',
      },
      {
        label: 'Join Us',
        href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/join',
      },
      {
        label: 'Leave Feedback',
        href: process.env.NEXT_PUBLIC_OLD_FRONTEND_URL + '/feedback',
      },
    ],
  },
]
