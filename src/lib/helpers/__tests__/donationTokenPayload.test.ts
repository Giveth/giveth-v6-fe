import {
  normalizeDonationTokenPayload,
  resetDonationTokenPayloadCachesForTests,
  withContractReadRetry,
} from '@/lib/helpers/donationTokenPayload'

describe('withContractReadRetry', () => {
  afterEach(() => {
    resetDonationTokenPayloadCachesForTests()
  })

  it('retries transient contract read failures', async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('Network request failed'))
      .mockResolvedValueOnce('ok')

    await expect(withContractReadRetry(operation, 1)).resolves.toBe('ok')
    expect(operation).toHaveBeenCalledTimes(2)
  })
})

describe('normalizeDonationTokenPayload', () => {
  afterEach(() => {
    resetDonationTokenPayloadCachesForTests()
  })

  it('uses backend canonical metadata for known ERC20 tokens', () => {
    const result = normalizeDonationTokenPayload(
      {
        chainId: 10,
        selectedToken: {
          address: '0xA0b86991C6218B36C1d19D4A2E9Eb0cE3606eb48',
          symbol: 'USD Coin',
          decimals: 18,
          chainId: 10,
          priceInUSD: 1,
          balance: '0',
          formattedBalance: '0',
        },
        tokenSymbol: 'USD Coin',
        tokenAddress: '0xA0b86991C6218B36C1d19D4A2E9Eb0cE3606eb48',
        tokenDecimals: 18,
      },
      [
        {
          address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
          symbol: 'USDC',
          decimals: 6,
        },
      ],
    )

    expect(result).toEqual({
      currency: 'USDC',
      tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
      isNativeToken: false,
    })
  })

  it('treats zero address tokens as native', () => {
    const result = normalizeDonationTokenPayload({
      chainId: 1,
      selectedToken: {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        decimals: 18,
        chainId: 1,
        priceInUSD: 0,
        balance: '0',
        formattedBalance: '0',
      },
      tokenSymbol: 'ETH',
      tokenAddress: '0x0000000000000000000000000000000000000000',
      tokenDecimals: 18,
    })

    expect(result).toEqual({
      currency: 'ETH',
      tokenAddress: undefined,
      decimals: 18,
      isNativeToken: true,
    })
  })

  it('falls back to selected token metadata when no known token exists', () => {
    const result = normalizeDonationTokenPayload({
      chainId: 100,
      selectedToken: {
        address: '0x1111111111111111111111111111111111111111',
        symbol: 'CUSTOM',
        decimals: 8,
        chainId: 100,
        priceInUSD: 0,
        balance: '0',
        formattedBalance: '0',
      },
      tokenSymbol: 'STALE',
      tokenAddress: '0x1111111111111111111111111111111111111111',
      tokenDecimals: 18,
    })

    expect(result).toEqual({
      currency: 'CUSTOM',
      tokenAddress: '0x1111111111111111111111111111111111111111',
      decimals: 8,
      isNativeToken: false,
    })
  })
})
