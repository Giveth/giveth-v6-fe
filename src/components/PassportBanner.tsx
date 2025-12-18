export function PassportBanner() {
  return (
    <div className="bg-[#1b1657] py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <div className="w-5 h-5 rounded-full bg-[#37b4a9] flex items-center justify-center">
          <svg
            className="w-3 h-3 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className="text-white text-sm">
          You donations are eligible to be matched!{' '}
          <a
            href="#"
            className="underline hover:text-[#d2fffb] inline-flex items-center gap-1"
          >
            Go to Passport
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </span>
      </div>
    </div>
  )
}
