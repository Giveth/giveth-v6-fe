import { useEffect, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { useActiveWalletChain } from 'thirdweb/react'
import { ChainIcon } from '@/components/ChainIcon'
import { useCart } from '@/context/CartContext'
import { getChainName } from '@/lib/helpers/chainHelper'

export const ChainDropdown = ({
  selectedChainId,
  eligibleNetworks,
  roundId,
}: {
  selectedChainId?: number | null
  eligibleNetworks: number[]
  roundId: number
}) => {
  // Get user wallet current chain id
  const chain = useActiveWalletChain()
  const chainId = chain?.id ?? 0

  const { updateSelectedChainId } = useCart()
  const [selectedChainIdState, setSelectedChainIdState] = useState<number>(
    selectedChainId && selectedChainId > 0 ? selectedChainId : chainId,
  )

  useEffect(() => {
    if (selectedChainId && selectedChainId > 0) {
      setSelectedChainIdState(selectedChainId)
      return
    }
    if (chainId > 0) {
      setSelectedChainIdState(chainId)
      updateSelectedChainId(roundId, chainId)
    }
  }, [chainId, selectedChainId, roundId, updateSelectedChainId])

  return (
    <DropdownMenu.Root>
      {/* Trigger */}
      <DropdownMenu.Trigger asChild>
        <button className="max-[480px]:w-full md:w-auto flex items-center gap-2 rounded-md border border-giv-neutral-100 px-3 py-2 transition-colors hover:bg-giv-neutral-200 cursor-pointer">
          {selectedChainIdState > 0 && (
            <>
              <ChainIcon networkId={selectedChainIdState} />
              <span className="text-base font-medium text-giv-neutral-900">
                {getChainName(selectedChainIdState)}
              </span>
            </>
          )}
          {!selectedChainIdState && (
            <span className="text-base font-medium text-giv-neutral-900">
              Select a chain
            </span>
          )}
          <ChevronDown className="w-7 h-5 mt-0.5 text-giv-neutral-900 max-[480px]:ml-auto" />
        </button>
      </DropdownMenu.Trigger>

      {/* Dropdown */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          align="start"
          className="
            max-[480px]:w-full md:w-auto 
            z-50 min-w-[180px] rounded-xl border border-giv-neutral-300 bg-white p-1
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
                text-giv-deep-blue-800 outline-none
                hover:bg-giv-neutral-200
                focus:bg-giv-neutral-200
              "
            >
              <div className="flex items-center gap-2 text-giv-neutral-900">
                <ChainIcon networkId={id} />
                {getChainName(id)}
              </div>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
