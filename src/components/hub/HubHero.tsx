import Image from 'next/image'

export function HubHero() {
  const desktopHeroSrc = '/images/hub/hub-hero.png'
  const mobileHeroSrc = '/images/hub/hub-hero-mobile.png'

  return (
    <div className="mt-0 sm:mt-2 py-7 px-6 sm:px-0">
      <div className="max-w-7xl mx-auto">
        <Image
          src={desktopHeroSrc}
          alt="Hub Hero"
          width={1200}
          height={180}
          className="hidden sm:block w-full h-auto"
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
        <Image
          src={mobileHeroSrc}
          alt="Hub Hero Mobile"
          width={352}
          height={200}
          className="block sm:hidden w-full h-auto"
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
      </div>
    </div>
  )
}
