import { Suspense } from 'react'
import UserPageClient from './UserPageClient'

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcfcff] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#5326ec] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[#82899a]">Loading account…</p>
          </div>
        </div>
      }
    >
      <UserPageClient />
    </Suspense>
  )
}
