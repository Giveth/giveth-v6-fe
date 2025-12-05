import { type QfRoundEntity } from '@/lib/graphql/generated/graphql'

interface QFHeroProps {
  round?: Pick<QfRoundEntity, 'name' | 'endDate'>
  isLoading?: boolean
}

export function QFHero({ round, isLoading }: QFHeroProps) {
  const calculateTimeRemaining = (endDate?: string) => {
    if (!endDate) return 'TBD'

    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return 'Ended'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${days}d ${hours}h ${minutes}min`
  }

  const roundName = isLoading ? 'Loading...' : round?.name || 'No active round'
  const timeRemaining = calculateTimeRemaining(round?.endDate)

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[#502CC9] p-8 text-white shadow-lg sm:p-12">
      {/* Decorative background curves */}
      <div className="absolute top-0 right-0 h-full w-full opacity-30">
        <div className="absolute -right-20 -top-40 h-[600px] w-[600px] rounded-full bg-[#6C4DF5] blur-3xl" />
        <div className="absolute right-0 bottom-0 h-[300px] w-[300px] rounded-full bg-[#8B6BF7] blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-start gap-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {roundName}
        </h1>

        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#6C4DF5] px-6 py-3 shadow-lg backdrop-blur-sm">
          <span className="font-bold">
            {isLoading ? 'Calculating...' : `Round Ends In ${timeRemaining}`}
          </span>
        </div>
      </div>
    </div>
  )
}
