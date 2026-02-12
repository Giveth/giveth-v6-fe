import { useQuery } from '@tanstack/react-query'
import { useActiveWalletChain } from 'thirdweb/react'
import { useSiweAuth } from '@/context/AuthContext'
import { SUBGRAPH_POLLING_INTERVAL } from '@/lib/constants/staking-power-constants'
import { fetchSubgraphData } from '@/lib/helpers/stakeHelper'

export const useSubgraphInfo = (chainId?: number) => {
  const { walletAddress } = useSiweAuth()
  const chain = useActiveWalletChain()
  const _chainId = chainId || chain?.id
  return useQuery({
    queryKey: ['subgraph', _chainId, walletAddress],
    queryFn: async () =>
      await fetchSubgraphData(_chainId, walletAddress as `0x${string}`),
    enabled: !!_chainId,
    staleTime: SUBGRAPH_POLLING_INTERVAL,
  })
}
