interface IconBinanceProps {
  width?: number
  height?: number
  className?: string
}

export function IconBinance({
  width = 256,
  height = 256,
  className,
}: IconBinanceProps) {
  return (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2500 2500"
      className={className}
    >
      <path style={{ fill: 'none' }} d="M0 0h2500v2500H0z" />
      <path
        d="M563.4 1250 283 1530.7 0 1250l283-283.2zm685.4-686 482.9 483.3 283.1-283.1L1248.8 0 482.9 766.7 766 1049.8zm965.8 402.8L1934.2 1250l282.9 283.2L2500 1250zM1248.8 1936l-482.9-485.8-283.1 283.2 765.9 766.6 765.9-766.7-283.1-283.1zm0-405.2 283-283.3-283-280.6-283 283.1z"
        style={{ fill: '#f0b90b' }}
      />
    </svg>
  )
}
