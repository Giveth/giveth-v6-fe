import { Suspense } from 'react'
import StakePageClient from '@/app/account/stake/[id]/StakePageClient'

type StakePageProps = {
  params: {
    id: string
  }
}

export default function StakePage({ params }: StakePageProps) {
  console.log(params.id)
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-giv-brand-000 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-giv-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-giv-neutral-700">Loading account…</p>
          </div>
        </div>
      }
    >
      <StakePageClient id={params.id} />
    </Suspense>
  )
}
