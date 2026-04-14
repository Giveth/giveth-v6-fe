/**
 * Formats matching pool values for round hub/projects pages.
 *
 * Priority:
 * 1) Show token amount when allocated fund and token symbol are available.
 * 2) Otherwise show USD when allocatedFundUSD is available.
 * 3) Fallback to $0.
 */
export const formatMatchingPool = (
  allocatedFundUSD?: number | null,
  _allocatedFundUSDPreferred?: boolean | null,
  allocatedFund?: number | null,
  allocatedTokenSymbol?: string | null,
): string => {
  const trimmedTokenSymbol = allocatedTokenSymbol?.trim()
  const hasTokenAmount =
    allocatedFund != null && allocatedFund > 0 && Boolean(trimmedTokenSymbol)

  if (hasTokenAmount) {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(allocatedFund)
    return `${formattedAmount} ${trimmedTokenSymbol}`
  }

  if (allocatedFundUSD != null && allocatedFundUSD > 0) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(allocatedFundUSD)
  }

  return '$0'
}
