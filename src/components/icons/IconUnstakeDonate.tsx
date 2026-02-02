interface IconUnstakeDonateProps {
  width?: number
  height?: number
  fill?: string
  className?: string
}

export function IconUnstakeDonate({
  width = 32,
  height = 32,
  fill = '#82899A',
  className,
}: IconUnstakeDonateProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14.6667 20H17.3333C18.0406 20 18.7189 19.719 19.219 19.2189C19.719 18.7188 20 18.0405 20 17.3333C20 16.626 19.719 15.9478 19.219 15.4477C18.7189 14.9476 18.0406 14.6666 17.3333 14.6666H13.3333C12.5333 14.6666 11.8667 14.9333 11.4667 15.4666L4 22.6666"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.3335 28.0004L11.4668 26.1337C11.8668 25.6004 12.5335 25.3337 13.3335 25.3337H18.6668C20.1335 25.3337 21.4668 24.8004 22.4002 23.7337L28.5335 17.867C29.048 17.3808 29.3483 16.7101 29.3683 16.0025C29.3883 15.2948 29.1264 14.6082 28.6402 14.0937C28.1539 13.5792 27.4832 13.2789 26.7756 13.2589C26.0679 13.2389 25.3813 13.5008 24.8668 13.987L19.2668 19.187"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.6665 21.3334L10.6665 29.3334"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.333 15.8661C23.4685 15.8661 25.1996 14.135 25.1996 11.9995C25.1996 9.86398 23.4685 8.13281 21.333 8.13281C19.1975 8.13281 17.4663 9.86398 17.4663 11.9995C17.4663 14.135 19.1975 15.8661 21.333 15.8661Z"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10.6666C10.2091 10.6666 12 8.87577 12 6.66663C12 4.45749 10.2091 2.66663 8 2.66663C5.79086 2.66663 4 4.45749 4 6.66663C4 8.87577 5.79086 10.6666 8 10.6666Z"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
