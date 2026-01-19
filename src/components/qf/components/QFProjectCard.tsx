'use client'

import Link from 'next/link'
import clsx from 'clsx'
import { Plus, X } from 'lucide-react'
import { ProjectImage } from '@/components/project/ProjectImage'
import { useCart } from '@/context/CartContext'
import { type ProjectEntity } from '@/lib/graphql/generated/graphql'

interface QFProjectCardProps {
  project: ProjectEntity
  roundId?: number
  roundName?: string
}

export function QFProjectCard({
  project,
  roundId,
  roundName,
}: QFProjectCardProps) {
  const { addToCart, removeFromCart, isInCart: checkIsInCart } = useCart()

  const projectId = String(project.id)
  const isInCart = checkIsInCart(projectId, roundId)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)

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
      addToCart({
        id: projectId,
        title: project.title,
        slug: project.slug,
        image: project.image,
        roundId,
        roundName,
      })
    }
  }

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-[480px]">
      {/* Image Layer - Static */}
      <div className="absolute top-0 left-0 w-full h-[220px] z-0 bg-white">
        <ProjectImage
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        {/* Overlay Link */}
        <Link
          href={`/project/${project.slug}`}
          className="absolute inset-0 z-10"
        />
      </div>

      {/* Content Body */}
      <div
        className={clsx(
          'absolute bottom-0 left-0 right-0 z-20 top-[140px] bg-white pt-5 pb-5 px-5 rounded-t-2xl',
          'transition-transform duration-500 ease-out transform translate-y-[68px] group-hover:translate-y-0',
          'shadow-[0_-5px_15px_rgba(0,0,0,0.05)] h-[350px] flex flex-col pointer-events-auto',
        )}
      >
        {/* Header Section */}
        <div className="mb-2">
          <h3 className="font-bold text-lg text-giv-gray-900 mb-1 line-clamp-1">
            <Link
              href={`/project/${project.slug}`}
              className="hover:text-giv-primary-500 transition-colors"
            >
              {project.title}
            </Link>
          </h3>
          <p className="text-sm text-giv-pinky-500 font-medium">
            {project.adminUser?.name || 'Unknown Creator'}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-giv-gray-700 line-clamp-3 mb-4 grow">
          {project.descriptionSummary}
        </p>

        {/* Stats Section */}
        <div className="flex items-end justify-between border-t border-gray-100 pt-4 mb-4">
          {/* Left: Round Stats */}
          <div>
            <div className="text-2xl font-bold text-giv-gray-900 leading-tight mb-1">
              {formatCurrency(roundRaised)}
            </div>
            <div className="text-xs text-giv-gray-700">
              Raised from{' '}
              <span className="text-giv-gray-900 font-medium">
                {roundContributors}
              </span>{' '}
              contributors
            </div>
          </div>

          {/* Right: Total Stats (Box) */}
          <div className="bg-giv-gray-200 rounded-lg p-2 text-right min-w-[80px]">
            <div className="text-sm font-bold text-giv-gray-700 leading-tight">
              {formatCurrency(totalRaised)}
            </div>
            <div className="text-[10px] uppercase font-bold text-giv-gray-700 mt-0.5">
              Total Raised
            </div>
          </div>
        </div>

        {/* Badges/Tags */}
        <div className="flex items-center gap-2 mb-4">
          {project.vouched && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-giv-jade-500">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              VERIFIED
            </span>
          )}
          {project.isGivbacksEligible && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-giv-primary-500 px-1.5 py-0.5">
              GIVBACKS
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-giv-cyan-500 px-1.5 py-0.5 rounded">
            QF PROJECT
          </span>
        </div>

        {/* Action Button - Slides into view on hover */}
        <div className="mt-auto h-[52px]">
          <button
            onClick={toggleCart}
            className={`w-full h-[48px] rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isInCart
                ? 'border-2 border-giv-pinky-500 text-giv-pinky-500 hover:bg-giv-pinky-200'
                : 'bg-white border-2 border-giv-pinky-500 text-giv-pinky-500 hover:bg-giv-pinky-500 hover:text-white'
            }`}
          >
            {isInCart ? (
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
        </div>
      </div>
    </div>
  )
}
