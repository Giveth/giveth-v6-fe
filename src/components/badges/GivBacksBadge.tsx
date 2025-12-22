import { GivBacksEligible } from '../icons/GivBacksEligible'
import { MatchingEligible } from '../icons/MatchingEligible'

interface GivBacksBadgeProps {
  type: 'eligible' | 'matching'
  color: 'green' | 'gray'
  amountPrefix?: string
  label?: string
}

export const GivBacksBadge = ({
  type,
  color,
  amountPrefix,
  label,
}: GivBacksBadgeProps) => {
  const Icon = type === 'eligible' ? GivBacksEligible : MatchingEligible
  const textColor =
    color === 'green' ? 'text-giv-jade-500' : 'text-giv-gray-700'
  const amountPrefixTextColor =
    color === 'green' ? 'text-giv-jade-500' : 'text-giv-gray-900'
  return (
    <div className="inline-flex items-center gap-1.5 bg-giv-gray-200 border border-giv-gray-400 rounded-lg px-2 py-1">
      <Icon
        width={type === 'eligible' ? 15 : 20}
        height={type === 'eligible' ? 16 : 20}
        fill={color === 'green' ? 'var(--giv-jade-500)' : 'var(--giv-gray-700)'}
      />
      {amountPrefix && (
        <span className={`${amountPrefixTextColor} text-xs font-medium`}>
          {amountPrefix}
        </span>
      )}
      {label && (
        <span className={`${textColor} text-xs font-medium`}>{label}</span>
      )}
    </div>
  )
}
