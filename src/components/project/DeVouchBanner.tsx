import Link from 'next/link'
import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'
import { type Route } from 'next'
import { IconDeVouch } from '@/components/icons/IconDeVouch'
import { DEVOUCH_URL } from '@/lib/constants/other-constants'

export const DeVouchBanner = ({ projectId }: { projectId: number }) => {
  return (
    <div className="rounded-2xl border border-giv-neutral-200 bg-white px-6 py-5 shadow-[0px_3px_12px_rgba(17,24,39,0.06)]">
      <div className="flex flex-col gap-2 md:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-giv-brand-500">
            <IconDeVouch />
          </div>

          <h3 className="text-base font-medium text-giv-neutral-900">
            Vouch for this Project
          </h3>
        </div>

        <div className="flex flex-col gap-4 md:gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mt-1 text-base text-giv-neutral-900">
              With DeVouch, you can signal your support for this project by
              attesting to its legitimacy, potentially increasing the benefits
              it receives on Giveth.
            </p>
          </div>

          <Link
            href={`${DEVOUCH_URL}/project/giveth/${projectId}` as Route}
            className={clsx(
              'flex items-center justify-center gap-2',
              'rounded-xl border border-giv-brand-100! bg-giv-brand-050!',
              'px-6 py-2.5 text-sm font-bold text-giv-brand-400!',
              'whitespace-nowrap',
              'transition-colors hover:bg-giv-brand-100!',
            )}
          >
            Go to DeVouch
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </div>
  )
}
