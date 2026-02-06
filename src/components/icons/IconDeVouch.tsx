interface IconDeVouchProps {
  width?: number
  height?: number
  fill?: string
  className?: string
}

export function IconDeVouch({
  width = 24,
  height = 24,
  fill = '#1B9CFC',
  className,
}: IconDeVouchProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_590_8514)">
        <path
          d="M11.9221 5.45635L5.16895 19.5419L7.09696 23.5631H12.3659L23.5629 0.210938H20.2445C16.6971 0.210938 13.4609 2.24788 11.9221 5.45635Z"
          fill={fill}
        />
        <path
          d="M7.9813 9.24766L0.210938 9.20056L5.16911 19.5419L7.9813 9.24766Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_590_8514">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
