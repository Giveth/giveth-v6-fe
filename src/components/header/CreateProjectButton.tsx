import Link from 'next/link'
import { type Route } from 'next'
import { createProjectLink } from '@/lib/constants/menu-links'

export function CreateProjectButton() {
  return (
    <Link
      href={createProjectLink?.href as Route}
      className="flex items-center gap-2 text-xs font-bold text-giv-pinky-500! hover:text-giv-pinky-400! transition-colors cursor-pointer"
    >
      Create A Project
    </Link>
  )
}
