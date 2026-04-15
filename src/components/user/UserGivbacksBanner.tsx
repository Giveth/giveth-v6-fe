'use client'

import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import { ArrowRight, Ticket } from 'lucide-react'
import { HelpTooltip } from '@/components/HelpTooltip'
import { GivBacksEligible } from '@/components/icons/GivBacksEligible'
import { useSiweAuth } from '@/context/AuthContext'
import { useCurrentGivbacksRound } from '@/hooks/useCurrentGivbacksRound'

const DEFAULT_ROUND_NUMBER = 89
const DEFAULT_PRIZE_POOL = '2,800,000 GIV'
const DEFAULT_TICKETS = '197'
const DEFAULT_START_DATE = 'Tue 25 Feb 2025'
const DEFAULT_ENDS_IN = '5 days, 11 hours, 47 minutes'

const formatTokenAmount = (value?: number | string | null) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return DEFAULT_PRIZE_POOL
  return `${amount.toLocaleString()} GIV`
}

const formatCount = (
  value?: number | string | null,
  fallback = DEFAULT_TICKETS,
) => {
  const count = Number(value)
  if (!Number.isFinite(count)) return fallback
  return count.toLocaleString()
}

const formatDate = (value?: string | null) => {
  if (!value) return DEFAULT_START_DATE
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return DEFAULT_START_DATE

  const formatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)

  return formatted.replace(',', '')
}

const formatEndsIn = (value?: string | null) => {
  if (!value) return DEFAULT_ENDS_IN

  const endDate = new Date(value)
  if (Number.isNaN(endDate.getTime())) return DEFAULT_ENDS_IN

  const diffMs = endDate.getTime() - Date.now()
  if (diffMs <= 0) return 'Ended'

  const totalMinutes = Math.floor(diffMs / 1000 / 60)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60

  return `${days} days, ${hours} hours, ${minutes} minutes`
}

export const UserGivbacksBanner = () => {
  const { token } = useSiweAuth()
  const { data } = useCurrentGivbacksRound(token ?? undefined)
  const currentRound = data?.currentGivbacksRound
  const roundNumber = currentRound?.roundNumber ?? DEFAULT_ROUND_NUMBER
  const prizePool = formatTokenAmount(currentRound?.prizePool)
  const startedAt = formatDate(currentRound?.startsAt)
  const endsIn = formatEndsIn(currentRound?.endsAt)
  const ticketCount = formatCount(currentRound?.ticketCount)
  const badgeImage = currentRound?.imageUrl

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between w-full rounded-2xl border border-giv-brand-100 bg-white px-6 py-5">
        <div className="flex flex-col items-center text-center gap-4 mb-8 md:mb-0 md:border-r md:border-dashed md:border-giv-neutral-400 pr-6">
          <div className="relative">
            {badgeImage && (
              <Image
                src={badgeImage}
                alt={`GIVbacks Round ${roundNumber}`}
                width={80}
                height={80}
              />
            )}
            {!badgeImage && (
              <>
                <Image
                  src="/images/givbacks/round-badge.png"
                  alt={`GIVbacks Round ${roundNumber}`}
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
                  {roundNumber}
                </span>
              </>
            )}
          </div>
          <div>
            <div className="flex justify-center items-center gap-2">
              <GivBacksEligible
                width={18}
                height={19}
                fill="var(--giv-neutral-900)"
              />
              <h3 className="text-lg font-bold text-giv-neutral-900 pt-1">
                {`GIVbacks Round ${roundNumber}`}
              </h3>
            </div>
            <h4
              className={clsx(
                'font-bold text-2xl leading-8',
                'bg-[linear-gradient(135.74deg,#E1458D_18.49%,#8668FC_65.93%)] bg-clip-text text-transparent',
              )}
            >
              {prizePool}
            </h4>
            <div className="text-sm text-giv-neutral-800 font-medium">
              Prize pool
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row ml-0 lg:ml-32 gap-4 lg:gap-16 justify-between text-sm text-giv-gray-700 sm:items-center sm:gap-10">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-20 items-center">
            <div>
              <div className="flex flex-col gap-2 mb-3">
                <div className="text-sm text-giv-neutral-800 font-medium">
                  Ends in
                </div>
                <div className="text-lg font-bold text-giv-neutral-900">
                  {endsIn}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-sm text-giv-neutral-800 font-medium">
                  Started
                </div>
                <div className="text-lg font-bold text-giv-neutral-900">
                  {startedAt}
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-giv-neutral-800 font-medium">
                <span>Your tickets</span>
                <HelpTooltip
                  text="Get raffle tickets by donating to GIVbacks eligible projects. The more you donate and the higher the GIVpower of the project you donate to, the more entries you get for your donation."
                  className="py-0.5! px-1.5!"
                  width={1}
                  height={1}
                  fontSize="text-[9px]"
                />
              </div>
              <div className="flex items-center gap-2 text-lg font-bold text-giv-neutral-900">
                <Ticket className="w-6 h-6 text-giv-neutral-900" />
                {ticketCount}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Link
              href="/qf"
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
    </div>
  )
}
