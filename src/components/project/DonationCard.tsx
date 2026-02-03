'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import clsx from 'clsx'
import { Check, ChevronDown, ChevronRight, Plus, Share2, X } from 'lucide-react'
import { type Route } from 'next'
import { ShareProjectModal } from '@/components/modals/ShareProjectModal'
import { DonationMatchCard } from '@/components/project/DonationMatchCard'
import { useCart } from '@/context/CartContext'
import { HowItWorksLink } from '@/lib/constants/menu-links'
import { EContentType } from '@/lib/constants/share-constants'
import { env } from '@/lib/env'
import { type ProjectEntity } from '@/lib/graphql/generated/graphql'
import { getProjectActiveRounds } from '@/lib/helpers/projectHelper'
import { DonateTimeModal } from './DonateTimeModal'

interface DonationCardProps {
  project: {
    id: string
    title: string
    slug: string
    image?: string | null
    totalDonations: number
    countUniqueDonors?: number | null | undefined
    addresses?: Array<{
      address: string
      networkId: number
    }> | null
    projectQfRounds?: Array<{
      qfRound?: {
        id: string
        name: string
        isActive?: boolean
        beginDate?: string | null
      } | null
    }> | null
  }
}

export function DonationCard({ project }: DonationCardProps) {
  const [showDonateTimeModal, setShowDonateTimeModal] = useState(false)

  // Stuff related to the rounds selector
  const availableRounds = useMemo(() => {
    return getProjectActiveRounds(project as unknown as ProjectEntity)
  }, [project])

  // Get query string parameters from the URL
  const searchParams = useSearchParams()
  const roundIdFromUrl = searchParams.get('roundId')

  const defaultRound = roundIdFromUrl
    ? availableRounds.find(r => r.qfRound?.id === roundIdFromUrl)
    : (availableRounds[0] ?? undefined)
  const defaultRoundId = roundIdFromUrl
    ? roundIdFromUrl
    : defaultRound?.qfRound?.id

  const [selectedRoundId, setSelectedRoundId] = useState<string | undefined>(
    defaultRoundId,
  )

  const [showShareModal, setShowShareModal] = useState(false)
  const { addToCart, removeFromCart, isInCart, cartItems } = useCart()
  const [isProjectInCart, setIsProjectInCart] = useState(
    isInCart(project.id, defaultRoundId ? parseInt(defaultRoundId) : undefined),
  )

  useEffect(() => {
    if (availableRounds.length === 0) {
      setSelectedRoundId(undefined)
      return
    }

    const hasSelectedRound = availableRounds.some(
      r => r.qfRound?.id === selectedRoundId,
    )
    if (!hasSelectedRound) {
      setSelectedRoundId(availableRounds[0]?.qfRound?.id)
    }
  }, [availableRounds, selectedRoundId])

  const selectedRound =
    availableRounds.find(r => r.qfRound?.id === selectedRoundId) ?? defaultRound

  // Stuff related to the cart action
  const handleCartAction = () => {
    if (isProjectInCart) {
      const existingCartItem = cartItems.find(
        i => i.id === project.id && i.roundId === Number(selectedRoundId),
      )
      setIsProjectInCart(false)
      if (existingCartItem) {
        removeFromCart(existingCartItem.roundId ?? 0, project.id)
      }
      return
    } else {
      setIsProjectInCart(true)
      addToCart({
        id: project.id,
        title: project.title,
        slug: project.slug,
        image: project.image,
        roundId: selectedRound?.qfRound?.id
          ? parseInt(selectedRound.qfRound.id)
          : 0,
        roundName: selectedRound?.qfRound?.name ?? undefined,
        recipientAddresses:
          project.addresses?.map(a => ({
            address: a.address,
            networkId: a.networkId,
          })) ?? undefined,
      })
    }
  }

  // Change the round and update the isProjectInCart state
  const changeRound = (roundId: string | undefined) => {
    setSelectedRoundId(roundId)
    const existingCartItem = cartItems.find(
      i => i.id === project.id && i.roundId === Number(roundId),
    )
    if (existingCartItem && existingCartItem.roundId === Number(roundId)) {
      setIsProjectInCart(true)
    } else {
      setIsProjectInCart(false)
    }
  }

  // Cartitems change
  useEffect(() => {
    const existingCartItem = cartItems.find(
      i => i.id === project.id && i.roundId === Number(selectedRoundId),
    )
    setIsProjectInCart(Boolean(existingCartItem))
  }, [cartItems, project, selectedRoundId])

  const isActiveRound = Boolean(selectedRound?.qfRound?.isActive)
  let showFutureRoundNotice = false

  // Check if have future rounds
  if (!isActiveRound) {
    const futureRounds = project?.projectQfRounds?.filter(
      pqr =>
        pqr.qfRound?.isActive &&
        pqr.qfRound?.beginDate &&
        new Date(pqr.qfRound.beginDate) > new Date(),
    )
    if (futureRounds?.length && futureRounds?.length > 0) {
      showFutureRoundNotice = true
    }
  }

  return (
    <div className="h-full bg-white rounded-xl p-4">
      {/* If there is only one round, show the round name */}
      {availableRounds.length === 1 && (
        <div className="w-full flex items-center justify-center px-4 py-3 border border-giv-neutral-100 rounded-xl mb-4 transition-colors">
          <span className="text-sm font-semibold text-giv-neutral-900">
            {selectedRound?.qfRound?.name ?? ''}
          </span>
        </div>
      )}

      {/* Round Selector */}
      {availableRounds.length > 1 && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={clsx(
                'w-full flex items-center justify-center px-4 py-2',
                'border border-giv-neutral-300 rounded-xl mb-4',
                'hover:border-giv-brand-500 transition-colors cursor-pointer',
              )}
              disabled={availableRounds.length === 0}
            >
              <span className="text-sm font-semibold text-giv-neutral-900">
                {selectedRound?.qfRound?.name ?? 'Select a round'}
              </span>
              <ChevronDown className="w-5 h-5 ml-3 text-giv-neutral-900" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="start"
              className="
              z-50 min-w-[220px] rounded-xl border border-giv-neutral-100 bg-white p-1
              shadow-[0px_6px_24px_rgba(0,0,0,0.06)]
            "
            >
              {availableRounds.length === 0 && (
                <DropdownMenu.Item
                  disabled
                  className="cursor-not-allowed rounded-lg px-3 py-2 text-sm text-giv-neutral-900 outline-none"
                >
                  No rounds available
                </DropdownMenu.Item>
              )}

              {availableRounds.map(r => (
                <DropdownMenu.Item
                  key={r.qfRound?.id}
                  onSelect={() => changeRound(r.qfRound?.id ?? undefined)}
                  className="
                    cursor-pointer rounded-xl px-3 py-2 text-sm
                    text-giv-neutral-900 outline-none
                    hover:bg-giv-neutral-200
                    focus:bg-giv-neutral-200
                  "
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate">{r.qfRound?.name}</span>
                    {r.qfRound?.id === selectedRoundId && (
                      <Check className="w-4 h-4 text-giv-brand-500" />
                    )}
                  </div>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}

      {/* Amount and Contributors */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl font-bold text-giv-neutral-900">
          ${selectedRound?.sumDonationValueUsd.toFixed(2) || 0}
        </span>
        <div className="text-right">
          <span className="text-xs font-bold text-giv-neutral-900">
            {selectedRound?.countUniqueDonors || 0}
          </span>
          <p className="text-xs font-normal text-giv-neutral-700">
            Contributors
          </p>
        </div>
      </div>

      {/* Add to Cart Button */}
      {isActiveRound && (
        <button
          type="button"
          onClick={handleCartAction}
          className={`w-full h-[48px] rounded-md text-sm font-bold mb-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isProjectInCart
              ? 'border border-giv-brand-100 bg-giv-brand-50 text-giv-brand-700 hover:bg-giv-brand-100 hover:text-giv-brand-700'
              : 'bg-giv-brand-300 text-white hover:bg-giv-brand-400 hover:text-white'
          }`}
        >
          {isProjectInCart ? (
            <>
              <X className="w-6 h-6 text-giv-brand-700" />
              Remove From Cart
            </>
          ) : (
            <>
              <Plus className="w-6 h-6 text-white" />
              Add To Cart
            </>
          )}
        </button>
      )}
      {/* If the round is active but not started, show the donate time modal */}
      {showFutureRoundNotice && (
        <button
          type="button"
          onClick={() => setShowDonateTimeModal(true)}
          className={`w-full h-[48px] rounded-md text-sm font-bold mb-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isProjectInCart
              ? 'border border-giv-brand-100 bg-giv-brand-50 text-giv-brand-700 hover:bg-giv-brand-100 hover:text-giv-brand-700'
              : 'bg-giv-brand-300 text-white hover:bg-giv-brand-400 hover:text-white'
          }`}
        >
          <>
            <Plus className="w-6 h-6 text-white" />
            Add To Cart
          </>
        </button>
      )}

      {/* Share Button */}
      <button
        onClick={() => setShowShareModal(true)}
        className={clsx(
          'w-full h-[48px] mb-6 py-2 rounded-md flex items-center justify-center gap-2',
          'border border-giv-brand-100',
          'text-sm text-giv-brand-400 hover:text-giv-brand-500 font-bold',
          'cursor-pointer shadow-[0px_3px_20px_rgba(212,218,238,0.4)]',
        )}
      >
        <Share2 className="w-6 h-6" />
        Share
      </button>

      {/* Matching Table */}
      {selectedRound && (
        <div className="w-full space-y-3">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-2 pb-1 text-xs font-medium border-b border-giv-neutral-200">
            <span className="text-giv-neutral-800">Contribution</span>
            <span></span>
            <span className="text-giv-success-500 text-right">Matching</span>
          </div>

          {/* Contribution Matching Table */}
          {selectedRound?.qfRound && (
            <div className="space-y-0 border-b border-giv-neutral-200 pb-1">
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
      )}

      <Link
        href={HowItWorksLink.href as Route}
        target={HowItWorksLink.target as '_blank'}
        rel={
          HowItWorksLink.target === '_blank' ? 'noopener noreferrer' : undefined
        }
        className="flex items-center gap-1 text-xs text-giv-brand-500! hover:text-giv-brand-600! font-medium transition-colors mt-3 cursor-pointer"
      >
        {HowItWorksLink.label}
        <ChevronRight className="w-4 h-4 text-giv-brand-500 font-normal" />
      </Link>

      <ShareProjectModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        shareUrl={`${env.FRONTEND_URL}/project/${project.slug}?roundId=${selectedRoundId}`}
        projectSlug={project.slug}
        contentType={EContentType.thisProject}
        isCause={false}
        numberOfProjects={0}
        shareText="Check out this project on Giveth"
      />
      {showDonateTimeModal && (
        <DonateTimeModal
          isOpen={showDonateTimeModal}
          onClose={() => setShowDonateTimeModal(false)}
          roundName={selectedRound?.qfRound?.name ?? ''}
          beginDate={selectedRound?.qfRound?.beginDate}
          projectSlug={project.slug}
        />
      )}
    </div>
  )
}
