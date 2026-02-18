import ConnectWalletButton from '@/components/wallet/ConnectWalletButton'

export function NotConnected() {
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-giv-deep-blue-800 mb-2">
            Connect Your Wallet
          </h1>
          <p className="text-giv-neutral-700">
            Connect your wallet to access your account dashboard
          </p>
        </div>
        <ConnectWalletButton />
      </div>
    </div>
  )
}
