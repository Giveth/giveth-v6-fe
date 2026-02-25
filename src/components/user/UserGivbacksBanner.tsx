import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import { ArrowRight, Ticket } from 'lucide-react'
import { HelpTooltip } from '@/components/HelpTooltip'
import { GivBacksEligible } from '@/components/icons/GivBacksEligible'

export const UserGivbacksBanner = () => {
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between w-full rounded-2xl border border-giv-brand-100 bg-white px-6 py-5">
        <div className="flex flex-col items-center text-center gap-4 mb-8 md:mb-0 md:border-r md:border-dashed md:border-giv-neutral-400 pr-6">
          <div className="relative">
            <Image
              src="/images/givbacks/round-badge.png"
              alt="GIVbacks Round 89"
              width={80}
              height={80}
            />
            <span
              className={clsx(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                'font-extrabold text-[33px] leading-none text-white',
                'drop-shadow-[0_6px_6px_rgba(0,0,0,0.25)] [text-shadow: 0_2px_0_rgba(255,255,255,0.6),0_6px_12px_rgba(0,0,0,0.25)]',
              )}
            >
              189
            </span>
          </div>
          <div>
            <div className="flex justify-center items-center gap-2">
              <GivBacksEligible
                width={18}
                height={19}
                fill="var(--giv-neutral-900)"
              />
              <h3 className="text-lg font-bold text-giv-neutral-900 pt-1">
                GIVbacks Round 89
              </h3>
            </div>
            <h4
              className={clsx(
                'font-bold text-2xl leading-8',
                'bg-[linear-gradient(135.74deg,#E1458D_18.49%,#8668FC_65.93%)] bg-clip-text text-transparent',
              )}
            >
              2,800,000 GIV
            </h4>
            <div className="text-sm text-giv-neutral-800 font-medium">
              Prize pool
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row ml-0 lg:ml-32 gap-4 lg:gap-16 justify-between text-sm text-giv-gray-700 sm:items-center sm:gap-10">
          <div className="flex-col lg:flex-row gap-4 lg:gap-20 items-center">
            <div>
              <div className="flex flex-col gap-2 mb-3">
                <div className="text-sm text-giv-neutral-800 font-medium">
                  Ends in
                </div>
                <div className="text-lg font-bold text-giv-neutral-900">
                  5 days, 11 hours, 47 minutes
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-sm text-giv-neutral-800 font-medium">
                  Started
                </div>
                <div className="text-lg font-bold text-giv-neutral-900">
                  Tue 25 Feb 2025
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-giv-neutral-800 font-medium">
                <span>Your tickets</span>
                <HelpTooltip
                  text="You can get tickets by donating to the GIVbacks Round. The more you donate, the more tickets you get."
                  className="py-0.5! px-1.5!"
                  width={1}
                  height={1}
                  fontSize="text-[9px]"
                />
              </div>
              <div className="flex items-center gap-2 text-lg font-bold text-giv-neutral-900">
                <Ticket className="w-6 h-6 text-giv-neutral-900" />
                197
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Link
              href="#"
              type="button"
              className={clsx(
                'flex items-center justify-center gap-3',
                'rounded-md border border-giv-brand-100!',
                'w-full py-4 px-11 bg-giv-brand-050!',
                'text-giv-brand-700! text-sm font-bold',
                'hover:opacity-85! transition-colors cursor-pointer',
              )}
            >
              Donate now
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="text-sm font-medium text-giv-neutral-900">
              Earn more raffle by donating
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href="#"
          className={clsx(
            'flex items-end justify-center gap-2',
            'text-giv-brand-700! text-sm font-bold',
            'hover:opacity-85! transition-colors cursor-pointer',
          )}
        >
          Archived rounds
          <ArrowRight className="w-6 h-6 pt-1" />
        </Link>
      </div>
    </div>
  )
}
