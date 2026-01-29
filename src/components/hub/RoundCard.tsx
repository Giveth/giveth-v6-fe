import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { QF_ROUND_FALLBACK_IMAGE } from '@/lib/constants/other-constants'
import type {
  ActiveQfRoundsQuery,
  ArchivedQfRoundsQuery,
} from '@/lib/graphql/generated/graphql'
import { getDateRange } from '@/lib/helpers/dateHelper'
import { truncateText } from '@/lib/helpers/textHelper'
import type { Route } from 'next'

type RoundCardData =
  | ActiveQfRoundsQuery['activeQfRounds'][0]
  | ArchivedQfRoundsQuery['archivedQfRounds']['rounds'][0]

export function RoundCard({
  round,
  layout = 'horizontal',
  isClosed = false,
}: {
  round: RoundCardData
  layout?: 'horizontal' | 'vertical'
  isClosed?: boolean
}) {
  const isMobile = useIsMobile()
  const layoutOption = isMobile ? 'vertical' : layout

  const mainContainerWidth =
    layoutOption === 'horizontal' ? 'lg:col-span-3' : 'col-span-1'

  const mainContainerFlexDirection =
    layoutOption === 'horizontal' ? 'flex-row' : 'flex-col'

  const imageContainerWidth = layoutOption === 'horizontal' ? 'w-1/2' : 'w-full'
  const imageContainerHeight =
    layoutOption === 'horizontal' ? 'h-[330px]' : 'h-[200px]'
  const contentContainerWidth =
    layoutOption === 'horizontal' ? 'w-1/2' : 'w-full flex-1'

  return (
    <div
      className={`flex ${mainContainerFlexDirection} ${mainContainerWidth} gap-9 p-6 bg-white rounded-2xl overflow-hidden shadow-[0px_3px_20px_rgba(83,38,236,0.13)]`}
    >
      <div
        className={`${imageContainerWidth} ${imageContainerHeight} relative`}
      >
        <Link href={`/qf/${round.slug}` as Route}>
          <Image
            src={round.hubCardImage || QF_ROUND_FALLBACK_IMAGE}
            alt={round.name}
            fill
            className="block w-full object-cover rounded-2xl"
            unoptimized
          />
        </Link>
      </div>

      <div className={`${contentContainerWidth} flex flex-col justify-between`}>
        <h3 className="text-3xl font-bold text-giv-gray-900 mb-2">
          <Link href={`/qf/${round.slug}` as Route}>{round.name}</Link>
        </h3>
        <p className="text-base text-giv-gray-800 leading-relaxed mb-4 min-h-[72px]">
          {truncateText(
            round.description || '',
            layout === 'horizontal' ? 200 : 155,
          )}
        </p>

        {layoutOption === 'vertical' && (
          <div className="mt-auto">
            <p className="text-lg font-bold text-giv-deep-900">
              {getDateRange(round.beginDate, round.endDate)}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 justify-center border-giv-gray-300 border-[1.85px] mt-6 py-1 px-2.5 rounded-2xl text-giv-gray-900">
          <span className="text-lg font-bold">
            {formatMatchingPool(
              round.allocatedFundUSD,
              round.allocatedFundUSDPreferred,
              round.allocatedFund,
              round.allocatedTokenSymbol,
            )}
          </span>
          <span className="ml-1 text-base">Matching Pool</span>
        </div>

        {layoutOption === 'vertical' && (
          <div className="mt-8">
            <ExploreButton
              href={`/qf/${round.slug}` as Route}
              layoutOption={layoutOption}
              isClosed={isClosed}
            />
          </div>
        )}

        {layoutOption === 'horizontal' && (
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold text-giv-deep-900">
              {getDateRange(round.beginDate, round.endDate)}
            </p>
            <ExploreButton
              href={`/qf/${round.slug}` as Route}
              layoutOption={layoutOption}
              isClosed={isClosed}
            />
          </div>
        )}
      </div>
    </div>
  )
}

const ExploreButton = ({
  href,
  layoutOption,
  isClosed,
}: {
  href: string
  layoutOption: 'horizontal' | 'vertical'
  isClosed?: boolean
}) => {
  let exploreButtonClass =
    'bg-giv-primary-300 text-white! hover:bg-giv-primary-400 '
  if (layoutOption === 'vertical' && !isClosed) {
    exploreButtonClass =
      'text-giv-primary-700 hover:text-white! hover:bg-giv-primary-800! w-full justify-center bg-giv-primary-50 border border-giv-primary-100'
  }
  if (isClosed) {
    exploreButtonClass =
      'text-giv-primary-700 hover:text-white! hover:bg-giv-primary-800! w-full justify-center bg-white! border border-giv-gray-100'
  }
  return (
    <Link
      href={href as Route}
      className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-md transition-colors ${exploreButtonClass}`}
    >
      Explore Projects
      <ChevronRight className="w-4 h-4" />
    </Link>
  )
}

const formatMatchingPool = (
  allocatedFundUSD?: number | null,
  allocatedFundUSDPreferred?: boolean | null,
  allocatedFund?: number,
  allocatedTokenSymbol?: string | null,
): string => {
  // If allocatedFundUSDPreferred is true, show USD with dollar sign
  if (allocatedFundUSDPreferred && allocatedFundUSD != null) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(allocatedFundUSD)
  }

  // Otherwise show token amount with symbol
  if (allocatedFund != null) {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(allocatedFund)
    return allocatedTokenSymbol
      ? `${formattedAmount} ${allocatedTokenSymbol}`
      : formattedAmount
  }

  return '$0'
}
