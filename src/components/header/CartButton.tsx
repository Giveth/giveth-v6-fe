import { useEffect, useRef, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { CartDropdown } from '@/components/cart/cart-dropdown'
import { useCart } from '@/context/CartContext'

export function CartButton() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartRef = useRef<HTMLDivElement>(null)
  const { cartItems } = useCart()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={cartRef}>
      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        className="relative inline-flex items-center justify-center py-2 px-3 hover:bg-giv-gray-300 rounded-lg transition-colors shadow-xl cursor-pointer"
      >
        <ShoppingCart className="w-6 h-6 text-giv-gray-900" />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-giv-gray-900 text-white text-xs rounded-full flex items-center justify-center">
            {cartItems.length}
          </span>
        )}
        <span className="block ms-2 font-bold text-giv-gray-900 text-base">
          10
        </span>
      </button>

      {isCartOpen && <CartDropdown onClose={() => setIsCartOpen(false)} />}
    </div>
  )
}
