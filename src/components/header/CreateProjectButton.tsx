import Link from 'next/link'
import clsx from 'clsx'
import { Plus } from 'lucide-react'
import { type Route } from 'next'
import { createProjectLink } from '@/lib/constants/menu-links'

export function CreateProjectButton() {
  return (
    <Link
      href={createProjectLink?.href as Route}
      className={clsx(
        'flex items-center gap-2 text-xs font-bold',
        'text-giv-brand-600! hover:text-giv-brand-500!',
        'transition-colors cursor-pointer',
      )}
    >
      <Plus className="w-6 h-6" />
      Create a project
    </Link>
  )
}
