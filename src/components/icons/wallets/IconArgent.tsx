interface IconArgentProps {
  width?: number
  height?: number
  className?: string
}

export function IconArgent({
  width = 128,
  height = 128,
  className,
}: IconArgentProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fill="#FF875B"
        d="M211.5,213.4h-52.4c-1.8,0-3.2,1.5-3.2,3.3c-1.1,50.8-26.8,99-71.1,133.1c-1.4,1.1-1.7,3.1-0.7,4.6l30.7,43.7
        c1,1.5,3.1,1.8,4.5,0.7c27.7-21.2,50-46.8,66-75.1c16,28.4,38.3,53.9,66,75.1c1.4,1.1,3.5,0.8,4.5-0.7l30.7-43.7
        c1-1.5,0.7-3.5-0.7-4.6c-44.3-34.1-70-82.3-71.1-133.1C214.7,214.8,213.3,213.4,211.5,213.4z"
      />
    </svg>
  )
}
