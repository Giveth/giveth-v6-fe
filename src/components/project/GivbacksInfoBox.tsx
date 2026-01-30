'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { type Route } from 'next'
import { GIVBACKS_DONATION_QUALIFICATION_VALUE_USD } from '@/lib/constants/app-main'
import { givpowerDocLink } from '@/lib/constants/menu-links'
import { GivBacksEligible } from '../icons/GivBacksEligible'

export function GivbacksInfoBox() {
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <div className="flex items-baseline justify-center">
          <GivBacksEligible
            width={18}
            height={18}
            fill="var(--giv-neutral-900)"
          />
        </div>
        <div>
          <p className="text-base text-giv-neutral-900">
            Donations of ${GIVBACKS_DONATION_QUALIFICATION_VALUE_USD} or more
            are eligible for GIVbacks. Boost this project to increase its
            rewards percentage and visibility on the projects page!
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
    </div>
  )
}
