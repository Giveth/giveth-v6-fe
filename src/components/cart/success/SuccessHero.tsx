import Image from 'next/image'

export function SuccessHero() {
  return (
    <div className="text-center p-8 bg-white">
      {/* Heart Hands Icon */}
      <div className="flex justify-center mb-1">
        <div className="relative">
          <Image
            src="/images/icons/icon-confetti.svg"
            alt="Confetti"
            width={120}
            height={120}
            className="w-full h-auto"
          />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-giv-gray-900 mb-2 [font-family:var(--font-inter)]">
        You're a giver now!
      </h1>
    </div>
  )
}
