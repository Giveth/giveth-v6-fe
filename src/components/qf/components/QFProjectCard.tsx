'use client'

import { useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { Plus, X } from 'lucide-react'
import { type Route } from 'next'
import { GivBacksEligible } from '@/components/icons/GivBacksEligible'
import { IconBoost } from '@/components/icons/IconBoost'
import { IconVerified } from '@/components/icons/IconVerified'
import { DonateTimeModal } from '@/components/project/DonateTimeModal'
import ProjectBoostModal from '@/components/project/ProjectBoostModal'
import { ProjectImage } from '@/components/project/ProjectImage'
import { useCart } from '@/context/CartContext'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { type ProjectEntity } from '@/lib/graphql/generated/graphql'

interface QFProjectCardProps {
  project: ProjectEntity
  isActiveRound?: boolean
  isFutureRound?: boolean
  roundId?: number
  roundName?: string
  roundBeginDate?: string | null
}

export function QFProjectCard({
  project,
  isActiveRound,
  isFutureRound,
  roundId,
  roundName,
  roundBeginDate,
}: QFProjectCardProps) {
  const [showDonateTimeModal, setShowDonateTimeModal] = useState(false)
  const [showBoostModal, setShowBoostModal] = useState(false)
  const isMobile = useIsMobile()
  const { addToCart, removeFromCart, isInCart: checkIsInCart } = useCart()
  const projectId = String(project.id)
  const isInCart = checkIsInCart(projectId, roundId)
  const numericProjectId = Number(project.id)
  const formatCurrency = (value: number) => {
    // Handle very small non-zero values
    if (value > 0 && value < 0.005) {
      return '<$0.00'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }
  // Find Round Specific Data for Stats
  const roundData =
    roundId && project.projectQfRounds
      ? project.projectQfRounds.find(r => r.qfRoundId === roundId)
      : null

  const roundRaised = roundData
    ? roundData.sumDonationValueUsd
    : project.totalDonations

  const roundContributors = roundData
    ? roundData.countUniqueDonors
    : project.countUniqueDonors || 0

  const totalRaised = project.totalDonations

  const toggleCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isInCart) {
      removeFromCart(roundId ?? 0, projectId)
    } else {
      // Check if the project is already in the cart for this round
      addToCart({
        id: projectId,
        title: project.title,
        slug: project.slug,
        image: project.image,
        roundId,
        roundName,
        recipientAddresses:
          project.addresses?.map(a => ({
            address: a.address,
            networkId: a.networkId,
          })) ?? undefined,
      })
    }
  }

  const toggleDonateNoStartedRound = () => {
    setShowDonateTimeModal(true)
  }

  // Setup project link
  const projectLink = roundId
    ? `/project/${project.slug}?roundId=${roundId}`
    : `/project/${project.slug}`

  const contentContainerHeight = isMobile
    ? isActiveRound
      ? 'h-[580px]'
      : 'h-[485px]'
    : isActiveRound
      ? 'h-[580px] md:h-[505px]'
      : 'h-[380px] md:h-[495px]'
  return (
    <>
      <div
        className={clsx(
          contentContainerHeight,
          'group relative bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300',
        )}
      >
        {/* Image Layer - Static */}
        <div className="absolute top-0 left-0 w-full h-[220px] z-0 bg-white">
          <ProjectImage
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          {/* Overlay Link */}
          <Link
            href={projectLink as unknown as Route}
            className="absolute inset-0 z-10"
          />
          <button
            type="button"
            onClick={() => setShowBoostModal(true)}
            className={clsx(
              'absolute top-3 right-3 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white',
              'hover:bg-giv-neutral-100 transition-colors',
              'cursor-pointer',
            )}
            aria-label={`Boost ${project.title}`}
            title="Boost project"
          >
            <IconBoost width={16} height={16} fill="var(--giv-neutral-900)" />
          </button>
        </div>

        {/* Content Body */}
        <div
          className={clsx(
            'absolute bottom-0 left-0 right-0 z-20 top-[140px] bg-white pt-5 pb-5 px-5 rounded-t-2xl',
            `transition-transform duration-500 ease-out transform translate-y-[${isActiveRound ? '68px' : '0px'}] group-hover:translate-y-0`,
            'shadow-[0_-5px_15px_rgba(0,0,0,0.05)] h-[370px] flex flex-col pointer-events-auto',
          )}
        >
          {/* Header Section */}
          <div className="mb-2">
            <h3 className="font-semibold text-lg text-giv-neutral-900 mb-1 line-clamp-1">
              <Link
                href={projectLink as unknown as Route}
                className="hover:text-giv-brand-500 transition-colors"
              >
                {project.title}
              </Link>
            </h3>
            <Link
              href={
                `/user/${project.adminUser?.wallets?.[0]?.address}` as unknown as Route
              }
              className="text-base font-medium text-giv-pink-500! hover:text-giv-brand-500! transition-colors"
            >
              {project.adminUser?.name || 'Unknown Creator'}
            </Link>
          </div>

          {/* Description */}
          <p className="text-base text-giv-neutral-700 line-clamp-3 mb-4 grow">
            {project.descriptionSummary}
          </p>

          {/* Stats Section */}
          <div className="flex items-end justify-between border-t border-gray-100 pt-4 mb-4">
            {/* Left: Round Stats */}
            <div>
              <div className="text-2xl font-bold text-giv-neutral-900 leading-tight mb-1">
                {formatCurrency(roundRaised)}
              </div>
              <div className="text-xs text-giv-neutral-700">
                Raised from{' '}
                <span className="text-giv-neutral-900 font-medium">
                  {roundContributors}
                </span>{' '}
                contributors
              </div>
            </div>

            {/* Right: Total Stats (Box) */}
            <div className="p-2 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-giv-neutral-700 leading-tight">
                {formatCurrency(totalRaised)}
              </div>
              <div className="text-xs text-giv-neutral-800 mt-0.5">
                Total Raised
              </div>
            </div>
          </div>

          {/* Badges/Tags */}
          <div className="flex items-center gap-2 mb-4">
            {project.vouched && (
              <span className="inline-flex items-center gap-1 text-xs text-giv-success-500">
                <IconVerified
                  width={16}
                  height={16}
                  fill="var(--giv-success-500)"
                />
                VERIFIED
              </span>
            )}
            {project.isGivbacksEligible && (
              <span className="inline-flex items-center gap-1 text-xs text-giv-brand-500 px-1.5 py-0.5">
                <GivBacksEligible
                  width={16}
                  height={16}
                  fill="var(--giv-brand-500)"
                />
                GIVBACKS
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white bg-giv-cyan-600 px-1.5 py-0.5 rounded-xl">
              QF PROJECT
            </span>
          </div>

          {/* Action Button - Slides into view on hover */}
          {isActiveRound && !isFutureRound && (
            <div className="mt-auto h-[52px]">
              <button
                onClick={toggleCart}
                className={`w-full h-[48px] rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isInCart
                    ? 'border border-giv-brand-100 bg-giv-brand-50 text-giv-brand-700 hover:bg-giv-brand-100 hover:text-giv-brand-700'
                    : 'bg-giv-brand-300 text-white hover:bg-giv-brand-400 hover:text-white'
                }`}
              >
                {isInCart ? (
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
            </div>
          )}
          {isActiveRound && isFutureRound && (
            <div className="mt-auto h-[52px]">
              <button
                onClick={toggleDonateNoStartedRound}
                className={`w-full h-[48px] rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isInCart
                    ? 'border border-giv-brand-100 bg-giv-brand-50 text-giv-brand-700 hover:bg-giv-brand-100 hover:text-giv-brand-700'
                    : 'bg-giv-brand-300 text-white hover:bg-giv-brand-400 hover:text-white'
                }`}
              >
                <>
                  <Plus className="w-6 h-6 text-white" />
                  Add To Cart
                </>
              </button>
            </div>
          )}
        </div>
      </div>
      {showDonateTimeModal && (
        <DonateTimeModal
          isOpen={showDonateTimeModal}
          onClose={() => setShowDonateTimeModal(false)}
          roundName={roundName ?? 'this round'}
          beginDate={roundBeginDate}
          projectSlug={project.slug}
        />
      )}
      <ProjectBoostModal
        open={showBoostModal}
        onOpenChange={setShowBoostModal}
        projectId={
          Number.isFinite(numericProjectId) && numericProjectId > 0
            ? numericProjectId
            : undefined
        }
      />
    </>
  )
}
