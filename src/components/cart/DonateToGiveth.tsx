'use client'

import { useEffect } from 'react'
import * as Switch from '@radix-ui/react-switch'
import clsx from 'clsx'
import { HelpTooltip } from '@/components/HelpTooltip'
import { useCart } from '@/context/CartContext'
import { GIVETH_PROJECT_ID } from '@/lib/constants/app-main'

export function DonateToGiveth() {
  const { givethPercentage, setGivethPercentage, cartItems } = useCart()

  // Check if we have Giveth project inside cart
  // if we have it don't show the component and reset percentage to 0
  const hasGivethProject = cartItems.some(
    item => item.id === String(GIVETH_PROJECT_ID),
  )

  useEffect(() => {
    if (hasGivethProject) setGivethPercentage(0)
  }, [hasGivethProject, setGivethPercentage])

  if (hasGivethProject) return null

  const handleToggleGiveth = () => {
    setGivethPercentage(givethPercentage === 0 ? 10 : 0)
  }

  const handleSetGivethPercentage = (percentage: number) => {
    if (percentage >= 100) {
      setGivethPercentage(99)
    } else {
      setGivethPercentage(percentage)
    }
  }

  return (
    <div className="p-3 rounded-lg border border-giv-neutral-300 mt-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Switch.Root
          className="
            relative h-5 w-8 shrink-0 cursor-pointer rounded-full
            bg-giv-neutral-300 transition-colors
            data-[state=checked]:bg-giv-brand-500
          "
          checked={givethPercentage > 0}
          onCheckedChange={handleToggleGiveth}
        >
          <Switch.Thumb
            className="
              block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow
              transition-transform
              data-[state=checked]:translate-x-[13px]
            "
          />
        </Switch.Root>

        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-giv-neutral-900">
            Donate to Giveth
          </span>
          <HelpTooltip text="This optional contribution helps Giveth keep building and supporting public goods.The selected percentage is added on top of each donation you make." />
        </div>
      </div>

      {/* Percentage buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {['10%', '15%', '20%', '25%'].map(value => (
          <button
            key={value}
            onClick={() =>
              handleSetGivethPercentage(Number(value.replace('%', '')))
            }
            className={clsx(
              'rounded-full px-3 py-2 text-xs font-medium',
              'bg-giv-brand-050 text-giv-brand-500',
              'hover:bg-giv-brand-100',
              'transition-colors cursor-pointer',
              givethPercentage === Number(value.replace('%', '')) &&
                'bg-giv-brand-100',
              givethPercentage === Number(value.replace('%', '')) &&
                'font-semibold',
            )}
          >
            {value}
          </button>
        ))}

        {/* Custom / 0% */}
        <div
          className={clsx(
            'flex items-center gap-1 rounded-full px-2 py-2 text-sm font-medium ml-auto',
            'border border-giv-neutral-300',
            'hover:bg-giv-neutral-200',
            'transition-colors cursor-pointer',
          )}
        >
          <input
            type="text"
            className="
              w-8
              text-xs
              text-giv-neutral-900
              focus:outline-none transition-colors
              text-center
              "
            value={givethPercentage.toString().replace('%', '')}
            onChange={e => handleSetGivethPercentage(Number(e.target.value))}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSetGivethPercentage(Number(e.currentTarget.value))
              }
            }}
          />
          <span className="text-xs text-giv-neutral-900">%</span>
        </div>
      </div>
    </div>
  )
}
