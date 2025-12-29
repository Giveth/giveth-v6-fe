import type React from 'react'
import { X } from 'lucide-react'
import { GivBacksBadge } from '@/components/badges/GivBacksBadge'
import { PROJECT_FALLBACK_IMAGE } from '@/lib/constants/project'

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
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
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
    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {project.image && (
            <img
              src={project.image}
              alt={project.name}
              className="w-14 h-[45px] rounded-md overflow-hidden"
            />
          )}
          {!project.image && (
            <img
              src={PROJECT_FALLBACK_IMAGE}
              alt="Project Fallback Image"
              className="w-14 h-[45px] rounded-md overflow-hidden"
            />
          )}
          <h4 className="text-base font-medium text-giv-gray-900">
            {project.name}
          </h4>
        </div>
        <button className="w-6 h-6 rounded border border-giv-gray-500 flex items-center justify-center text-giv-gray-500 hover:border-giv-pinky-500 hover:text-giv-pinky-500 transition-colors shrink-0 bg-white cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Amount Row */}
      <div className="max-[480px]:flex-wrap flex items-center justify-between mt-8 gap-2">
        <div className="flex flex-wrap max-[480px]:w-full md:w-auto gap-2">
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

        <div className="flex items-center text-base font-medium gap-2 border border-giv-gray-100 rounded-md pr-3 pl-2 py-2">
          {tokenIcons[project.token]}
          <span className="text-giv-gray-700">{project.token}</span>
          <span>{project.tokenAmount}</span>
          <span className="px-2 py-1 bg-giv-gray-300 rounded-lg text-xs text-giv-gray-700">
            $ {project.usdValue}
          </span>
        </div>
      </div>
    </div>
  )
}
