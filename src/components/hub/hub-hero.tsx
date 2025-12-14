export function HubHero() {
  return (
    <div className="bg-gradient-to-r from-[#e7e1ff] via-[#f0ebff] to-[#e7e1ff] px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-gradient-to-r from-[#5326ec] via-[#6945e3] to-[#8668fc] rounded-2xl overflow-hidden h-40">
          {/* Decorative wave pattern */}
          <div className="absolute inset-0 opacity-30">
            <svg
              className="w-full h-full"
              viewBox="0 0 1200 200"
              preserveAspectRatio="none"
            >
              <path
                d="M0,100 C150,150 350,50 500,100 C650,150 850,50 1000,100 C1150,150 1200,100 1200,100 L1200,200 L0,200 Z"
                fill="rgba(255,255,255,0.1)"
              />
              <path
                d="M0,120 C150,170 350,70 500,120 C650,170 850,70 1000,120 C1150,170 1200,120 1200,120 L1200,200 L0,200 Z"
                fill="rgba(255,255,255,0.05)"
              />
            </svg>
          </div>

          {/* Partner Logos */}
          <div className="absolute left-6 bottom-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1f2333] flex items-center justify-center text-white text-xs font-bold">
              DAO
            </div>
            <div className="w-10 h-10 rounded-full bg-[#1b1657] flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffb636] to-[#ff8c00] flex items-center justify-center">
              <span className="text-white text-lg">🦊</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#37b4a9] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          {/* 3D Earth Illustration */}
          <div className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-end">
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2fc8e0] to-[#2ea096] rounded-full opacity-80" />
              <div className="absolute inset-4 bg-gradient-to-br from-[#37b4a9] to-[#1b8c82] rounded-full" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-20">
                <div className="absolute bottom-0 left-0 w-8 h-16 bg-gradient-to-t from-[#2ea096] to-[#37b4a9] rounded-t-full" />
                <div className="absolute bottom-0 left-6 w-6 h-12 bg-gradient-to-t from-[#37b4a9] to-[#2fc8e0] rounded-t-full" />
                <div className="absolute bottom-0 right-6 w-8 h-20 bg-gradient-to-t from-[#2ea096] to-[#37b4a9] rounded-t-full" />
                <div className="absolute bottom-0 right-0 w-6 h-14 bg-gradient-to-t from-[#37b4a9] to-[#2fc8e0] rounded-t-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
