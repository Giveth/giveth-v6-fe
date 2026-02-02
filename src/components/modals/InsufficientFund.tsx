'use client'

import { Cross2Icon } from '@radix-ui/react-icons'
import { Dialog, Flex, Heading, Text } from '@radix-ui/themes'

type InsufficientFundProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
}

export function InsufficientFund({
  open,
  onOpenChange,
  title = 'Insufficient Fund',
  description = 'Please add funds to your wallet or switch to a different wallet.',
}: InsufficientFundProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="3" className="w-[92vw] max-w-[640px] rounded-3xl">
        <Dialog.Title className="sr-only">{title}</Dialog.Title>
        <Dialog.Description className="sr-only">
          {description}
        </Dialog.Description>
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between">
            <Heading size="4">{title}</Heading>
            <Dialog.Close>
              <button
                type="button"
                aria-label="Close"
                className="rounded-full p-2 hover:bg-black/5 cursor-pointer"
              >
                <Cross2Icon />
              </button>
            </Dialog.Close>
          </Flex>

          <Heading size="7" className="text-center">
            You don’t have enough funds!
          </Heading>

          <Text size="3" className="text-center text-gray-600">
            {description}
          </Text>

          <Flex justify="center" mt="4">
            <Dialog.Close>
              <button className="w-32 py-3 bg-giv-brand-500 text-white! rounded-3xl text-md font-bold flex items-center justify-center gap-2 hover:bg-giv-brand-400 transition-colors cursor-pointer">
                OK
              </button>
            </Dialog.Close>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
