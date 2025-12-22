'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { ProjectImage } from '@/components/project/ProjectImage'
import { useCart, type Project } from '@/context/CartContext'
import type { Route } from 'next'

interface CartDropdownProps {
  onClose: () => void
}

interface GroupedProjects {
  roundId?: number | null
  roundName: string | null
  projects: Project[]
}

export function CartDropdown({ onClose }: CartDropdownProps) {
  const { cartItems, removeFromCart } = useCart()

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId)
  }

  // Separate QF round projects from non-QF projects
  const { qfRoundGroups, nonQfProjects } = useMemo(() => {
    const groups: Map<string, GroupedProjects> = new Map()
    const nonQf: Project[] = []

    cartItems.forEach(item => {
      if (item.roundId && item.roundName) {
        const key = String(item.roundId)

        if (!groups.has(key)) {
          groups.set(key, {
            roundId: item.roundId,
            roundName: item.roundName,
            projects: [],
          })
        }
        groups.get(key)!.projects.push(item)
      } else {
        nonQf.push(item)
      }
    })

    return {
      qfRoundGroups: Array.from(groups.values()),
      nonQfProjects: nonQf,
    }
  }, [cartItems])

  return (
    <div className="absolute right-0 top-full px-5 mt-2 w-[380px] bg-white rounded-3xl shadow-[0px_3px_20px_rgba(33,32,60,0.24)] z-50">
      {/* Header */}
      <div className="py-4 border-b border-giv-gray-300">
        <h3 className="text-sm font-medium text-giv-gray-700">Donate</h3>
      </div>

      {/* Empty State */}
      {cartItems.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-sm text-[#82899a]">Your cart is empty</p>
          <p className="text-xs text-[#82899a] mt-2">
            Add projects to your cart to get started
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
                  className="px-1 pb-1 bg-giv-gray-300 rounded-2xl overflow-hidden"
                >
                  {/* Round Header */}
                  <div className="flex items-center justify-between px-2 py-3">
                    <span className="text-base font-medium text-giv-gray-700">
                      QF Round
                    </span>
                    <span className="text-base font-medium text-giv-gray-800">
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
                        <h4 className="flex-1 text-base font-medium text-giv-gray-900 line-clamp-2">
                          {item.title}
                        </h4>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="w-6 h-6 rounded border border-giv-gray-500 flex items-center justify-center text-giv-gray-500 hover:border-giv-pinky-500 hover:text-giv-pinky-500 transition-colors shrink-0 bg-white cursor-pointer"
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
                  className="px-1 pb-1 bg-giv-gray-300 rounded-2xl overflow-hidden"
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
                  <h4 className="flex-1 text-base font-medium text-giv-gray-900 line-clamp-2">
                    {item.title}
                  </h4>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="w-6 h-6 rounded border border-giv-gray-500 flex items-center justify-center text-giv-gray-500 hover:border-giv-pinky-500 hover:text-giv-pinky-500 transition-colors shrink-0 bg-white cursor-pointer"
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
              className="w-full py-3 bg-giv-primary-500 text-white! rounded-3xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-giv-primary-400 transition-colors cursor-pointer"
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
