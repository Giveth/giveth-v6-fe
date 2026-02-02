import Image from 'next/image'
import clsx from 'clsx'
import { CheckCircle2 } from 'lucide-react'

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

      <h1 className="text-3xl font-bold text-giv-neutral-900 mb-2">
        You're a giver now!
      </h1>
      <div
        className={clsx(
          'mb-4 px-3 py-2 mx-auto w-fit rounded-xl border border-giv-neutral-400',
          'bg-giv-neutral-200 text-giv-success-600 text-sm font-medium flex items-center gap-2',
        )}
      >
        <CheckCircle2 className="w-4 h-4 text-giv-success-600" /> Donation
        successful
      </div>
    </div>
  )
}
