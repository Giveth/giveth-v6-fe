interface IconRecentlyUpdatedProps {
  width?: number
  height?: number
  fill?: string
  className?: string
}

export function IconRecentlyUpdated({
  width = 16,
  height = 16,
  fill = 'currentColor',
  className,
}: IconRecentlyUpdatedProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_1198_3220)">
        <path
          d="M7.14582 15.4688H8.85415M6.71873 14.1897H9.28123M7.99998 12.9107V9.50001M7.99998 9.50001C8.43393 9.50001 8.99997 9.0625 8.99997 9.0625M7.99998 9.50001C7.56604 9.50001 6.99997 9.0625 6.99997 9.0625M13.2812 8.09375H14.4687M13.2345 6.11004L14.3816 5.8027M12.433 4.22324L13.4614 3.62949M10.6897 2.65803L11.3708 1.68529M7.92767 1.84434V0.671875M2.74017 8.09375H1.55267M2.78685 6.11004L1.63981 5.8027M3.52591 4.09824L2.4975 3.50449M5.20671 2.68928L4.52559 1.71654M9.28123 12.9107V12.2712C9.28123 11.4985 10.1231 10.7676 10.6692 10.2461C11.4391 9.51147 11.8437 8.52449 11.8437 7.36831C11.8437 5.23662 10.1426 3.53126 7.99998 3.53126C7.49482 3.52986 6.99436 3.62815 6.52738 3.82048C6.0604 4.01281 5.63611 4.29539 5.2789 4.65197C4.9217 5.00856 4.63862 5.43211 4.44596 5.89828C4.25329 6.36444 4.15483 6.86403 4.15624 7.36831C4.15624 8.48319 4.57825 9.53705 5.33072 10.2461C5.87391 10.758 6.71873 11.4905 6.71873 12.2712V12.9107H9.28123Z"
          stroke={fill}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1198_3220">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
