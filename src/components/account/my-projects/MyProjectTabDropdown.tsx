import Link from 'next/link'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  ChevronDown,
  Eye,
  FileText,
  Pencil,
  Trash2,
  Wallet,
} from 'lucide-react'
import { type MyProject } from '@/hooks/useAccount'

export function MyProjectTabCardDropdown({ project }: { project: MyProject }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-giv-neutral-300 bg-giv-neutral-200/80 px-4 py-2 text-sm font-medium text-giv-neutral-900 transition-colors hover:bg-giv-neutral-300 cursor-pointer"
        >
          Actions
          <ChevronDown className="h-4 w-4 text-giv-neutral-700" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="z-50 min-w-[200px] rounded-xl border border-giv-neutral-300 bg-white p-1 shadow-[0px_6px_24px_rgba(0,0,0,0.06)]"
        >
          <DropdownMenu.Item asChild>
            <Link
              href={`/project/${project.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-giv-neutral-900 outline-none hover:bg-giv-neutral-200 focus:bg-giv-neutral-200"
            >
              <Eye className="h-4 w-4" />
              View Project
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-giv-neutral-900 outline-none hover:bg-giv-neutral-200 focus:bg-giv-neutral-200"
            onSelect={() => {}}
          >
            <FileText className="h-4 w-4" />
            Add Update
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-giv-neutral-900 outline-none hover:bg-giv-neutral-200 focus:bg-giv-neutral-200"
            onSelect={() => {}}
          >
            <Pencil className="h-4 w-4" />
            Edit Project
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-giv-neutral-900 outline-none hover:bg-giv-neutral-200 focus:bg-giv-neutral-200"
            onSelect={() => {}}
          >
            <Wallet className="h-4 w-4" />
            Manage Addresses
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-giv-error-600 outline-none hover:bg-giv-neutral-200 focus:bg-giv-neutral-200"
            onSelect={() => {}}
          >
            <Trash2 className="h-4 w-4" />
            Deactivate Project
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
