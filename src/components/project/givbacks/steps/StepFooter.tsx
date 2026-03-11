'use client'

export function StepFooter({
  onBack,
  onNext,
  isLoading,
  nextLabel = 'Next',
}: {
  onBack?: () => void
  onNext: () => void
  isLoading: boolean
  nextLabel?: string
}) {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-giv-neutral-100 pt-4">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="cursor-pointer rounded-xl border border-giv-neutral-200 px-5 py-2.5 text-sm font-semibold text-giv-neutral-700 transition-colors hover:bg-giv-neutral-100 disabled:opacity-50"
        >
          Back
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={isLoading}
        className="cursor-pointer rounded-xl bg-giv-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-giv-brand-700 disabled:opacity-50"
      >
        {isLoading ? 'Saving…' : nextLabel}
      </button>
    </div>
  )
}
