import * as donationTokenPayloadModule from '@/lib/helpers/donationTokenPayload'

const { multicallMock, readContractMock } = vi.hoisted(() => ({
  multicallMock: vi.fn(),
  readContractMock: vi.fn(),
}))

vi.mock('viem', async () => {
  const actual = await vi.importActual('viem')

  return {
    ...actual,
    createPublicClient: vi.fn(() => ({
      multicall: multicallMock,
    })),
    http: vi.fn((url: string) => ({ url })),
  }
})

vi.mock('thirdweb', async () => {
  const actual = await vi.importActual('thirdweb')

  return {
    ...actual,
    defineChain: vi.fn((id: number) => ({
      id,
      rpc: `https://${id}.rpc.test`,
    })),
    getContract: vi.fn(options => options),
    readContract: readContractMock,
  }
})

vi.mock('@/lib/thirdweb/client', () => ({
  thirdwebClient: {},
}))

beforeEach(() => {
  multicallMock.mockReset()
  readContractMock.mockReset()
})

describe('withContractReadRetry', () => {
  afterEach(() => {
    donationTokenPayloadModule.resetDonationTokenPayloadCachesForTests()
  })

  it('retries transient contract read failures', async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('Network request failed'))
      .mockResolvedValueOnce('ok')

    await expect(
      donationTokenPayloadModule.withContractReadRetry(operation, 1),
    ).resolves.toBe('ok')
    expect(operation).toHaveBeenCalledTimes(2)
  })
})

describe('normalizeDonationTokenPayload', () => {
  afterEach(() => {
    donationTokenPayloadModule.resetDonationTokenPayloadCachesForTests()
  })

  it('uses backend canonical metadata for known ERC20 tokens', () => {
    const result = donationTokenPayloadModule.normalizeDonationTokenPayload(
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
    const result = donationTokenPayloadModule.normalizeDonationTokenPayload({
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
    const result = donationTokenPayloadModule.normalizeDonationTokenPayload({
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

describe('resolveDonationTokenPayload', () => {
  afterEach(() => {
    donationTokenPayloadModule.resetDonationTokenPayloadCachesForTests()
  })

  it('batches concurrent unknown token metadata reads per chain', async () => {
    multicallMock.mockResolvedValue([
      {
        status: 'success',
        result: 'TOKENA',
      },
      {
        status: 'success',
        result: 6,
      },
      {
        status: 'success',
        result: 'TOKENB',
      },
      {
        status: 'success',
        result: 18,
      },
    ])

    const [tokenA, tokenB] = await Promise.all([
      donationTokenPayloadModule.resolveDonationTokenPayloadWithKnownTokens(
        {
          chainId: 10,
          selectedToken: {
            address: '0x1111111111111111111111111111111111111111',
            symbol: 'OLDA',
            decimals: 8,
            chainId: 10,
            priceInUSD: 0,
            balance: '0',
            formattedBalance: '0',
          },
          tokenSymbol: 'OLDA',
          tokenAddress: '0x1111111111111111111111111111111111111111',
          tokenDecimals: 8,
        },
        [],
      ),
      donationTokenPayloadModule.resolveDonationTokenPayloadWithKnownTokens(
        {
          chainId: 10,
          selectedToken: {
            address: '0x2222222222222222222222222222222222222222',
            symbol: 'OLDB',
            decimals: 8,
            chainId: 10,
            priceInUSD: 0,
            balance: '0',
            formattedBalance: '0',
          },
          tokenSymbol: 'OLDB',
          tokenAddress: '0x2222222222222222222222222222222222222222',
          tokenDecimals: 8,
        },
        [],
      ),
    ])

    expect(multicallMock).toHaveBeenCalledTimes(1)
    expect(readContractMock).not.toHaveBeenCalled()
    expect(multicallMock.mock.calls[0]?.[0]?.contracts).toHaveLength(4)
    expect(tokenA).toEqual({
      currency: 'TOKENA',
      tokenAddress: '0x1111111111111111111111111111111111111111',
      decimals: 6,
      isNativeToken: false,
    })
    expect(tokenB).toEqual({
      currency: 'TOKENB',
      tokenAddress: '0x2222222222222222222222222222222222222222',
      decimals: 18,
      isNativeToken: false,
    })
  })
})
