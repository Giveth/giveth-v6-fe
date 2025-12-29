'use client'

import { useEffect, useState } from 'react'
import { PROJECT_FALLBACK_IMAGE } from '@/lib/constants/project'

interface ProjectImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src'
> {
  src?: string | null
  alt: string
}

export function ProjectImage({
  src,
  alt,
  className,
  ...props
}: ProjectImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || PROJECT_FALLBACK_IMAGE)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImgSrc(src || PROJECT_FALLBACK_IMAGE)
    setHasError(false)
  }, [src])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(PROJECT_FALLBACK_IMAGE)
    }
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  )
}
