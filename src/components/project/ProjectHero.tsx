import Link from 'next/link'
import type { Route } from 'next'

interface ProjectHeroProps {
  project: {
    title: string
    image?: string | null
    adminUser?: {
      name?: string | null
      firstName?: string | null
      lastName?: string | null
      wallets?: {
        address: string
      }[]
    } | null
  }
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const adminName =
    project.adminUser?.name ||
    `${project.adminUser?.firstName || ''} ${project.adminUser?.lastName || ''}`.trim() ||
    'Unknown'
  const adminAddress = project.adminUser?.wallets?.[0]?.address

  return (
    <div className="relative h-[400px] overflow-hidden rounded-2xl lg:h-[520px]">
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute bg-cover bg-center inset-0 bg-linear-to-br from-giv-brand-800 via-giv-brand-800 to-giv-brand-800"
        style={{
          backgroundImage: project.image
            ? `url(${project.image})`
            : `url('/images/defaultProjectImages/3.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-giv-brand-800/90 via-giv-brand-800/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
        {adminAddress ? (
          <Link
            href={`/user/${adminAddress}` as Route}
            className="text-xl text-giv-neutral-300! hover:opacity-80 transition-opacity duration-300"
          >
            {adminName}
          </Link>
        ) : (
          <span className="text-xl text-giv-neutral-300!">{adminName}</span>
        )}
      </div>
    </div>
  )
}
