'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Dialog, Flex, Text } from '@radix-ui/themes'
import clsx from 'clsx'
import { type Route } from 'next'
import { env } from '@/lib/env'

interface DonateTimeModalProps {
  isOpen: boolean
  onClose: () => void
  roundName: string
  beginDate?: string | null
  projectSlug: string
}

export function DonateTimeModal({
  isOpen,
  onClose,
  roundName,
  beginDate,
  projectSlug,
}: DonateTimeModalProps) {
  const formattedBeginDate = useMemo(() => {
    if (!beginDate) return '--'
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(beginDate))
  }, [beginDate])
  const oldProjectUrl = `${env.OLD_FRONTEND_URL}/project/${projectSlug}`

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={open => {
        if (!open) onClose()
      }}
    >
      <Dialog.Content size="3" className="w-[92vw] max-w-xl rounded-3xl">
        <Dialog.Title className="sr-only">Donate to</Dialog.Title>
        <Dialog.Description className="sr-only">
          Round hasn&apos;t started yet
        </Dialog.Description>

        <div className="px-6 py-5">
          <Flex align="center" justify="between" className="mb-6">
            <Text size="6" weight="bold" className="text-giv-neutral-900">
              Donate to
            </Text>
            <Dialog.Close>
              <button
                type="button"
                aria-label="Close"
                className="rounded-full p-2 hover:bg-giv-neutral-100 cursor-pointer"
              >
                <Cross2Icon className="w-5 h-5 text-giv-neutral-900" />
              </button>
            </Dialog.Close>
          </Flex>

          <div className="rounded-2xl border border-giv-neutral-300 bg-giv-neutral-200 px-5 py-4 text-sm text-giv-neutral-900">
            The <span className="font-bold">{roundName}</span> hasn&apos;t
            started yet. It starts on{' '}
            <span className="font-bold">{formattedBeginDate}</span>. You can
            donate now, but your donation will not be eligible for matching.
          </div>
          <Link
            href={oldProjectUrl as Route}
            target="_blank"
            rel="noreferrer"
            className={clsx(
              'w-full h-[48px] mt-4 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
              'bg-giv-brand-300! text-white! hover:bg-giv-brand-400! hover:text-white',
            )}
          >
            Donate to Project
          </Link>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}
