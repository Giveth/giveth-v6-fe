import { Search } from 'lucide-react'

export function SearchButton() {
  return (
    <button className="flex items-center py-3 px-5 gap-2 text-base text-giv-gray-900 cursor-pointer bg-giv-gray-200 hover:bg-giv-primary-50 transition-colors rounded-3xl">
      Search
      <Search className="w-5 h-5" />
    </button>
  )
}
