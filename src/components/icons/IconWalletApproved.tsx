interface IconWalletApprovedProps {
  width?: number
  height?: number
  fill?: string
  className?: string
}

export function IconWalletApproved({
  width = 24,
  height = 24,
  fill = 'currentColor',
  className,
}: IconWalletApprovedProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M21.75 12V9C21.75 7.75736 20.7426 6.75 19.5 6.75H4.5C3.25736 6.75 2.25 7.75736 2.25 9V18C2.25 19.2426 3.25736 20.25 4.5 20.25H12M22 15L16.5 20.5L14 18"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.2825 6.7507V5.34446C19.2824 4.99955 19.2062 4.65893 19.0592 4.34688C18.9123 4.03483 18.6984 3.75905 18.4326 3.53922C18.1668 3.31939 17.8558 3.16092 17.5217 3.07513C17.1877 2.98934 16.8388 2.97833 16.5 3.0429L4.155 5.14993C3.6189 5.25209 3.13526 5.53813 2.78749 5.95872C2.43972 6.37932 2.24963 6.90808 2.25 7.45383V9.7507"
        stroke={fill}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line
        x1="6.5"
        y1="10.75"
        x2="17.5"
        y2="10.75"
        stroke={fill}
        strokeLinecap="round"
      />
      <line
        x1="6.5"
        y1="13"
        x2="17.5"
        y2="13"
        stroke={fill}
        strokeLinecap="round"
      />
      <line
        x1="6.5"
        y1="15.25"
        x2="11.5"
        y2="15.25"
        stroke={fill}
        strokeLinecap="round"
      />
    </svg>
  )
}
