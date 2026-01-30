'use client'

import { useEffect, useState } from 'react'
import { useIsMobile } from '@/hooks/useMediaQuery'

interface QFHeroProps {
  bannerImage?: string
  bannerFull?: string
  bannerMobile?: string
  title: string
  endDate: string
}

export function QFHero({
  bannerImage,
  bannerFull,
  bannerMobile,
  title,
  endDate,
}: QFHeroProps) {
  const isMobile = useIsMobile()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  const bannerImageUrl = bannerImage ? `url(${bannerImage})` : undefined
  const bannerFullUrl = bannerFull ? `url(${bannerFull})` : undefined
  const bannerMobileUrl = bannerMobile ? `url(${bannerMobile})` : undefined

  const resolvedBannerUrl = isMobile
    ? bannerMobileUrl || bannerImageUrl || bannerFullUrl
    : bannerImageUrl || bannerFullUrl

  const hasBanner = !!resolvedBannerUrl

  const remainingMs = Math.max(0, new Date(endDate).getTime() - now)
  const totalMinutes = Math.floor(remainingMs / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  return (
    <div className="relative">
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="relative overflow-hidden rounded-2xl min-h-[200px] sm:min-h-[240px] lg:min-h-[280px]">
          {/* Background with gradient and decorative elements */}
          <div
            className={
              hasBanner
                ? 'absolute inset-0 bg-center bg-cover'
                : 'absolute inset-0 bg-linear-to-r from-giv-brand-100 via-giv-brand-050 to-giv-brand-100'
            }
            style={
              hasBanner ? { backgroundImage: resolvedBannerUrl } : undefined
            }
          >
            {!hasBanner && (
              <>
                {/* Decorative wave patterns */}
                <svg
                  className="absolute top-0 right-0 h-full w-1/2 opacity-30"
                  viewBox="0 0 400 200"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 100 Q100 50 200 100 T400 100"
                    stroke="#5326ec"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.3"
                  />
                  <path
                    d="M0 120 Q100 70 200 120 T400 120"
                    stroke="#8668fc"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.3"
                  />
                  <path
                    d="M0 80 Q100 30 200 80 T400 80"
                    stroke="#5326ec"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.2"
                  />
                </svg>
                <svg
                  className="absolute top-0 left-0 h-full w-1/3 opacity-30"
                  viewBox="0 0 300 200"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M300 100 Q200 50 100 100 T0 100"
                    stroke="#5326ec"
                    strokeWidth="2"
                    fill="none"
                    opacity="0.3"
                  />
                  <path
                    d="M300 130 Q200 80 100 130 T0 130"
                    stroke="#8668fc"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.2"
                  />
                </svg>
              </>
            )}
          </div>

          <div
            className={`absolute bottom-4 left-4 rounded-2xl p-8 text-white ${
              hasBanner ? 'bg-transparent' : 'bg-giv-brand-500'
            }`}
          >
            {!hasBanner && (
              <>
                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-20">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 800 200"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 150 Q200 100 400 150 T800 150"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path
                      d="M0 170 Q200 120 400 170 T800 170"
                      stroke="white"
                      strokeWidth="1"
                      fill="none"
                    />
                  </svg>
                </div>
              </>
            )}

            <div>
              <h1 className="text-3xl font-bold mb-4">{title}</h1>
              <div className="inline-flex flex-col items-start gap-1 px-8 py-4 bg-giv-brand-500 rounded-full text-md font-bold border-2 border-white">
                Round ends in {days} d {hours} h {minutes} min
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
