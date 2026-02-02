'use client'

import * as Tooltip from '@radix-ui/react-tooltip'

export function HelpTooltip({ text }: { text: string }) {
  return (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className="flex h-4 w-4 cursor-pointer p-2.5 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
            ?
          </div>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            side="top"
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
