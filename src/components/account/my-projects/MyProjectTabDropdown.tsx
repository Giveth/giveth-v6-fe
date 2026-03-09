import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { EditMyProjectsLink } from '@/lib/constants/menu-links'

export function MyProjectTabCardDropdown({ project }: { project: MyProject }) {
  const router = useRouter()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="max-[480px]:w-full md:w-auto flex items-center gap-2 rounded-md border border-giv-neutral-100 px-3 py-2 transition-colors hover:bg-giv-neutral-200 cursor-pointer"
        >
          <span className="text-base font-medium text-giv-neutral-900">
            Actions
          </span>
          <ChevronDown className="w-7 h-5 mt-0.5 text-giv-neutral-900 max-[480px]:ml-auto" />
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
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-giv-deep-blue-800 outline-none hover:bg-giv-neutral-200 focus:bg-giv-neutral-200"
            >
              <Eye className="h-4 w-4" />
              View Project
            </Link>
          </DropdownMenu.Item>
          {/* <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-giv-deep-blue-800 outline-none hover:bg-giv-neutral-200 focus:bg-giv-neutral-200"
            onSelect={() => {}}
          >
            <FileText className="h-4 w-4" />
            Add Update
          </DropdownMenu.Item> */}
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-giv-deep-blue-800 outline-none hover:bg-giv-neutral-200 focus:bg-giv-neutral-200"
            onSelect={() => {
              const editProjectHref = EditMyProjectsLink.href.replaceAll(
                '{slug}',
                project.slug,
              )
              router.push(editProjectHref as Parameters<typeof router.push>[0])
            }}
          >
            <Pencil className="h-4 w-4" />
            Edit Project
          </DropdownMenu.Item>
          {/* <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-giv-deep-blue-800 outline-none hover:bg-giv-neutral-200 focus:bg-giv-neutral-200"
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
          </DropdownMenu.Item> */}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
