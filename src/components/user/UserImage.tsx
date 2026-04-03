'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { USER_AVATAR_FALLBACK_IMAGE } from '@/lib/constants/other-constants'
import { resolveGiversAvatarGatewayUrl } from '@/lib/helpers/giversAvatarLookup'

interface UserImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src'
> {
  src?: string | null
  alt: string
  userAddress?: string | null
}

const normalizeIpfsHash = (value: string | null | undefined): string | null => {
  if (!value) return null

  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol.toLowerCase() === 'ipfs:') {
      const combined = `${parsed.hostname}${parsed.pathname}`.replace(
        /^\/+/,
        '',
      )
      const segments = combined.split('/').filter(Boolean)
      const ipfsIndex = segments.findIndex(
        segment => segment.toLowerCase() === 'ipfs',
      )
      return (
        (ipfsIndex >= 0
          ? segments.slice(ipfsIndex + 1).join('/')
          : segments.join('/')) || null
      )
    }

    const segments = parsed.pathname.split('/').filter(Boolean)
    const ipfsIndex = segments.findIndex(
      segment => segment.toLowerCase() === 'ipfs',
    )
    if (ipfsIndex >= 0 && segments[ipfsIndex + 1]) {
      return segments.slice(ipfsIndex + 1).join('/')
    }
    return null
  } catch {
    const hasIpfsPrefix =
      /^ipfs:\/\//i.test(trimmed) || /^ipfs\//i.test(trimmed)
    const hasIpfsSegment = /(^|\/)ipfs(\/|$)/i.test(trimmed)
    if (!hasIpfsPrefix && !hasIpfsSegment) return null

    const normalized = trimmed
      .replace(/^ipfs:\/\//i, '')
      .replace(/^ipfs\//i, '')
      .replace(/^\/+/, '')

    const segments = normalized.split('/').filter(Boolean)
    const ipfsIndex = segments.findIndex(
      segment => segment.toLowerCase() === 'ipfs',
    )

    if (ipfsIndex >= 0 && segments[ipfsIndex + 1]) {
      return segments.slice(ipfsIndex + 1).join('/')
    }

    if (hasIpfsPrefix) return segments.join('/') || null

    return null
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
        const resolvedGatewayUrl = await resolveGiversAvatarGatewayUrl({
          normalizedAddress,
          avatarHash,
          normalizeIpfsHash,
        })
        if (!resolvedGatewayUrl || isCancelled) return

        setResolvedImgSrc(resolvedGatewayUrl)
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
