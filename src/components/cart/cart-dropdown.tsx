'use client'

import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { ProjectImage } from '@/components/project/ProjectImage'
import { useCart } from '@/context/CartContext'
import type { Route } from 'next'

interface CartDropdownProps {
  onClose: () => void
}

export function CartDropdown({ onClose }: CartDropdownProps) {
  const { cartItems, removeFromCart } = useCart()

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId)
  }

  if (cartItems.length === 0) {
    return (
      <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-xl border border-[#ebecf2] z-50">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#ebecf2]">
          <h3 className="text-lg font-medium text-[#82899a]">Donate</h3>
        </div>

        {/* Empty State */}
        <div className="p-8 text-center">
          <p className="text-sm text-[#82899a]">Your cart is empty</p>
          <p className="text-xs text-[#82899a] mt-2">
            Add projects to your cart to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-xl border border-[#ebecf2] z-50">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#ebecf2]">
        <h3 className="text-lg font-medium text-[#82899a]">Donate</h3>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-3">
          {cartItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-4 py-3 border border-[#ebecf2] rounded-xl ${
                index !== cartItems.length - 1 ? 'mb-2' : ''
              }`}
            >
              {/* Project Image */}
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[#f7f7f9]">
                <ProjectImage
                  src={item.image}
                  alt={item.title}
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
