export function SuccessHero() {
  return (
    <div className="text-center py-8">
      {/* Party Popper Icon */}
      <div className="mb-6">
        <svg
          className="w-20 h-20 mx-auto"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Confetti pieces */}
          <circle cx="20" cy="15" r="3" fill="#5326ec" />
          <circle cx="60" cy="20" r="2" fill="#e1458d" />
          <circle cx="15" cy="35" r="2" fill="#37b4a9" />
          <rect
            x="55"
            y="10"
            width="4"
            height="4"
            rx="1"
            fill="#f7931a"
            transform="rotate(15 55 10)"
          />
          <rect
            x="25"
            cy="25"
            width="3"
            height="3"
            rx="0.5"
            fill="#2775ca"
            transform="rotate(-10 25 25)"
          />

          {/* Party popper cone */}
          <path
            d="M40 65L20 30L55 45L40 65Z"
            fill="#f7931a"
            stroke="#e5841f"
            strokeWidth="1"
          />
          <path d="M40 65L20 30L30 38L40 65Z" fill="#ffb347" />

          {/* Confetti streams */}
          <path
            d="M30 28C25 20 20 18 15 20"
            stroke="#5326ec"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M35 25C35 15 40 10 50 12"
            stroke="#e1458d"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M45 30C50 22 55 20 62 22"
            stroke="#37b4a9"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M50 38C58 35 62 30 65 25"
            stroke="#2775ca"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Extra confetti */}
          <circle cx="12" cy="25" r="2" fill="#e1458d" />
          <circle cx="65" cy="35" r="2.5" fill="#5326ec" />
          <rect
            x="8"
            y="40"
            width="3"
            height="3"
            rx="0.5"
            fill="#37b4a9"
            transform="rotate(20 8 40)"
          />
          <rect
            x="68"
            y="15"
            width="3"
            height="3"
            rx="0.5"
            fill="#f7931a"
            transform="rotate(-15 68 15)"
          />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-[#1f2333] mb-2">
        You just made a difference! 🎉
      </h1>
      <p className="text-[#4f576a]">
        Your donation supports real impact in public goods.
      </p>
    </div>
  )
}
