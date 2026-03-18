'use client'

import { Check } from 'lucide-react'

const STEPS = [
  'Personal Info',
  'Project Registry',
  'Contacts',
  'Milestones',
  'Managing Funds',
  'Terms',
]

export function GivbacksStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8 flex items-start justify-between gap-2">
      {STEPS.map((label, idx) => {
        const step = idx + 1
        const isDone = step < currentStep
        const isActive = step === currentStep

        return (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {idx > 0 && (
                <div
                  className={`h-0.5 flex-1 ${
                    isDone || isActive ? 'bg-giv-brand-500' : 'bg-giv-neutral-300'
                  }`}
                />
              )}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  isDone
                    ? 'border-giv-brand-500 bg-giv-brand-500 text-white'
                    : isActive
                      ? 'border-giv-brand-500 bg-white text-giv-brand-500'
                      : 'border-giv-neutral-300 bg-white text-giv-neutral-400'
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : step}
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    isDone ? 'bg-giv-brand-500' : 'bg-giv-neutral-300'
                  }`}
                />
              )}
            </div>
            <span
              className={`mt-2 hidden max-w-[72px] text-center text-xs leading-tight sm:block ${
                isActive ? 'font-semibold text-giv-brand-500' : 'text-giv-neutral-500'
              }`}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
