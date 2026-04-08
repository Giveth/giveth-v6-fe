import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { ShoppingCart } from 'lucide-react'
import { CartDropdown } from '@/components/cart/CartDropdown'
import { useCart } from '@/context/CartContext'
import { useActiveQfRounds } from '@/hooks/useActiveQfRounds'

export function CartButton() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const cartRef = useRef<HTMLDivElement>(null)
  const { data: activeRoundsData, isLoading, error } = useActiveQfRounds()
  const { cartItems, pruneInactiveRoundProjects } = useCart()

  // Remove projects from the cart if they are in inactive rounds
  // This is to prevent users from adding projects to the cart that are not active
  useEffect(() => {
    if (isLoading || error || !activeRoundsData) return
    if (cartItems.length === 0) return

    const activeRoundIds = (activeRoundsData.activeQfRounds || [])
      .map(round => Number(round.id))
      .filter(roundId => Number.isFinite(roundId))

    pruneInactiveRoundProjects(activeRoundIds)
  }, [
    activeRoundsData,
    cartItems.length,
    error,
    isLoading,
    pruneInactiveRoundProjects,
  ])

  // Handle click outside of the cart dropdown
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
    <div className="md:relative" ref={cartRef}>
      <button
        onClick={() => setIsCartOpen(!isCartOpen)}
        className={clsx(
          'md:relative inline-flex items-center justify-center py-1 md:py-2.5 px-3',
          'hover:bg-giv-brand-50 rounded-md transition-colors border border-giv-brand-100 cursor-pointer',
          'text-giv-brand-600!',
        )}
      >
        <ShoppingCart className="w-4 h-4 text-giv-brand-600 lg:w-6 lg:h-6" />
        {cartItems.length > 0 && (
          <span className="block ms-2 font-bold text-giv-brand-600 text-base">
            {cartItems.length}
          </span>
        )}
      </button>

      {isCartOpen && <CartDropdown onClose={() => setIsCartOpen(false)} />}
    </div>
  )
}
