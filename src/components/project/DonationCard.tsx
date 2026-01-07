'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, ChevronRight, Plus, Share2, X } from 'lucide-react'
import { ShareProjectModal } from '@/components/modals/ShareProjectModal'
import { DonationMatchCard } from '@/components/project/DonationMatchCard'
import { useCart } from '@/context/CartContext'
import { EContentType } from '@/lib/constants/share-constants'
import { type ProjectEntity } from '@/lib/graphql/generated/graphql'
import { getProjectActiveRounds } from '@/lib/helpers/projectHelper'

interface DonationCardProps {
  project: {
    id: string
    title: string
    slug: string
    image?: string | null
    totalDonations: number
    countUniqueDonors?: number | null | undefined
    projectQfRounds?: Array<{
      qfRound?: {
        id: string
        name: string
        isActive?: boolean
      } | null
    }> | null
  }
}

export function DonationCard({ project }: DonationCardProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const { addToCart, removeFromCart, isInCart, cartItems } = useCart()
  const isProjectInCart = isInCart(project.id)

  // Stuff related to the rounds selector
  const availableRounds = useMemo(() => {
    return getProjectActiveRounds(project as unknown as ProjectEntity)
  }, [project])

  const defaultRound = availableRounds[0] ?? undefined

  const [selectedRoundId, setSelectedRoundId] = useState<string | undefined>(
    defaultRound?.id,
  )

  const selectedRound =
    availableRounds.find(r => r.id === selectedRoundId) ?? defaultRound

  // Stuff related to the cart action
  const handleCartAction = () => {
    if (isProjectInCart) {
      const existingCartItem = cartItems.find(i => i.id === project.id)
      if (existingCartItem?.roundId) {
        removeFromCart(existingCartItem.roundId, project.id)
      }
      return
    } else {
      addToCart({
        id: project.id,
        title: project.title,
        slug: project.slug,
        image: project.image,
        roundId: selectedRound?.id ? parseInt(selectedRound.id) : undefined,
        roundName: selectedRound?.qfRound?.name ?? undefined,
      })
    }
  }

  return (
    <div className="h-full bg-white rounded-xl p-4">
      {/* If there is only one round, show the round name */}
      {availableRounds.length === 1 && (
        <div className="w-full flex items-center justify-between px-4 py-3 border border-giv-gray-100 rounded-xl mb-4 transition-colors">
          {selectedRound?.qfRound?.name ?? ''}
        </div>
      )}

      {/* Round Selector */}
      {availableRounds.length > 1 && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="w-full flex items-center justify-between px-4 py-3 border border-giv-gray-100 rounded-xl mb-4 hover:border-giv-primary-500 transition-colors cursor-pointer"
              disabled={availableRounds.length === 0}
            >
              <span className="text-base font-medium text-giv-gray-900">
                {selectedRound?.qfRound?.name ?? 'Select a round'}
              </span>
              <ChevronDown className="w-4 h-4 text-giv-gray-900" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="start"
              className="
              z-50 min-w-[220px] rounded-xl border border-giv-gray-100 bg-white p-1
              shadow-[0px_6px_24px_rgba(0,0,0,0.06)]
            "
            >
              {availableRounds.length === 0 && (
                <DropdownMenu.Item
                  disabled
                  className="cursor-not-allowed rounded-lg px-3 py-2 text-sm text-giv-gray-900 outline-none"
                >
                  No rounds available
                </DropdownMenu.Item>
              )}

              {availableRounds.map(r => (
                <DropdownMenu.Item
                  key={r.qfRound?.id}
                  onSelect={() =>
                    setSelectedRoundId(r.qfRound?.id ?? undefined)
                  }
                  className="
                  cursor-pointer rounded-xl px-3 py-2 text-sm
                  text-giv-gray-900 outline-none
                  hover:bg-giv-gray-200
                  focus:bg-giv-gray-200
                "
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate">{r.qfRound?.name}</span>
                  </div>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}

      {/* Amount and Contributors */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[32px] font-bold font-adventor text-giv-gray-900">
          ${selectedRound.sumDonationValueUsd.toFixed(2)}
        </span>
        <div className="text-left">
          <span className="text-sm font-medium text-giv-gray-900">
            {selectedRound.countUniqueDonors || 0}
          </span>
          <p className="text-sm font-normal text-giv-gray-700">contributors</p>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleCartAction}
        className={`w-full h-[48px] mb-2 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all border-2 border-giv-pinky-500 text-white hover:text-giv-pinky-500 bg-giv-pinky-500 hover:bg-white cursor-pointer`}
      >
        {isProjectInCart ? (
          <>
            <X className="w-4 h-4" />
            Remove From Cart
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Add To Cart
          </>
        )}
      </button>

      {/* Share Button */}
      <button
        onClick={() => setShowShareModal(true)}
        className="w-full h-[48px] mb-6 rounded-full flex items-center justify-center gap-2 text-sm text-giv-gray-700 font-bold hover:text-[#5326ec] py-2 cursor-pointer shadow-[0px_3px_20px_rgba(212,218,238,0.4)]"
      >
        <Share2 className="w-3 h-3" />
        Share
      </button>

      {/* Matching Table */}
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center text-sm font-medium border-b border-giv-gray-300">
          <span className="text-sm font-medium text-giv-gray-800">
            Contribution
          </span>
          <span></span>
          <span className="text-sm text-giv-jade-500 text-right">Matching</span>
        </div>

        {/* Contribution Matching Table */}
        {selectedRound?.qfRound && (
          <div className="space-y-0">
            <DonationMatchCard
              amount={1}
              project={project}
              roundData={selectedRound.qfRound}
            />
            <DonationMatchCard
              amount={10}
              project={project}
              roundData={selectedRound.qfRound}
            />
            <DonationMatchCard
              amount={100}
              project={project}
              roundData={selectedRound.qfRound}
            />
          </div>
        )}
      </div>

      <Link
        href="#"
        className="flex items-center gap-1 text-sm text-giv-pinky-500! hover:text-giv-pinky-600! transition-colors mt-3 cursor-pointer"
      >
        How it works?
        <ChevronRight className="w-3 h-3" />
      </Link>

      <ShareProjectModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        projectSlug={project.slug}
        contentType={EContentType.thisProject}
        isCause={false}
        numberOfProjects={0}
        shareText="Check out this project on Giveth"
      />
    </div>
  )
}
