export type ProjectStatusPillVariant =
  | 'active'
  | 'deactivated'
  | 'neutral'
  | 'error'
  | 'default'

const variantClasses: Record<ProjectStatusPillVariant, string> = {
  active: 'border-giv-success-400 bg-giv-success-100 text-giv-success-700',
  deactivated: 'border-giv-warning-400 bg-giv-warning-200 text-giv-warning-800',
  neutral: 'border-giv-neutral-400 bg-giv-neutral-200 text-giv-neutral-800',
  error: 'border-giv-error-400 bg-giv-error-100 text-giv-error-700',
  default: 'border-giv-success-400 bg-giv-success-100 text-giv-success-700',
}

export function ProjectStatusPill({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: ProjectStatusPillVariant
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  )
}
