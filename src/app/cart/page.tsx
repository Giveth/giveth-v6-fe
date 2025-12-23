import type { ComponentProps } from 'react'
import { DonationRound } from '@/components/cart/DonationRound'
import { DonationSidebar } from '@/components/cart/DonationSidebar'

type DonationRoundProjects = ComponentProps<typeof DonationRound>['projects']

const superDuperRoundProjects = [
  {
    id: 1,
    name: 'Geode Labs',
    image: '/geode-labs-crypto-blue-logo.jpg',
    badges: [
      {
        type: 'eligible',
        color: 'green',
        label: 'GIVbacks eligible',
      },
      {
        type: 'matching',
        color: 'green',
        amountPrefix: '0.000018',
        label: 'BTC in matching',
      },
    ],
    tokenAmount: '0.000052',
    token: 'BTC',
    usdValue: '14.00',
  },
  {
    id: 2,
    name: 'PEP Master - build trust in DIY medical instruments',
    image: '/medical-diy-instruments-logo.jpg',
    badges: [
      {
        type: 'eligible',
        color: 'gray',
        amountPrefix: '$15',
        label: 'makes you eligible for GIVbacks',
      },
      {
        type: 'matching',
        color: 'gray',
        amountPrefix: '$1',
        label: 'unlocks matching funds',
      },
    ],
    tokenAmount: '0.000012',
    token: 'BTC',
    usdValue: '4.45',
  },
] satisfies DonationRoundProjects

const bestRoundProjects = [
  {
    id: 3,
    name: 'Alphablocks',
    image: '/alphablocks-education-logo.jpg',
    badges: [
      {
        type: 'eligible',
        color: 'green',
        label: 'GIVbacks eligible',
      },
      {
        type: 'matching',
        color: 'green',
        amountPrefix: '0.000018',
        label: 'BTC in matching',
      },
    ],
    tokenAmount: '25',
    token: 'USDT',
    usdValue: '25.00',
  },
  {
    id: 4,
    name: 'Diamante Luz Center for Regenerative Living',
    image: '/regenerative-living-nature-green.jpg',
    badges: [
      {
        type: 'eligible',
        color: 'green',
        label: 'GIVbacks eligible',
      },
      {
        type: 'matching',
        color: 'green',
        amountPrefix: '0.000018',
        label: 'BTC in matching',
      },
    ],
    tokenAmount: '20',
    token: 'USDT',
    usdValue: '20.00',
  },
  {
    id: 5,
    name: 'Reforestation with biodiversity AgroForest',
    image: '/reforestation-forest-green-nature.jpg',
    badges: [
      {
        type: 'eligible',
        color: 'green',
        label: 'GIVbacks eligible',
      },
      {
        type: 'matching',
        color: 'green',
        amountPrefix: '0.000018',
        label: 'BTC in matching',
      },
    ],
    tokenAmount: '20',
    token: 'USDT',
    usdValue: '20.00',
  },
] satisfies DonationRoundProjects

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f9]">
      <main className="max-w-7xl mx-auto py-8">
        <div className="flex gap-4">
          {/* Left Column - Donation Rounds */}
          <div className="flex-1 space-y-5 w-8/12">
            <DonationRound
              roundName="Super duper round"
              chainId={137}
              token="BTC"
              defaultAmount="0.000052"
              defaultUsdValue="14.00"
              projects={superDuperRoundProjects}
              totalMatch="7.5"
              totalDonation="18.45"
            />

            <DonationRound
              roundName="The best round ever"
              chainId={10}
              token="USDT"
              defaultAmount="65"
              defaultUsdValue="65.00"
              projects={bestRoundProjects}
              totalMatch="25"
              totalDonation="65"
            />
          </div>

          {/* Right Column - Sidebar */}
          <DonationSidebar />
        </div>
      </main>
    </div>
  )
}
