import { ChevronLeft, ChevronRight } from 'lucide-react'

export function MyProjectsPagination({
  totalPages,
  currentPage,
  handlePageChange,
}: {
  totalPages: number
  currentPage: number
  handlePageChange: (page: number) => void
}) {
  const getPageNumbers = (
    totalPages: number,
    currentPage: number,
  ): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages]
    }
    if (currentPage >= totalPages - 3) {
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ]
    }
    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ]
  }

  return totalPages > 1 ? (
    <div className="mt-8 flex items-center justify-center gap-1 px-6 py-4">
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-1 text-sm text-giv-deep-blue-900 hover:text-giv-brand-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-3 w-3" />
        Prev
      </button>

      {getPageNumbers(totalPages, currentPage).map((page, index) =>
        page === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1 text-sm text-giv-neutral-600"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => handlePageChange(page as number)}
            className={`${Number(page) > 999 ? 'w-10' : 'w-8'} h-7 text-sm rounded cursor-pointer ${
              currentPage === page
                ? 'font-medium text-giv-brand-500'
                : 'text-giv-neutral-600 hover:text-giv-brand-500'
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-1 text-sm text-giv-deep-blue-900 hover:text-giv-brand-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  ) : null
}
