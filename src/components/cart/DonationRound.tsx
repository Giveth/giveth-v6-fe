'use client'

import type React from 'react'
import { useState } from 'react'
import { ArrowLeftRight, ChevronDown, X } from 'lucide-react'
import { getChainIcon, getChainName } from '@/lib/constants'

interface ProjectBadge {
  type: 'givbacks' | 'matching' | 'info'
  label: string
}

interface Project {
  id: number
  name: string
  image: string
  badges: ProjectBadge[]
  tokenAmount: string
  token: string
  usdValue: string
}

interface DonationRoundProps {
  roundName: string
  chainId: number
  token: string
  defaultAmount: string
  defaultUsdValue: string
  projects: Project[]
  totalMatch: string
  totalDonation: string
}

function ChainIcon({ chainId }: { chainId: number }) {
  const iconData = getChainIcon(chainId)
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden bg-white flex items-center justify-center">
      <img
        src={iconData.iconUrl}
        alt={`${chainId} icon`}
        className="w-4 h-4 object-contain"
        onError={e => {
          // Fallback to text icon if image fails to load
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `<div class="w-5 h-5 rounded-full ${iconData.bg} flex items-center justify-center ${iconData.textColor || 'text-white'} text-xs">${iconData.fallbackIcon}</div>`
          }
        }}
      />
    </div>
  )
}

const tokenIcons: Record<string, React.ReactNode> = {
  BTC: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <circle cx="12" cy="12" r="10" fill="#F7931A" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fill="white"
        fontWeight="bold"
      >
        ₿
      </text>
    </svg>
  ),
  USDT: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <circle cx="12" cy="12" r="10" fill="#50AF95" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="9"
        fill="white"
        fontWeight="bold"
      >
        T
      </text>
    </svg>
  ),
}

export function DonationRound({
  roundName,
  chainId,
  token,
  defaultAmount,
  defaultUsdValue,
  projects,
  totalMatch,
  totalDonation,
}: DonationRoundProps) {
  const [amount, setAmount] = useState(defaultAmount)

  return (
    <div className="bg-white rounded-xl border border-[#ebecf2] overflow-hidden">
      {/* Round Header */}
      <div className="bg-[#f0f0f5] px-5 py-3">
        <span className="text-sm font-medium text-[#4f576a]">{roundName}</span>
      </div>

      {/* Token Selection Row */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-[#ebecf2]">
        {/* Chain Selector */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#ebecf2] hover:bg-[#f7f7f9] transition-colors">
          <ChainIcon chainId={chainId} />
          <span className="text-sm font-medium text-[#1f2333]">
            {getChainName(chainId)}
          </span>
          <ChevronDown className="w-4 h-4 text-[#82899a]" />
        </button>

        {/* Right Side - Token, Amount, Apply */}
        <div className="flex items-center gap-3">
          {/* Token Selector */}
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#ebecf2] hover:bg-[#f7f7f9] transition-colors">
            {tokenIcons[token]}
            <span className="text-sm font-medium text-[#1f2333]">{token}</span>
            <ChevronDown className="w-4 h-4 text-[#82899a]" />
          </button>

          {/* Amount Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-24 px-3 py-2 text-sm text-right border border-[#ebecf2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5326ec]/20 focus:border-[#5326ec]"
            />
            <ArrowLeftRight className="w-4 h-4 text-[#82899a]" />
            <span className="px-3 py-2 bg-[#f7f7f9] rounded-lg text-sm text-[#82899a]">
              $ {defaultUsdValue}
            </span>
          </div>

          {/* Apply to all */}
          <button className="text-sm font-medium text-[#5326ec] hover:text-[#3811bf] transition-colors">
            Apply to all
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="divide-y divide-[#ebecf2]">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 flex items-center justify-between bg-[#fafafa]">
        <span className="text-sm text-[#82899a]">
          {projects.length} projects
        </span>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            Total match
            <span className="w-5 h-5 rounded-full bg-[#e7e1ff] flex items-center justify-center">
              <svg
                viewBox="0 0 16 16"
                className="w-3 h-3 text-[#5326ec]"
                fill="currentColor"
              >
                <path d="M8 2L10 6L14 7L11 10L12 14L8 12L4 14L5 10L2 7L6 6L8 2Z" />
              </svg>
            </span>
            <span className="text-[#37b4a9] font-medium">$ {totalMatch}</span>
          </span>
          <span className="text-[#82899a]">|</span>
          <span>
            Total donation{' '}
            <span className="font-semibold text-[#1f2333]">
              $ {totalDonation}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between">
        {/* Left - Project Info */}
        <div className="flex items-start gap-3">
          <img
            src={project.image || '/placeholder.svg'}
            alt={project.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <h4 className="text-sm font-medium text-[#1f2333] mb-2">
              {project.name}
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.badges.map((badge, idx) => (
                <Badge key={idx} type={badge.type} label={badge.label} />
              ))}
            </div>
          </div>
        </div>

        {/* Right - Remove Button */}
        <button className="w-7 h-7 rounded-full border border-[#ebecf2] flex items-center justify-center hover:bg-[#f7f7f9] transition-colors">
          <X className="w-4 h-4 text-[#82899a]" />
        </button>
      </div>

      {/* Amount Row */}
      <div className="flex items-center justify-end mt-3 gap-2">
        <div className="flex items-center gap-1.5">
          {tokenIcons[project.token]}
          <span className="text-sm text-[#82899a]">{project.token}</span>
          <span className="text-sm font-medium text-[#1f2333]">
            {project.tokenAmount}
          </span>
          <a href="#" className="text-[#82899a] hover:text-[#5326ec]">
            <svg
              viewBox="0 0 16 16"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M6 10L10 6M10 6H6M10 6V10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect x="2" y="2" width="12" height="12" rx="2" />
            </svg>
          </a>
        </div>
        <span className="px-3 py-1.5 bg-[#f7f7f9] rounded-lg text-sm text-[#82899a]">
          $ {project.usdValue}
        </span>
      </div>
    </div>
  )
}

function Badge({
  type,
  label,
}: {
  type: 'givbacks' | 'matching' | 'info'
  label: string
}) {
  if (type === 'givbacks') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e6f9f7] text-[#1b8c82] text-xs font-medium">
        <svg
          viewBox="0 0 16 16"
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            d="M8 3L10 7L14 8L11 11L12 15L8 13L4 15L5 11L2 8L6 7L8 3Z"
            strokeLinejoin="round"
          />
        </svg>
        {label}
      </span>
    )
  }

  if (type === 'matching') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#5326ec] text-[#5326ec] text-xs font-medium">
        <svg
          viewBox="0 0 16 16"
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="2" y="4" width="12" height="8" rx="1" />
          <path d="M2 7h12" />
        </svg>
        {label}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f7f7f9] text-[#82899a] text-xs font-medium">
      <svg
        viewBox="0 0 16 16"
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v3M8 10v1" strokeLinecap="round" />
      </svg>
      {label}
    </span>
  )
}
