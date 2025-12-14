import { ChevronDown, ChevronRight, Plus, Share2 } from 'lucide-react'

interface DonationCardProps {
  project: {
    id: string
    totalDonations: number
    countUniqueDonors?: number | null | undefined
  }
}

export function DonationCard({ project }: DonationCardProps) {
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
      <button className="w-full flex items-center justify-center gap-2 bg-[#e1458d] hover:bg-[#d13a7e] text-white font-medium py-3 rounded-full mb-3 transition-colors">
        <Plus className="w-4 h-4" />
        Add To Cart
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
