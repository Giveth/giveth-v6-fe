interface IconAmountRaisedQFProps {
  width?: number
  height?: number
  fill?: string
  className?: string
}

export function IconAmountRaisedQF({
  width = 16,
  height = 16,
  fill = 'currentColor',
  className,
}: IconAmountRaisedQFProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_1198_3211)">
        <path
          d="M5.33331 9.33337C7.54245 9.33337 9.33331 7.54251 9.33331 5.33337C9.33331 3.12424 7.54245 1.33337 5.33331 1.33337C3.12417 1.33337 1.33331 3.12424 1.33331 5.33337C1.33331 7.54251 3.12417 9.33337 5.33331 9.33337Z"
          stroke={fill}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.06 6.91333C12.6902 7.14828 13.251 7.53835 13.6905 8.04746C14.13 8.55657 14.434 9.16829 14.5745 9.82604C14.7149 10.4838 14.6872 11.1663 14.494 11.8106C14.3008 12.4548 13.9482 13.0399 13.4689 13.5117C12.9896 13.9836 12.3991 14.327 11.752 14.5101C11.1048 14.6933 10.4219 14.7103 9.76643 14.5596C9.11095 14.4089 8.50405 14.0954 8.00186 13.648C7.49967 13.2006 7.1184 12.6338 6.89331 12"
          stroke={fill}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.66669 4H5.33335V6.66667"
          stroke={fill}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.14 9.2533L11.6067 9.72663L9.72668 11.6066"
          stroke={fill}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1198_3211">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
