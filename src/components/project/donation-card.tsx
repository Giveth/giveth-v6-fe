import { ChevronDown, ChevronRight, Plus, Share2, X } from 'lucide-react'
import { useCart } from '@/context/CartContext'

interface DonationCardProps {
  project: {
    id: string
    title: string
    slug: string
    image?: string | null
    totalDonations: number
    countUniqueDonors?: number | null | undefined
    projectQfRounds?: Array<{
      qfRound?: {
        id: string
        name: string
        isActive?: boolean
      } | null
    }> | null
  }
}

export function DonationCard({ project }: DonationCardProps) {
  const { addToCart, removeFromCart, isInCart } = useCart()
  const isProjectInCart = isInCart(project.id)

  const handleCartAction = () => {
    if (isProjectInCart) {
      removeFromCart(project.id)
    } else {
      // Find the first active QF round, or the first one if none are active
      const activeQfRound = project.projectQfRounds?.find(
        pqr => pqr.qfRound?.isActive,
      )?.qfRound
      const firstQfRound = project.projectQfRounds?.[0]?.qfRound

      const qfRound = activeQfRound || firstQfRound

      addToCart({
        id: project.id,
        title: project.title,
        slug: project.slug,
        image: project.image,
        roundId: qfRound?.id ? parseInt(qfRound.id) : undefined,
        roundName: qfRound?.name,
      })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#ebecf2] p-6">
      {/* Round Selector */}
      <button className="w-full flex items-center justify-between px-4 py-3 border border-[#ebecf2] rounded-lg mb-4 hover:border-[#5326ec] transition-colors">
        <span className="text-sm font-medium text-[#1f2333]">
          Round QF Alpha
        </span>
        <ChevronDown className="w-4 h-4 text-[#82899a]" />
      </button>

      {/* Amount and Contributors */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-3xl font-bold text-[#1f2333]">
          ${project.totalDonations.toFixed(2)}
        </span>
        <div className="text-right">
          <span className="text-xl font-bold text-[#1f2333]">
            {project.countUniqueDonors || 0}
          </span>
          <p className="text-xs text-[#82899a]">contributors</p>
        </div>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleCartAction}
        className={`w-full h-[48px] rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all ${
          isProjectInCart
            ? 'border-2 border-[#e1458d] text-[#e1458d] hover:bg-[#fff5f8]'
            : 'bg-white border-2 border-[#e1458d] text-[#e1458d] hover:bg-[#e1458d] hover:text-white'
        }`}
      >
        {isProjectInCart ? (
          <>
            <X className="w-4 h-4" />
            Remove From Cart
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Add To Cart
          </>
        )}
      </button>

      {/* Share Button */}
      <button className="w-full flex items-center justify-center gap-2 text-sm text-[#82899a] hover:text-[#5326ec] py-2">
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {/* Divider */}
      <div className="border-t border-[#ebecf2] my-4" />

      {/* Matching Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#82899a]">Contribution</span>
          <span className="text-[#5326ec] font-medium">Matching</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#1f2333]">1 DAI</span>
          <div className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3 text-[#5326ec]" />
            <span className="text-[#5326ec] font-medium">+9 DAI</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#1f2333]">10 DAI</span>
          <div className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3 text-[#5326ec]" />
            <span className="text-[#5326ec] font-medium">+24 DAI</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#1f2333]">100 DAI</span>
          <div className="flex items-center gap-2">
            <ChevronRight className="w-3 h-3 text-[#5326ec]" />
            <span className="text-[#5326ec] font-medium">+1,047 DAI</span>
          </div>
        </div>
      </div>

      <button className="flex items-center gap-1 text-sm text-[#5326ec] hover:underline mt-3">
        How it works?
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}
