import { ProjectCard } from './ProjectCard'

const MOCK_PROJECTS = [
  {
    id: '1',
    title: 'The Giveth Community of Makers',
    author: 'Lauren Luz',
    description:
      "The Commons Simulator is a gamified simulation tool powered by a cadCAD backend that was developed by the Commons Stack's Decentralized Dev community.",
    raised: 1200,
    totalRaised: 38.03,
    contributors: 25,
    image:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000',
    slug: 'the-giveth-community-of-makers',
  },
  {
    id: '2',
    title: 'Reforestation with biodiversity AgroForest',
    author: 'Green Earth',
    description: 'Planting trees to restore the earth.',
    raised: 850,
    totalRaised: 38.03,
    contributors: 25,
    image:
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1000',
    slug: 'reforestation-project',
  },
  {
    id: '3',
    title: 'Web3 Education for All',
    author: 'EduDAO',
    description: 'Teaching the next generation of web3 developers.',
    raised: 3200,
    totalRaised: 38.03,
    contributors: 25,
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000',
    slug: 'web3-education',
  },
  {
    id: '4',
    title: 'Community Garden Project',
    author: 'Local Roots',
    description: 'Growing food for the community.',
    raised: 450,
    totalRaised: 38.03,
    contributors: 25,
    image:
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=1000',
    slug: 'community-garden',
  },
  {
    id: '5',
    title: 'Solar Power for Remote Villages',
    author: 'Sun Energy',
    description: 'Bringing light to those in need.',
    raised: 5600,
    totalRaised: 38.03,
    contributors: 25,
    image:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1000',
    slug: 'solar-power',
  },
  {
    id: '6',
    title: 'Clean Water Initiative',
    author: 'Water for Life',
    description: 'Providing clean water to remote areas.',
    raised: 2100,
    totalRaised: 38.03,
    contributors: 25,
    image:
      'https://images.unsplash.com/photo-1538300342682-cf57afb97285?auto=format&fit=crop&q=80&w=1000',
    slug: 'clean-water',
  },
]

export function ProjectGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {MOCK_PROJECTS.map(project => (
        <ProjectCard key={project.id} {...project} />
      ))}
    </div>
  )
}
