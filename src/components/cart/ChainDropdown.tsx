import { memo, useEffect, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { defineChain } from 'thirdweb'
import { ChainProvider, ChainIcon as ThirdwebChainIcon } from 'thirdweb/react'
import { useCart } from '@/context/CartContext'
import { getChainName } from '@/lib/helpers/chainHelper'
import { thirdwebClient } from '@/lib/thirdweb/client'

const chainCache = new Map<number, ReturnType<typeof defineChain>>()
function getCachedChain(chainId: number) {
  const cached = chainCache.get(chainId)
  if (cached) return cached
  const chain = defineChain(chainId)
  chainCache.set(chainId, chain)
  return chain
}

export const ChainDropdown = ({
  selectedChainId,
  eligibleNetworks,
  roundId,
}: {
  selectedChainId?: number | null
  eligibleNetworks: number[]
  roundId: number
}) => {
  const { updateSelectedChainId } = useCart()
  const [selectedChainIdState, setSelectedChainIdState] = useState<number>(
    selectedChainId ?? 0,
  )

  // Keep local state in sync if the parent updates selectedChainId
  useEffect(() => {
    setSelectedChainIdState(selectedChainId ?? 0)
  }, [selectedChainId])

  // If only one eligible network, select it automatically
  useEffect(() => {
    if (selectedChainIdState === 0 && eligibleNetworks.length === 1) {
      const only = eligibleNetworks[0]
      setSelectedChainIdState(only)
      updateSelectedChainId(roundId, only)
    }
  }, [selectedChainIdState, eligibleNetworks])

  return (
    <DropdownMenu.Root>
      {/* Trigger */}
      <DropdownMenu.Trigger asChild>
        <button className="max-[480px]:w-full md:w-auto flex items-center gap-2 rounded-md border border-giv-gray-100 px-3 py-2 transition-colors hover:bg-giv-gray-200 cursor-pointer">
          {selectedChainIdState > 0 && (
            <>
              <ChainIcon chainId={selectedChainIdState} />
              <span className="text-base font-medium text-giv-gray-900">
                {getChainName(selectedChainIdState)}
              </span>
            </>
          )}
          {!selectedChainIdState && (
            <span className="text-base font-medium text-giv-gray-900">
              Select a chain
            </span>
          )}
          <ChevronDown className="w-7 h-5 mt-0.5 text-giv-gray-900 max-[480px]:ml-auto" />
        </button>
      </DropdownMenu.Trigger>

      {/* Dropdown */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="start"
          className="
            max-[480px]:w-full md:w-auto 
            z-50 min-w-[180px] rounded-xl border border-giv-gray-300 bg-white p-1
            shadow-[0px_6px_24px_rgba(0,0,0,0.06)]
          "
        >
          {eligibleNetworks.map(id => (
            <DropdownMenu.Item
              key={id}
              onSelect={() => {
                setSelectedChainIdState(id)
                updateSelectedChainId(roundId, id)
              }}
              className="
                cursor-pointer rounded-lg px-3 py-2 text-sm
                text-[#1f2333] outline-none
                hover:bg-[#f7f7f9]
                focus:bg-[#f7f7f9]
              "
            >
              <div className="flex items-center gap-2">
                <ChainIcon chainId={id} />
                {getChainName(id)}
              </div>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

const ChainIcon = memo(function ChainIcon({ chainId }: { chainId: number }) {
  const chain = getCachedChain(chainId)
  return (
    <ChainProvider chain={chain}>
      <ThirdwebChainIcon
        client={thirdwebClient}
        className="h-5 w-5 rounded-full"
        alt={`${getChainName(chainId)} icon`}
      />
    </ChainProvider>
  )
})

ChainIcon.displayName = 'ChainIcon'
