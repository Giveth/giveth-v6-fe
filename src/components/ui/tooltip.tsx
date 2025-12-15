'use client'

import { cn } from '@/lib/utils'

interface TooltipProps {
  children: React.ReactNode
}

interface TooltipTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

interface TooltipContentProps {
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  className?: string
  children: React.ReactNode
}

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function Tooltip({ children }: TooltipProps) {
  return <>{children}</>
}

function TooltipTrigger({ children }: TooltipTriggerProps) {
  return <>{children}</>
}

function TooltipContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 4,
}: TooltipContentProps) {
  return (
    <div
      className={cn(
        'absolute z-50 w-max max-w-xs rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-md',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        {
          'bottom-full left-1/2 -translate-x-1/2 -translate-y-1':
            side === 'top',
          'top-full left-1/2 -translate-x-1/2 translate-y-1': side === 'bottom',
          'right-full top-1/2 -translate-y-1/2 -translate-x-1': side === 'left',
          'left-full top-1/2 -translate-y-1/2 translate-x-1': side === 'right',
        },
        className,
      )}
      style={{
        marginTop: side === 'bottom' ? sideOffset : undefined,
        marginBottom: side === 'top' ? sideOffset : undefined,
        marginLeft: side === 'right' ? sideOffset : undefined,
        marginRight: side === 'left' ? sideOffset : undefined,
      }}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
