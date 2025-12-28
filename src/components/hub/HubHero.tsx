import Image from 'next/image'

export function HubHero() {
  return (
    <div className="mt-2 py-7">
      <div className="max-w-7xl mx-auto">
        <Image
          src="/images/hub/hub-hero.png"
          alt="Hub Hero"
          width={1200}
          height={268}
          className="w-full h-auto"
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
      </div>
    </div>
  )
}
