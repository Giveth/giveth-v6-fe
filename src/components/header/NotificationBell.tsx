import { Bell } from 'lucide-react'

export function NotificationBell() {
  return (
    <button className="relative p-2 hover:bg-giv-neutral-200 rounded-lg transition-colors">
      <Bell className="w-5 h-5 text-giv-neutral-900" />
      <span className="absolute top-1 right-1 w-2 h-2 bg-giv-pink-500 rounded-full" />
    </button>
  )
}
