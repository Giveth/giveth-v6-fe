export function StakingTab({ id: _id }: { id: string }) {
  return (
    <div className="bg-white rounded-tl-2xl rounded-b-xl p-8 overflow-hidden">
      <h1 className="text-2xl font-bold text-giv-neutral-900 mb-4">
        Stake GIV
      </h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-giv-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-giv-brand-050" />
                <div>
                  <div className="text-sm font-semibold text-giv-neutral-900">
                    GIV Staking
                  </div>
                  <div className="text-xs text-giv-neutral-600">On Gnosis</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-giv-neutral-900">
                APR ✨ 16.6%
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-giv-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-giv-neutral-200 pb-4">
              <div className="text-sm text-giv-neutral-600">Staked</div>
              <div className="text-lg font-bold text-giv-neutral-900">
                26,695.36 <span className="text-sm font-medium">GIV</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-giv-neutral-600">Locked</div>
              <div className="text-lg font-bold text-giv-neutral-900">
                4,576.76 <span className="text-sm font-medium">GIV</span>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-xl border border-giv-brand-100 bg-giv-brand-050 px-4 py-2 text-sm font-semibold text-giv-brand-700"
            >
              Locked GIV details
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-giv-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-giv-neutral-900">
              Amount to stake
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-giv-brand-700 hover:text-giv-brand-800"
            >
              Buy / Bridge your GIV →
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-giv-neutral-200 bg-giv-neutral-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-giv-neutral-900">
                <div className="h-8 w-8 rounded-full bg-giv-brand-050" />
                GIV
              </div>
              <div className="text-sm text-giv-neutral-500">$ 0.00</div>
            </div>
            <input
              type="text"
              placeholder="0"
              className="mt-3 w-full bg-transparent text-2xl font-semibold text-giv-neutral-900 outline-none"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {['5%', '10%', '15%', '20%'].map(label => (
                <button
                  key={label}
                  type="button"
                  className="rounded-full border border-giv-brand-100 bg-giv-brand-050 px-3 py-1 text-xs font-semibold text-giv-brand-700"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="text-sm text-giv-neutral-600">
              Available: <span className="font-semibold">24,500 GIV</span>
            </div>
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-giv-brand-100 px-4 py-3 text-sm font-semibold text-giv-neutral-500"
            disabled
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  )
}
