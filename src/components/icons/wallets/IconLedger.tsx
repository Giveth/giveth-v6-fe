interface IconLedgerProps {
  width?: number
  height?: number
  className?: string
}

export function IconLedger({
  width = 256,
  height = 256,
  className,
}: IconLedgerProps) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 2500 2176"
    >
      <g id="Layer_x0020_1">
        <path d="M0,1558v618h940v-137H137v-481H0z M2363,1558v481h-803v137h940v-618H2363z M942,618v940h618v-124h-481V617H942V618z M0,0   v618h137V137h803V0H0z M1560,0v137h803v481h137V0H1560z"></path>
      </g>
    </svg>
  )
}
