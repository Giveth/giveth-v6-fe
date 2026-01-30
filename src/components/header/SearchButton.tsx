import clsx from 'clsx'
import { Search } from 'lucide-react'

export function SearchButton() {
  return (
    <button
      className={clsx(
        'flex justify-between md:justify-start md:items-center py-3 px-5 gap-2',
        'text-base text-giv-neutral-900 cursor-pointer bg-giv-neutral-200 hover:bg-giv-brand-50',
        'transition-colors rounded-3xl',
      )}
    >
      Search
      <Search className="w-5 h-5" />
    </button>
  )
}
