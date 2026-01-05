import { IconHeartHand } from '@/components/icons/IconHeartHand'

export function PendingHero() {
  return (
    <div className="text-center p-8 bg-white">
      {/* Heart Hands Icon */}
      <div className="flex justify-center mb-1">
        <div className="relative">
          <IconHeartHand />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-giv-gray-900 mb-2 [font-family:var(--font-inter)]">
        Donating
      </h1>
    </div>
  )
}
