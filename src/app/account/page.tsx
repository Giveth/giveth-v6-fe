import { Suspense } from 'react'
import AccountPageClient from '@/app/account/AccountPageClient'

export default function AccountPage() {
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
      <AccountPageClient />
    </Suspense>
  )
}
