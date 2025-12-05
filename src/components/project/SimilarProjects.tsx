import { ProjectCard } from '@/components/qf/ProjectCard'
import { useProjects } from '@/hooks/useProject'

export function SimilarProjects() {
  const { data } = useProjects(0, 3)
  const projects = data?.projects.projects || []

  return (
    <div>
      <div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-900">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 12H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 5L19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            id={project.id}
            title={project.title}
            author={
              project.adminUser?.name ||
              project.adminUser?.firstName ||
              'Unknown'
            }
            image={project.image || ''}
            raised={project.totalDonations}
            slug={project.slug}
          />
        ))}
      </div>
    </div>
  )
}
