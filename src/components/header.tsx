import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Header() {
  return (
    <>
      {/* Top Banner */}
      <div className="bg-[#1b1657] text-white py-2 px-4 text-center text-sm">
        <span className="inline-flex items-center gap-2">
          💜 <span className="font-semibold">$100K for public goods!</span>
          <span className="opacity-90">Join the QF donating now</span>
          <span className="ml-2">→</span>
        </span>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-[#ebecf2] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5326ec] to-[#8668fc]" />
            </div>

            {/* Dropdowns */}
            <button className="text-sm font-medium text-[#1f2333] hover:text-[#5326ec] flex items-center gap-1">
              Donate
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="opacity-50"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button className="text-sm font-medium text-[#1f2333] hover:text-[#5326ec] flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full border border-current" />
              GIVeconomy
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="opacity-50"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Center Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#82899a]" />
              <Input
                placeholder="Search Projects"
                className="pl-10 bg-[#f7f7f9] border-[#ebecf2] text-sm"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#82899a]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="12"
                    height="12"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-[#5326ec] text-[#5326ec] hover:bg-[#f6f3ff] bg-transparent"
            >
              <Plus className="w-4 h-4" />
              Create A Project
            </Button>

            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f7f7f9]">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded" />
              <span className="text-sm font-medium">lauren.eth</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="opacity-50"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
