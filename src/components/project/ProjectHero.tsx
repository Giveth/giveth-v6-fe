interface ProjectHeroProps {
  project: {
    title: string
    image?: string | null
    adminUser?: {
      name?: string | null
      firstName?: string | null
      lastName?: string | null
    } | null
  }
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const adminName =
    project.adminUser?.name ||
    `${project.adminUser?.firstName || ''} ${project.adminUser?.lastName || ''}`.trim() ||
    'Unknown'

  return (
    <div className="relative rounded-2xl overflow-hidden h-[320px]">
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#1b1657] via-[#2d1f5e] to-[#1b1657]"
        style={{
          backgroundImage: project.image
            ? `url(${project.image})`
            : `url('/abstract-purple-cosmic-waves.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1b1657]/90 via-[#1b1657]/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
        <p className="text-[#a5adbf]">{adminName}</p>
      </div>
    </div>
  )
}
