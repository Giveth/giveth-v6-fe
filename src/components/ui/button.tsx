import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-accent-strong,_var(--giv-primary-500))] text-white shadow-card hover:opacity-95 focus-visible:ring-[var(--color-accent)]',
        secondary:
          'border border-[var(--color-border-strong)] bg-[var(--color-card)] text-[var(--color-text)] hover:border-[var(--color-accent)]',
        ghost:
          'bg-transparent text-[var(--color-text)] hover:bg-[color-mix(in srgb, var(--color-accent) 8%, transparent)]',
        subtle:
          'bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:bg-[color-mix(in srgb, var(--color-accent) 12%, transparent)]',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'
