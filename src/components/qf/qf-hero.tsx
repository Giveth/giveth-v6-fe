interface QFHeroProps {
  title: string
  endDate: string
}

export function QFHero({ title, endDate }: QFHeroProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background with gradient and decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#e7e1ff] via-[#f0ebff] to-[#e7e1ff]">
        {/* Decorative wave patterns */}
        <svg
          className="absolute top-0 right-0 h-full w-1/2 opacity-30"
          viewBox="0 0 400 200"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 100 Q100 50 200 100 T400 100"
            stroke="#5326ec"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
          <path
            d="M0 120 Q100 70 200 120 T400 120"
            stroke="#8668fc"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
          <path
            d="M0 80 Q100 30 200 80 T400 80"
            stroke="#5326ec"
            strokeWidth="1"
            fill="none"
            opacity="0.2"
          />
        </svg>
        <svg
          className="absolute top-0 left-0 h-full w-1/3 opacity-30"
          viewBox="0 0 300 200"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M300 100 Q200 50 100 100 T0 100"
            stroke="#5326ec"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
          <path
            d="M300 130 Q200 80 100 130 T0 130"
            stroke="#8668fc"
            strokeWidth="1"
            fill="none"
            opacity="0.2"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="bg-[#5326ec] rounded-2xl p-8 text-white relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-20">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 200"
              preserveAspectRatio="none"
            >
              <path
                d="M0 150 Q200 100 400 150 T800 150"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M0 170 Q200 120 400 170 T800 170"
                stroke="white"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          </div>

          <div className="relative">
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e1458d] rounded-full text-sm font-medium">
              Round Ends on {new Date(endDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
