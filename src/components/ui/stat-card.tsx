type StatCardProps = {
  label: string
  value: string
  helper?: string
}

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#eceff5] bg-white p-6 shadow-[0_25px_55px_rgba(83,38,236,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9aa0b5]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--giv-deep-900)]">
        {value}
      </p>
      {helper && <p className="mt-2 text-sm text-[#9aa0b5]">{helper}</p>}
    </div>
  )
}
