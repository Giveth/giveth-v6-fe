import { X } from 'lucide-react'
import { defineChain } from 'thirdweb/chains'
import { TokenIcon, TokenProvider } from 'thirdweb/react'
import { ProjectBadges } from '@/components/cart/ProjectBadges'
import { ProjectImage } from '@/components/project/ProjectImage'
import { useCart, type ProjectCartItem } from '@/context/CartContext'
import { type ActiveQfRoundsQuery } from '@/lib/graphql/generated/graphql'
import { formatNumber } from '@/lib/helpers/cartHelper'
import { thirdwebClient } from '@/lib/thirdweb/client'

export const ProjectCartCard = ({
  roundData,
  project,
}: {
  roundData: ActiveQfRoundsQuery['activeQfRounds'][0]
  project: ProjectCartItem
}) => {
  const { updateProjectDonation, removeFromCart } = useCart()

  const handleRemoveItem = (roundId: number, itemId: string) => {
    removeFromCart(roundId, itemId)
  }

  return (
    <div className="px-4 py-4 border border-giv-gray-300 mb-4 mn-last:mb-0 rounded-xl hover:bg-giv-gray-200 transition-colors">
      {/* Project Info */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ProjectImage
            src={project.image}
            alt={project.title}
            className="w-14 h-[45px] rounded-md overflow-hidden"
          />
          <h4 className="text-base font-medium text-giv-gray-900">
            {project.title}
          </h4>
        </div>
        <button
          onClick={() =>
            handleRemoveItem(Number(roundData?.id ?? 0), project.id)
          }
          className="w-6 h-6 rounded border border-giv-gray-500 flex items-center justify-center text-giv-gray-500 hover:border-giv-pinky-500 hover:text-giv-pinky-500 transition-colors shrink-0 bg-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Amount Row */}
      <div className="max-[480px]:flex-wrap flex items-center justify-between mt-8 gap-2">
        <div className="flex flex-wrap max-[480px]:w-full md:w-auto gap-2">
          <ProjectBadges project={project} roundData={roundData} />
        </div>

        <div className="flex items-center text-base font-medium gap-2 border border-giv-gray-100 rounded-md pr-3 pl-2 py-2">
          {project.selectedToken?.symbol && project.selectedToken?.address && (
            <TokenProvider
              address={project.selectedToken.address}
              chain={defineChain(project.selectedToken.chainId)}
              client={thirdwebClient}
            >
              <TokenIcon className="h-5 w-5" />
            </TokenProvider>
          )}
          <span className="text-giv-gray-700">
            {project.selectedToken?.symbol ?? ''}
          </span>
          <input
            type="text"
            value={project.donationAmount ?? '0'}
            onChange={e => {
              updateProjectDonation(
                Number(roundData?.id ?? 0),
                project.id,
                String(e.target.value),
                project.selectedToken?.symbol ?? '',
                project.selectedToken?.address ?? '',
                project.selectedToken?.chainId ?? 0,
              )
            }}
            className="w-full max-[480px]:w-24 md:w-16 focus:w-28 transition-[width] duration-200 ease-out text-base p-0 font-medium text-left text-giv-gray-900 focus:outline-none"
          />
          <span className="px-2 py-1 bg-giv-gray-300 rounded-lg text-xs text-giv-gray-700">
            ${' '}
            {formatNumber(
              (project.selectedToken?.priceInUSD ?? 0) *
                Number(project.donationAmount ?? 0),
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
