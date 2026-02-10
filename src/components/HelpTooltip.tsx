'use client'

import * as Tooltip from '@radix-ui/react-tooltip'
import clsx from 'clsx'

export function HelpTooltip({
  text,
  className,
  width = 4,
  height = 4,
  side = 'top',
  fontSize = 'text-xs',
}: {
  text: string
  className?: string
  width?: number
  height?: number
  side?: 'top' | 'right' | 'bottom' | 'left'
  fontSize?: string
}) {
  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div
            className={clsx(
              className,
              `flex h-${height} w-${width} cursor-pointer p-2.5 items-center justify-center rounded-full bg-black ${fontSize} font-semibold text-white`,
            )}
          >
            ?
          </div>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            sideOffset={8}
            className="
              z-50 max-w-xs rounded-lg bg-black px-3 py-2 text-md text-white
              shadow-lg
              animate-in fade-in zoom-in-95
            "
          >
            {text}
            <Tooltip.Arrow className="fill-black" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
