interface IconAmountRaisedAllTimeProps {
  width?: number
  height?: number
  fill?: string
  className?: string
}

export function IconAmountRaisedAllTime({
  width = 16,
  height = 16,
  fill = 'currentColor',
  className,
}: IconAmountRaisedAllTimeProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_1198_3195)">
        <path
          d="M7.33333 10H8.66667C9.02029 10 9.35943 9.85956 9.60948 9.60952C9.85952 9.35947 10 9.02033 10 8.66671C10 8.31309 9.85952 7.97395 9.60948 7.7239C9.35943 7.47385 9.02029 7.33337 8.66667 7.33337H6.66667C6.26667 7.33337 5.93333 7.46671 5.73333 7.73337L2 11.3334"
          stroke={fill}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.66669 14.0002L5.73335 13.0668C5.93335 12.8002 6.26669 12.6668 6.66669 12.6668H9.33335C10.0667 12.6668 10.7334 12.4002 11.2 11.8668L14.2667 8.93351C14.5239 8.6904 14.6741 8.35505 14.6841 8.00123C14.6941 7.64741 14.5631 7.30411 14.32 7.04685C14.0769 6.78959 13.7416 6.63944 13.3877 6.62944C13.0339 6.61944 12.6906 6.7504 12.4334 6.99351L9.63335 9.59351"
          stroke={fill}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.33331 10.6666L5.33331 14.6666"
          stroke={fill}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.6664 7.93307C11.7342 7.93307 12.5998 7.06749 12.5998 5.99974C12.5998 4.93199 11.7342 4.06641 10.6664 4.06641C9.59868 4.06641 8.73309 4.93199 8.73309 5.99974C8.73309 7.06749 9.59868 7.93307 10.6664 7.93307Z"
          stroke={fill}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 5.33337C5.10457 5.33337 6 4.43794 6 3.33337C6 2.2288 5.10457 1.33337 4 1.33337C2.89543 1.33337 2 2.2288 2 3.33337C2 4.43794 2.89543 5.33337 4 5.33337Z"
          stroke={fill}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1198_3195">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
