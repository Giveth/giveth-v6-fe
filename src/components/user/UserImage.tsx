'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { USER_AVATAR_FALLBACK_IMAGE } from '@/lib/constants/other-constants'

interface UserImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src'
> {
  src?: string | null
  alt: string
  userAddress?: string | null
}

interface IGiversPFPToken {
  id: string
  tokenId: string
  imageIpfs: string
}

type TokensCacheValue = IGiversPFPToken[] | Promise<IGiversPFPToken[]>

const GIVERS_PFP_SUBGRAPH_ID = '9QK3vLoWF69TXSenUzQkkLhessaViu4naE58gRyKCxU7'
const GIVERS_PFP_GATEWAY_HOST = 'https://giveth.mypinata.cloud/ipfs/'
const giversTokensByAddressCache = new Map<string, TokensCacheValue>()

const getMainnetSubgraphUrl = () => {
  const graphApiKey = process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY
  return graphApiKey
    ? `https://gateway-arbitrum.network.thegraph.com/api/${graphApiKey}/subgraphs/id/${GIVERS_PFP_SUBGRAPH_ID}`
    : `https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/${GIVERS_PFP_SUBGRAPH_ID}`
}

const normalizeIpfsHash = (value: string | null | undefined): string | null => {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  const noProtocol = trimmed.replace(/^ipfs:\/\//i, '').replace(/^ipfs\//i, '')

  if (/^[A-Za-z0-9]+$/.test(noProtocol)) {
    return noProtocol
  }

  try {
    const parsed = new URL(trimmed)
    const segments = parsed.pathname.split('/').filter(Boolean)
    const ipfsIndex = segments.findIndex(segment => segment === 'ipfs')
    if (ipfsIndex >= 0 && segments[ipfsIndex + 1]) {
      return segments[ipfsIndex + 1]
    }
    return segments.at(-1) ?? null
  } catch {
    const segments = trimmed.split('/').filter(Boolean)
    return segments.at(-1) ?? null
  }
}

const buildGatewayUrlFromIpfsHash = (ipfsHash: string) =>
  `${GIVERS_PFP_GATEWAY_HOST}${ipfsHash}`

const fetchGiversTokensByAddress = async (
  walletAddress: string,
): Promise<IGiversPFPToken[]> => {
  const normalizedAddress = walletAddress.toLowerCase()
  const cached = giversTokensByAddressCache.get(normalizedAddress)
  if (cached) return await cached

  const pendingRequest = (async () => {
    const response = await fetch(getMainnetSubgraphUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetGiversPFPTokens($user: String!) {
            giversPFPTokens(where: { user: $user }) {
              id
              tokenId
              imageIpfs
            }
          }
        `,
        variables: {
          user: normalizedAddress,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Subgraph request failed: ${response.status}`)
    }

    const json = (await response.json()) as {
      data?: { giversPFPTokens?: IGiversPFPToken[] }
    }

    return json?.data?.giversPFPTokens ?? []
  })()

  giversTokensByAddressCache.set(normalizedAddress, pendingRequest)

  try {
    const tokens = await pendingRequest
    giversTokensByAddressCache.set(normalizedAddress, tokens)
    return tokens
  } catch (error) {
    giversTokensByAddressCache.delete(normalizedAddress)
    throw error
  }
}

export function UserImage({
  src,
  alt,
  className,
  userAddress,
  ...props
}: UserImageProps) {
  const hasCustomUploadedImage =
    Boolean(src) && src !== USER_AVATAR_FALLBACK_IMAGE
  const [resolvedImgSrc, setResolvedImgSrc] = useState<string>(
    src || USER_AVATAR_FALLBACK_IMAGE,
  )
  const [isGiversNftAvatar, setIsGiversNftAvatar] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const baseImage = src || USER_AVATAR_FALLBACK_IMAGE

    setResolvedImgSrc(baseImage)
    setIsGiversNftAvatar(false)
    setHasError(false)

    const avatarHash = normalizeIpfsHash(src)
    const normalizedAddress = userAddress?.trim().toLowerCase()

    if (!avatarHash || !normalizedAddress) return

    const resolveGiversAvatar = async () => {
      try {
        const tokens = await fetchGiversTokensByAddress(normalizedAddress)
        if (isCancelled || !tokens.length) return

        const matchedToken = tokens.find(token => {
          const tokenHash = normalizeIpfsHash(token.imageIpfs)
          return tokenHash === avatarHash
        })

        if (!matchedToken) return

        const matchedHash = normalizeIpfsHash(matchedToken.imageIpfs)
        if (!matchedHash || isCancelled) return

        setResolvedImgSrc(buildGatewayUrlFromIpfsHash(matchedHash))
        setIsGiversNftAvatar(true)
      } catch {
        // Ignore lookup failures and keep the existing avatar/fallback.
      }
    }

    void resolveGiversAvatar()

    return () => {
      isCancelled = true
    }
  }, [src, userAddress])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setResolvedImgSrc(USER_AVATAR_FALLBACK_IMAGE)
      setIsGiversNftAvatar(false)
    }
  }

  return (
    <img
      src={resolvedImgSrc}
      alt={alt}
      onError={handleError}
      className={clsx(
        className,
        hasCustomUploadedImage && !isGiversNftAvatar && 'scale-[0.86]',
        isGiversNftAvatar && 'scale-100',
      )}
      {...props}
    />
  )
}
