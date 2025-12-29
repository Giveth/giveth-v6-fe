import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowRight } from 'lucide-react'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { PROJECT_FALLBACK_IMAGE } from '@/lib/constants/project'
import { type ActiveQfRoundsQuery } from '@/lib/graphql/generated/graphql'
import { truncateText } from '@/lib/helpers/textHelper'
import type { Route } from 'next'

export function RoundCard({
  round,
  layout = 'horizontal',
}: {
  round: ActiveQfRoundsQuery['activeQfRounds'][0]
  layout?: 'horizontal' | 'vertical'
}) {
  const isMobile = useIsMobile()
  const layoutOption = isMobile ? 'vertical' : layout

  const mainContainerFlexDirection =
    layoutOption === 'horizontal' ? 'flex-row' : 'flex-col'

  const imageContainerWidth = layoutOption === 'horizontal' ? 'w-1/2' : 'w-full'
  const imageContainerHeight =
    layoutOption === 'horizontal' ? 'h-[330px]' : 'h-[200px]'
  const contentContainerWidth =
    layoutOption === 'horizontal' ? 'w-1/2' : 'w-full flex-1'

  return (
    <div
      className={`flex ${mainContainerFlexDirection} gap-9 p-6 bg-white rounded-2xl border border-giv-gray-100 overflow-hidden shadow-[0px_6px_24px_rgba(0,0,0,0.06)]`}
    >
      <div
        className={`${imageContainerWidth} ${imageContainerHeight} relative`}
      >
        <Image
          src={round.hubCardImage || PROJECT_FALLBACK_IMAGE}
          alt={round.name}
          fill
          className="block w-full object-cover rounded-2xl"
          unoptimized
        />
      </div>

      <div className={`${contentContainerWidth} flex flex-col justify-between`}>
        <h3 className="text-[32px] font-bold text-giv-gray-900 mb-2">
          {round.name}
        </h3>
        <p className="text-base text-giv-gray-800 leading-relaxed mb-4 min-h-[72px]">
          {truncateText(
            round.description || '',
            layout === 'horizontal' ? 200 : 155,
          )}
        </p>

        {layoutOption === 'vertical' && (
          <div className="mt-auto">
            <DateContainer
              beginDate={round.beginDate}
              endDate={round.endDate}
            />
          </div>
        )}

        <div className="flex items-center gap-3 justify-center border-giv-gray-300 border-[1.85px] mt-6 py-1 px-2.5 rounded-2xl text-giv-gray-900">
          <span className="text-[25px] font-bold">$50,000</span>
          <span className="ml-1 text-xl">Matching Pool</span>
        </div>

        {layoutOption === 'vertical' && (
          <div className="mt-8">
            <ExploreButton href={`/qf/${round.slug}` as Route} />
          </div>
        )}

        {layoutOption === 'horizontal' && (
          <div className="flex justify-between items-center">
            <DateContainer
              beginDate={round.beginDate}
              endDate={round.endDate}
            />
            <ExploreButton href={`/qf/${round.slug}` as Route} />
          </div>
        )}
      </div>
    </div>
  )
}

const DateContainer = ({
  beginDate,
  endDate,
}: {
  beginDate: string
  endDate: string
}) => {
  return (
    <div className="flex justify-between items-center">
      <p className="text-xl font-bold text-giv-deep-900">
        {format(new Date(beginDate), 'MMMM d')} -{' '}
        {format(new Date(endDate), 'MMMM d')}
      </p>
    </div>
  )
}

const ExploreButton = ({ href }: { href: string }) => {
  return (
    <Link
      href={href as Route}
      className="inline-flex items-center gap-2 px-4 py-3 bg-giv-primary-500 text-white! text-sm font-bold rounded-full hover:bg-giv-primary-700 transition-colors"
    >
      Explore Projects
      <ArrowRight className="w-4 h-4" />
    </Link>
  )
}
