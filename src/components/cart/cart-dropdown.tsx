'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import type { Route } from 'next'

interface CartItem {
  id: number
  title: string
  image: string
  roundName: string
}

interface CartRound {
  id: string
  name: string
  items: CartItem[]
}

const cartRounds: CartRound[] = [
  {
    id: 'super-duper',
    name: 'Super duper round',
    items: [
      {
        id: 1,
        title: 'Geode Labs',
        image: '/geode-labs-crypto-blue-logo.jpg',
        roundName: 'Super duper round',
      },
      {
        id: 2,
        title: 'PEP Master - build trust in DIY medical instruments',
        image: '/medical-diy-instruments-logo.jpg',
        roundName: 'Super duper round',
      },
    ],
  },
  {
    id: 'best-round',
    name: 'The best round ever',
    items: [
      {
        id: 3,
        title: 'Alphablocks',
        image: '/alphablocks-education-logo.jpg',
        roundName: 'The best round ever',
      },
      {
        id: 4,
        title: 'Diamante Luz Center for Regenerative Living',
        image: '/regenerative-living-nature-green.jpg',
        roundName: 'The best round ever',
      },
      {
        id: 5,
        title: 'Reforestation with biodiversity AgroForest',
        image: '/reforestation-forest-green-nature.jpg',
        roundName: 'The best round ever',
      },
    ],
  },
]

interface CartDropdownProps {
  onClose: () => void
}

export function CartDropdown({ onClose }: CartDropdownProps) {
  const handleRemoveItem = (itemId: number) => {
    // TODO: hook up cart removal when backend is ready
    void itemId
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-xl border border-[#ebecf2] z-50">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#ebecf2]">
        <h3 className="text-lg font-medium text-[#82899a]">Donate</h3>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        {cartRounds.map(round => (
          <div key={round.id} className="mb-4 last:mb-0">
            {/* Round Header */}
            <div className="bg-[#f7f7f9] rounded-t-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-[#82899a]">
                QF Round
              </span>
              <span className="text-sm font-semibold text-[#4f576a]">
                {round.name}
              </span>
            </div>

            {/* Round Items */}
            <div className="border border-[#ebecf2] border-t-0 rounded-b-xl">
              {round.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    index !== round.items.length - 1
                      ? 'border-b border-[#ebecf2]'
                      : ''
                  }`}
                >
                  {/* Project Image */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[#f7f7f9]">
                    <Image
                      src={item.image || '/placeholder.svg'}
                      alt={item.title}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Project Title */}
                  <h4 className="flex-1 text-sm font-semibold text-[#1f2333] line-clamp-2">
                    {item.title}
                  </h4>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="w-8 h-8 rounded-full border border-[#d7ddea] flex items-center justify-center text-[#82899a] hover:border-[#e1458d] hover:text-[#e1458d] transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Donate Button */}
      <div className="p-4 pt-0">
        <Link
          href={'/cart' as Route}
          onClick={onClose}
          className="w-full py-3 bg-[#5326ec] !text-white rounded-full text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#4520c9] transition-colors"
        >
          Donate
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
