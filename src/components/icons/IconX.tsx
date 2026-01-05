interface IconXProps {
  width?: number
  height?: number
  fill?: string
  className?: string
}

export function IconX({
  width = 24,
  height = 24,
  fill = '#1D1E1F',
  className,
}: IconXProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_11264_8932)">
        <path
          d="M14.2229 10.1571L22.9608 0H20.8902L13.303 8.81931L7.24321 0H0.253906L9.41756 13.3364L0.253906 23.9877H2.32463L10.3369 14.6742L16.7365 23.9877H23.7258L14.2224 10.1571H14.2229ZM11.3867 13.4538L10.4582 12.1258L3.07075 1.55881H6.25127L12.2131 10.0867L13.1415 11.4147L20.8912 22.4998H17.7106L11.3867 13.4544V13.4538Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_11264_8932">
          <rect width={width} height={height} fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
