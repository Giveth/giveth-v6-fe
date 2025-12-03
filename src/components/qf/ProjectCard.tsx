'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircledIcon, Cross2Icon, HandIcon } from '@radix-ui/react-icons'
import { ShoppingCartIcon } from 'lucide-react'
import { useCart } from '@/context/CartContext'

interface ProjectCardProps {
  id: string
  title: string
  image: string
  raised: number
  author: string
  slug: string
  description?: string
  contributors?: number
  totalRaised?: number
}

export function ProjectCard({
  id,
  title,
  image,
  raised,
  author,
  slug,
  description = 'The Commons Simulator is a gamified simulation tool powered by a cadCAD backend that was developed by the Commons Stack’s Decentralized Dev community.',
  contributors = 25,
  totalRaised = 38.03,
}: ProjectCardProps) {
  const { addToCart, isInCart, removeFromCart } = useCart()
  const inCart = isInCart(id)

  const handleCartAction = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inCart) {
      removeFromCart(id)
    } else {
      addToCart({ id, title, slug, image })
    }
  }

  return (
    <Link
      href={`/project/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-[2/1] w-full overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Badges */}
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#37b4a9]">
            <CheckCircledIcon className="h-3 w-3" />
            Verified
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#7B11F3]">
            <HandIcon className="h-3 w-3" />
            Givbacks
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#14b8a6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            QF Project
          </span>
        </div>

        <h3 className="mb-1 line-clamp-1 text-lg font-bold text-gray-900 group-hover:text-[#fd67ac]">
          {title}
        </h3>
        <p className="mb-3 text-sm text-[#fd67ac]">{author}</p>

        <p className="mb-6 line-clamp-3 text-sm text-gray-500">{description}</p>

        <div className="mt-auto">
          <div className="mb-4 flex items-end justify-between border-t border-gray-100 pt-4">
            <div>
              <p className="text-xl font-bold text-gray-900">
                ${raised.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500">
                Raised from <span className="font-bold">{contributors}</span>{' '}
                contributors
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-500">
                ${totalRaised.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-500">Total raised</p>
            </div>
          </div>

          <button
            onClick={handleCartAction}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              inCart
                ? 'border border-[#E2E8F0] bg-white text-[#fd67ac] hover:bg-red-50 hover:text-red-500 hover:border-red-200'
                : 'bg-[#E0D8FD] text-[#502CC9] hover:bg-[#d4c6fc]'
            }`}
          >
            {inCart ? (
              <>
                <Cross2Icon className="h-4 w-4" />
                Remove From Cart
              </>
            ) : (
              <>
                <ShoppingCartIcon className="h-4 w-4" />
                Add To Cart
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}
