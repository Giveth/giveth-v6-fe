import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export const DropdownStakeNetworks = ({
  selectedChain,
  chains,
  onSelectChain,
}: {
  selectedChain: number
  chains: { id: number; name: string }[]
  onSelectChain: (chainId: number) => void
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-xl border border-giv-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-giv-neutral-900 transition hover:bg-giv-neutral-100"
        >
          {chains.find(chain => chain.id === selectedChain)?.name ??
            'Select network'}
          <span className="text-xs text-giv-neutral-600">v</span>
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
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-giv-neutral-900 outline-none hover:bg-giv-neutral-100 focus:bg-giv-neutral-100"
            >
              {chain.name}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
