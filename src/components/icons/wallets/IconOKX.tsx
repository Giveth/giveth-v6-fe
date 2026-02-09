interface IconOKXProps {
  width?: number
  height?: number
  className?: string
}

export function IconOKX({
  width = 128,
  height = 128,
  className,
}: IconOKXProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 2500 2500"
      className={className}
    >
      {/* Background */}
      <rect x="0" y="0" width="2500" height="2500" fill="#7CFC00" />

      {/* Center */}
      <path
        fill="#000"
        d="M1463,1015h-404c-17,0-31,14-31,31v404c0,17,14,31,31,31h404c17,0,31-14,31-31v-404C1494,1029,1480,1015,1463,1015z"
      />

      {/* Top Left */}
      <path
        fill="#000"
        d="M996,549H592c-17,0-31,14-31,31v404c0,17,14,31,31,31h404c17,0,31-14,31-31V580C1027,563,1013,549,996,549z"
      />

      {/* Top Right */}
      <path
        fill="#000"
        d="M1930,549h-404c-17,0-31,14-31,31v404c0,17,14,31,31,31h404c17,0,31-14,31-31V580C1961,563,1947,549,1930,549z"
      />

      {/* Bottom Left */}
      <path
        fill="#000"
        d="M996,1482H592c-17,0-31,14-31,31v404c0,17,14,31,31,31h404c17,0,31-14,31-31v-404C1027,1496,1013,1482,996,1482z"
      />

      {/* Bottom Right */}
      <path
        fill="#000"
        d="M1930,1482h-404c-17,0-31,14-31,31v404c0,17,14,31,31,31h404c17,0,31-14,31-31v-404C1961,1496,1947,1482,1930,1482z"
      />
    </svg>
  )
}
