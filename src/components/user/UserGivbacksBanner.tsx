import Image from 'next/image'
import clsx from 'clsx'
import { Ticket } from 'lucide-react'
import { HelpTooltip } from '@/components/HelpTooltip'
import { GivBacksEligible } from '@/components/icons/GivBacksEligible'

export const UserGivbacksBanner = () => {
  return (
    <div>
      <div className="flex flex-row justify-between w-full rounded-2xl border border-giv-brand-100 bg-white px-6 py-5">
        <div className="flex flex-col items-center text-center gap-4 border-r border-dashed border-giv-neutral-400 pr-6">
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

        <div className="flex flex-1 ml-32 gap-16 justify-between text-sm text-giv-gray-700 sm:flex-row sm:items-center sm:gap-10">
          <div className="flex gap-20 items-center">
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
                  className="p-2!"
                  width={1}
                  height={1}
                  fontSize="text-[10px]"
                />
              </div>
              <div className="flex items-center gap-2 text-lg font-bold text-giv-neutral-900">
                <Ticket className="w-5 h-5 text-giv-neutral-900" />
                197
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <button
              type="button"
              className="rounded-xl border border-giv-gray-200 bg-giv-gray-50 px-4 py-2 text-sm font-semibold text-giv-gray-900 transition hover:bg-giv-gray-100"
            >
              Donate now
            </button>
            <div className="text-xs text-giv-gray-500">
              Earn more raffle by donating
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="text-sm font-semibold text-giv-gray-800 transition hover:text-giv-gray-900"
        >
          Archived rounds
        </button>
      </div>
    </div>
  )
}
