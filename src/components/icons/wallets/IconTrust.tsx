interface IconTrustProps {
  width?: number
  height?: number
  className?: string
}

export function IconTrust({
  width = 16,
  height = 16,
  className,
}: IconTrustProps) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
    >
      <path
        d="M37.523 83.593L255.21 13.046v488.371C99.709 436.301 37.523 311.5 37.523 240.964V83.593z"
        fill="#0500ff"
        fillRule="nonzero"
      />
      <path
        d="M38.154 6.673L19.433.606v42c13.372-5.6 18.721-16.333 18.721-22.399V6.673z"
        fill="url(#prefix___Linear1)"
        fillRule="nonzero"
        transform="matrix(11.62788 0 0 11.62788 29.256 6)"
      />
      <defs>
        <linearGradient
          id="prefix___Linear1"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
          gradientUnits="userSpaceOnUse"
          gradientTransform="rotate(107.581 17.445 10.98) scale(46.5663)"
        >
          <stop offset="0" stopColor="#00f" />
          <stop offset=".02" stopColor="#00f" />
          <stop offset=".08" stopColor="#0094ff" />
          <stop offset=".16" stopColor="#48ff91" />
          <stop offset=".42" stopColor="#0094ff" />
          <stop offset=".68" stopColor="#0038ff" />
          <stop offset=".9" stopColor="#0500ff" />
          <stop offset="1" stopColor="#0500ff" />
        </linearGradient>
      </defs>
    </svg>
  )
}
