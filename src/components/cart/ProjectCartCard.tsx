import type React from 'react'
import { X } from 'lucide-react'
import { GivBacksBadge } from '@/components/badges/GivBacksBadge'

interface ProjectBadge {
  type: 'eligible' | 'matching'
  color: 'green' | 'gray'
  amountPrefix?: string
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

export const ProjectCartCard = ({ project }: { project: Project }) => {
  return (
    <div className="px-4 py-4 border border-giv-gray-300 mb-4 mn-last:mb-0 rounded-xl hover:bg-giv-gray-200 transition-colors">
      {/* Project Info */}
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          <img
            src={project.image || '/placeholder.svg'}
            alt={project.name}
            className="w-14 h-[45px] rounded-md overflow-hidden"
          />
          <h4 className="text-base font-medium text-giv-gray-900">
            {project.name}
          </h4>
        </div>
        <button className="w-6 h-6 rounded border border-giv-gray-500 flex items-center justify-center text-giv-gray-500 hover:border-giv-pinky-500 hover:text-giv-pinky-500 transition-colors shrink-0 bg-white cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Amount Row */}
      <div className="flex items-center justify-between mt-8 gap-2">
        <div className="flex flex-wrap gap-2">
          {project.badges.map((badge, idx) => (
            <GivBacksBadge
              key={idx}
              type={badge.type}
              color={badge.color}
              amountPrefix={badge.amountPrefix ?? undefined}
              label={badge.label}
            />
          ))}
        </div>
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
