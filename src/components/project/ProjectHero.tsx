interface ProjectHeroProps {
  title: string
  image?: string | null
  descriptionSummary?: string | null
}

export function ProjectHero({
  title,
  image,
  descriptionSummary,
}: ProjectHeroProps) {
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-black">
      {/* Background Image/Video Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10" />
      {/* Abstract background similar to design */}
      {image ? (
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b1657] via-[#3811bf] to-[#000] opacity-80" />
      )}

      {/* Content */}
      <div className="relative z-20 flex h-full flex-col justify-end p-8">
        <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
          {title}
        </h1>
        {descriptionSummary && (
          <p className="text-lg font-medium text-white/80">
            {descriptionSummary}
          </p>
        )}
      </div>
    </div>
  )
}
