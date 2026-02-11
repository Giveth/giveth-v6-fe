import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import { ChainIcon } from '@/components/ChainIcon'

export const DropdownStakeNetworks = ({
  selectedChain,
  chains,
  onSelectChain,
}: {
  selectedChain: number
  chains: { id: number; name: string }[]
  onSelectChain: (chainId: number) => void
}) => {
  console.log('selectedChain', selectedChain)
  console.log('chains', chains)
  console.log('onSelectChain', onSelectChain)
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={clsx(
            'max-[480px]:w-full md:w-auto flex items-center gap-2',
            'rounded-md border border-giv-neutral-100 px-3 py-2',
            'transition-colors hover:bg-giv-neutral-200 cursor-pointer focus:outline-none',
          )}
        >
          <ChainIcon networkId={selectedChain} />
          <span className="text-base font-medium text-giv-neutral-900">
            {chains.find(chain => chain.id === selectedChain)?.name ??
              'Select network'}
          </span>
          <ChevronDown className="w-7 h-5 mt-0.5 text-giv-neutral-900 max-[480px]:ml-auto" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="end"
          className="z-50 min-w-[160px] rounded-xl border border-giv-neutral-200 bg-white p-1 shadow-[0px_6px_24px_rgba(0,0,0,0.08)]"
        >
          {chains.map(chain => (
            <DropdownMenu.Item
              key={chain.id}
              onSelect={() => onSelectChain(chain.id)}
              className={clsx(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-giv-neutral-900',
                'outline-none hover:bg-giv-neutral-100 focus:bg-giv-neutral-100 cursor-pointer',
                selectedChain === chain.id && 'bg-giv-neutral-100',
              )}
            >
              <ChainIcon networkId={chain.id} />
              {chain.name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
