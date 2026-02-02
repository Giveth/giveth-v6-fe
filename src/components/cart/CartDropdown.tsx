'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { ArrowRight, X } from 'lucide-react'
import { IconUnstakeDonate } from '@/components/icons/IconUnstakeDonate'
import { ProjectImage } from '@/components/project/ProjectImage'
import { useCart } from '@/context/CartContext'
import { groupCartItemsByRound } from '@/lib/helpers/cartHelper'
import type { Route } from 'next'

interface CartDropdownProps {
  onClose: () => void
}

export function CartDropdown({ onClose }: CartDropdownProps) {
  const { cartItems, removeFromCart } = useCart()

  const handleRemoveItem = (roundId: number, itemId: string) => {
    removeFromCart(roundId, itemId)
  }

  // Group cart items by round
  const { qfRoundGroups, nonQfProjects } = useMemo(
    () => groupCartItemsByRound(cartItems),
    [cartItems],
  )

  return (
    <div
      className={clsx(
        'absolute right-0 top-full px-5 mt-2',
        'w-full md:w-[380px]',
        'bg-white rounded-3xl shadow-[0px_3px_20px_rgba(33,32,60,0.24)] z-50',
      )}
    >
      {/* Header */}
      <div className="py-4 border-b border-giv-neutral-300">
        <h3 className="text-sm font-medium text-giv-neutral-700">Donate</h3>
      </div>

      {/* Empty State */}
      {cartItems.length === 0 && (
        <div className="p-8 text-center flex flex-col items-center justify-center">
          <IconUnstakeDonate
            width={32}
            height={32}
            fill="var(--giv-neutral-700)"
          />
          <p className="text-sm font-semibold text-giv-neutral-700 mt-2">
            Add projects to cart to donate
          </p>
        </div>
      )}

      {/* Content */}
      {cartItems.length > 0 && (
        <>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            <div className="space-y-4">
              {/* QF Round Grouped Projects */}
              {qfRoundGroups.map(group => (
                <div
                  key={group.roundId}
                  className="px-1 pb-1 bg-giv-neutral-300 rounded-2xl overflow-hidden"
                >
                  {/* Round Header */}
                  <div className="flex items-center justify-between px-2 py-3">
                    <span className="text-base font-medium text-giv-neutral-700">
                      QF Round
                    </span>
                    <span className="text-base font-medium text-giv-neutral-800">
                      {group.roundName}
                    </span>
                  </div>

                  {/* Projects in this round */}
                  <div className="pb-3 space-y-2 bg-white rounded-xl">
                    {group.projects.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-3 py-3"
                      >
                        {/* Project Image */}
                        <div className="w-14 h-[45px] rounded-md overflow-hidden shrink-0">
                          <ProjectImage
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Project Title */}
                        <h4 className="flex-1 text-base font-medium text-giv-neutral-900 line-clamp-2">
                          {item.title}
                        </h4>

                        {/* Remove Button */}
                        <button
                          onClick={() =>
                            handleRemoveItem(group.roundId, item.id)
                          }
                          className="w-6 h-6 rounded border border-giv-neutral-500 flex items-center justify-center text-giv-neutral-500 hover:border-giv-pink-500 hover:text-giv-pink-500 transition-colors shrink-0 bg-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Non-QF Projects (shown individually without wrapper) */}
              {nonQfProjects.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-2 py-2 bg-giv-neutral-300 rounded-2xl overflow-hidden"
                >
                  {/* Project Image */}
                  <div className="w-14 h-[45px] rounded-md overflow-hidden shrink-0">
                    <ProjectImage
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Project Title */}
                  <h4 className="flex-1 text-base font-medium text-giv-neutral-900 line-clamp-2">
                    {item.title}
                  </h4>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(0, item.id)}
                    className={clsx(
                      'w-6 h-6 rounded border border-giv-neutral-500 flex items-center justify-center text-giv-neutral-500',
                      'hover:border-giv-pink-500 hover:text-giv-pink-500 transition-colors shrink-0 bg-white cursor-pointer',
                    )}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Donate Button */}
          <div className="py-4 pt-0">
            <Link
              href={'/cart' as Route}
              onClick={onClose}
              className={clsx(
                'flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-md',
                'transition-colors bg-giv-brand-300 text-white! hover:bg-giv-brand-400 cursor-pointer',
              )}
            >
              Donate
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
