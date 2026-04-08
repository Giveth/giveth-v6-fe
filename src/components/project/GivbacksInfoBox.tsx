'use client'

import { useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { ChevronRight } from 'lucide-react'
import { type Route } from 'next'
import { GivBacksEligible } from '@/components/icons/GivBacksEligible'
import { IconBoost } from '@/components/icons/IconBoost'
import ProjectBoostModal from '@/components/project/ProjectBoostModal'
import { GIVBACKS_DONATION_QUALIFICATION_VALUE_USD } from '@/lib/constants/app-main'
import { givpowerDocLink } from '@/lib/constants/menu-links'

export function GivbacksInfoBox({ projectId }: { projectId?: number }) {
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false)

  return (
    <>
      <div className="bg-white rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex items-baseline justify-center">
              <GivBacksEligible
                width={18}
                height={18}
                fill="var(--giv-neutral-900)"
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-giv-neutral-900">
                Get rewarded with up to 80%
              </p>
              <p className="text-base text-giv-neutral-900 mt-1">
                Donations of ${GIVBACKS_DONATION_QUALIFICATION_VALUE_USD} or
                more are eligible for GIVbacks. Boost this project to increase
                its rewards percentage and visibility on the projects page!
              </p>
              <Link
                href={givpowerDocLink.href as Route}
                target="_blank"
                className="flex items-center gap-1 text-sm text-giv-brand-500! hover:underline mt-1"
              >
                Learn more
                <ChevronRight className="w-5 h-5 mt-0.5" />
              </Link>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBoostModalOpen(true)}
            className={clsx(
              'w-full md:w-auto md:min-w-[176px] h-12 px-6',
              'rounded-full border-2 border-giv-brand-500',
              'text-giv-brand-500 hover:bg-giv-brand-50 transition-colors cursor-pointer',
              'inline-flex items-center justify-center gap-2 font-semibold',
            )}
          >
            <IconBoost width={18} height={18} fill="var(--giv-brand-500)" />
            Boost
          </button>
        </div>
      </div>
      <ProjectBoostModal
        open={isBoostModalOpen}
        onOpenChange={setIsBoostModalOpen}
        projectId={projectId}
      />
    </>
  )
}
