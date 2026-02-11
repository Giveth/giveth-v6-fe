import clsx from 'clsx'

export const ClaimRewardsBanner = ({ chainLabel }: { chainLabel: string }) => {
  return (
    <div
      className={clsx(
        'flex flex-col gap-6 md:flex-row md:items-center justify-between px-6 py-7',
        'bg-white',
        'rounded-2xl shadow-[0_3px_20px_rgba(212,218,238,0.7)]',
      )}
    >
      <div className="text-giv-neutral-900 font-medium">
        <div className="text-lg font-bold">Total GIV claimable</div>
        <div className="mt-1 text-base">on {chainLabel}</div>
      </div>

      <div className="text-center md:text-left text-giv-neutral-900">
        <div className="text-3xl font-semibold">274,901 GIV</div>
        <div className="mt-1 text-xl">~$970.60</div>
      </div>

      <button
        type="button"
        className={clsx(
          'w-auto py-3 px-8 bg-giv-brand-300! text-white! rounded-md text-sm font-bold',
          'flex items-center justify-center gap-2 hover:bg-giv-brand-400! transition-colors cursor-pointer',
        )}
      >
        Claim Rewards
      </button>
    </div>
  )
}
