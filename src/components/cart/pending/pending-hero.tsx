export function PendingHero() {
  return (
    <div className="text-center py-8">
      {/* Heart Hands Icon */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hands forming heart shape */}
            <path
              d="M40 20C35 10 25 8 20 15C15 22 18 32 28 42L40 55L52 42C62 32 65 22 60 15C55 8 45 10 40 20Z"
              fill="#FFB6C1"
              stroke="#e1458d"
              strokeWidth="2"
            />
            {/* Left hand */}
            <path
              d="M20 45C15 50 10 55 12 60C14 65 22 65 28 60L35 52"
              stroke="#e1458d"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right hand */}
            <path
              d="M60 45C65 50 70 55 68 60C66 65 58 65 52 60L45 52"
              stroke="#e1458d"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-[#1f2333] mb-2">
        We are processing your donation/s
      </h1>
      <p className="text-[#82899a]">Wait for your transaction to complete</p>
    </div>
  )
}
