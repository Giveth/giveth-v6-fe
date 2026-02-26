import clsx from 'clsx'
import { Button } from '@/components/ui/button'

export function NotAuthenticated({
  error,
  signIn,
}: {
  error: string | null
  signIn: () => void
}) {
  return (
    <div className="min-h-screen bg-giv-brand-000 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-giv-neutral-300 p-8 max-w-md w-full mx-4 text-center space-y-6">
        <div className="w-16 h-16 bg-giv-brand-050 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-giv-brand-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-giv-deep-blue-800 mb-2">
            Sign In Required
          </h1>
          <p className="text-giv-neutral-700">
            Please sign a message with your wallet to verify ownership and
            access your account
          </p>
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
        <Button
          onClick={signIn}
          className={clsx(
            'rounded-xl transition-all duration-200',
            'inline-flex items-center gap-2',
            'bg-giv-brand-300 text-white',
            'px-8 py-6! text-sm font-semibold',
            'hover:opacity-80 cursor-pointer',
            'disabled:opacity-80 disabled:cursor-not-allowed',
          )}
        >
          Sign Message
        </Button>
        <p className="text-xs text-giv-neutral-700">
          This signature is free and does not trigger a blockchain transaction
        </p>
      </div>
    </div>
  )
}
