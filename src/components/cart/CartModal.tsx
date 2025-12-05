'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cross2Icon } from '@radix-ui/react-icons'
import { ProjectImage } from '@/components/project/ProjectImage'
import { useCart } from '@/context/CartContext'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cartItems, removeFromCart } = useCart()
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-4 top-24 z-50 w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-500">Donate to</h2>
          <p className="text-xl font-semibold text-gray-900">
            {cartItems.length} Projects
          </p>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* QF Round Header 1 */}
              <div className="flex items-center justify-between rounded-2xl bg-gray-100 px-6 py-3">
                <span className="text-sm font-medium text-gray-600">
                  QF Round
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Super duper round
                </span>
              </div>

              {/* Projects from first round */}
              {cartItems
                .slice(0, Math.ceil(cartItems.length / 2))
                .map(project => (
                  <div
                    key={project.id}
                    className="group relative flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200"
                  >
                    <ProjectImage
                      src={project.image}
                      alt={project.title}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
                        {project.title}
                      </h3>
                    </div>

                    {/* Remove Button with Hover Animation */}
                    <div
                      className="relative"
                      onMouseEnter={() => setHoveredProjectId(project.id)}
                      onMouseLeave={() => setHoveredProjectId(null)}
                    >
                      <button
                        onClick={() => removeFromCart(project.id)}
                        className={`flex items-center justify-center transition-all duration-300 ease-in-out ${
                          hoveredProjectId === project.id
                            ? 'w-[180px] gap-2 rounded-full border border-gray-300 bg-white px-4 py-2'
                            : 'h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <Cross2Icon className="h-4 w-4 flex-shrink-0 text-gray-600" />
                        {hoveredProjectId === project.id && (
                          <span className="animate-slide-in whitespace-nowrap text-sm font-medium text-gray-700">
                            Remove from cart
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

              {/* QF Round Header 2 (if we have more projects) */}
              {cartItems.length > 1 && (
                <>
                  <div className="flex items-center justify-between rounded-2xl bg-gray-100 px-6 py-3">
                    <span className="text-sm font-medium text-gray-600">
                      QF Round
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      The best round ever
                    </span>
                  </div>

                  {/* Projects from second round */}
                  {cartItems
                    .slice(Math.ceil(cartItems.length / 2))
                    .map(project => (
                      <div
                        key={project.id}
                        className="group relative flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200"
                      >
                        <ProjectImage
                          src={project.image}
                          alt={project.title}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
                            {project.title}
                          </h3>
                        </div>

                        {/* Remove Button with Hover Animation */}
                        <div
                          className="relative"
                          onMouseEnter={() => setHoveredProjectId(project.id)}
                          onMouseLeave={() => setHoveredProjectId(null)}
                        >
                          <button
                            onClick={() => removeFromCart(project.id)}
                            className={`flex items-center justify-center transition-all duration-300 ease-in-out ${
                              hoveredProjectId === project.id
                                ? 'w-[180px] gap-2 rounded-full border border-gray-300 bg-white px-4 py-2'
                                : 'h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <Cross2Icon className="h-4 w-4 flex-shrink-0 text-gray-600" />
                            {hoveredProjectId === project.id && (
                              <span className="animate-slide-in whitespace-nowrap text-sm font-medium text-gray-700">
                                Remove from cart
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </>
          )}
        </div>

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <Link
            href="/donation"
            onClick={onClose}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#5326ec] py-4 text-base font-bold text-white transition-all hover:bg-[#4520c7]"
          >
            Checkout To Donate
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 15L12.5 10L7.5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>
    </>
  )
}
