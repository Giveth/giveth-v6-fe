import { useEffect, useRef, type ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, Eye, FileText, Pencil, Sparkles, Wallet2 } from 'lucide-react'
import type { MyProject } from '@/hooks/useAccount'
import type { Route } from 'next'

type ProjectActionsMenuProps = {
  project: MyProject
  open: boolean
  onClose: () => void
}

type ActionItem = {
  label: string
  icon: ReactElement
  href?: Route
  isPrimary?: boolean
  action?: () => void
}

const buildActions = (project: MyProject): ActionItem[] => [
  {
    label: 'View Project',
    icon: <Eye size={18} />,
    href: `/project/${project.slug}` as Route,
  },
  {
    label: 'Add Update',
    icon: <FileText size={18} />,
    href: `/project/${project.slug}?tab=updates&compose=1` as Route,
  },
  {
    label: 'Edit Project',
    icon: <Pencil size={18} />,
    href: `/project/${project.slug}/edit` as Route,
  },
  {
    label: 'Manage Addresses',
    icon: <Wallet2 size={18} />,
    href: `/project/${project.slug}?tab=addresses` as Route,
  },
  {
    label: 'Deactivate Project',
    icon: <Archive size={18} />,
    href: `/project/${project.slug}?tab=settings&mode=deactivate` as Route,
  },
  {
    label: 'Apply for GIVbacks Eligibility',
    icon: <Sparkles size={18} />,
    href: `/project/${project.slug}?tab=givbacks` as Route,
    isPrimary: true,
  },
]

export function ProjectActionsMenu({
  project,
  open,
  onClose,
}: ProjectActionsMenuProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return undefined

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  if (!open) return null

  const actions = buildActions(project)

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/0"
        aria-hidden
        onClick={onClose}
      />
      <div
        ref={containerRef}
        className="absolute right-0 top-full z-50 mt-3 w-[320px] rounded-[28px] border border-[#f0f2f5] bg-white p-4 shadow-[0_24px_60px_rgba(83,38,236,0.18)]"
      >
        <div className="flex flex-col divide-y divide-[#f2f4f7]">
          {actions.map(action => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                if (action.action) {
                  action.action()
                } else if (action.href) {
                  router.push(action.href)
                }
                onClose()
              }}
              className={`flex w-full items-center gap-3 px-3 py-3 text-left text-base font-semibold transition hover:translate-x-[2px] ${
                action.isPrimary
                  ? 'text-[#5c38e9]'
                  : 'text-[var(--color-text)] hover:text-[var(--giv-primary-700)]'
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                  action.isPrimary
                    ? 'bg-[#f3f0ff] text-[#5c38e9]'
                    : 'bg-[#f7f8fb]'
                }`}
              >
                {action.icon}
              </span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
