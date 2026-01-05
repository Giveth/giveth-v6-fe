import { Share2 } from 'lucide-react'
import { IconFacebook } from '@/components/icons/IconFacebook'
import { IconLinkedIn } from '@/components/icons/IconLinkedIn'
import { IconX } from '@/components/icons/IconX'

export function ShareSection() {
  return (
    <div className="bg-white rounded-2xl p-6 [font-family:var(--font-inter)]">
      <div className="flex items-center gap-2 mb-4">
        <Share2 className="w-5 h-5 text-giv-gray-900" />
        <h2 className="text-2xl font-bold text-giv-gray-900">
          Spread the Impact!
        </h2>
      </div>

      {/* Share Message Box */}
      <div className="bg-giv-gray-200 border border-dashed border-giv-gray-500 rounded-xl p-6 mb-4">
        <p className="text-lg text-center text-giv-gray-900">
          Share your cart on socials to help projects attract even more
          donations!
        </p>
        {/* Social Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button className="w-16 h-12 rounded-md bg-giv-primary-50 border border-giv-primary-100 flex items-center justify-center hover:opacity-85 transition-colors cursor-pointer">
            <IconX height={24} width={24} />
          </button>
          <button className="w-16 h-12 rounded-md bg-giv-primary-50 border border-giv-primary-100 flex items-center justify-center hover:opacity-85 transition-colors cursor-pointer">
            <IconLinkedIn height={24} width={24} />
          </button>
          <button className="w-16 h-12 rounded-md bg-giv-primary-50 border border-giv-primary-100 flex items-center justify-center hover:opacity-85 transition-colors cursor-pointer">
            <IconFacebook height={24} width={24} />
          </button>
        </div>
      </div>
    </div>
  )
}
