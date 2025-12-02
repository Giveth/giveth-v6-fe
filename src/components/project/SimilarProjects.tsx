import { ProjectCard } from '@/components/qf/ProjectCard';

// Mock Data for Similar Projects
const SIMILAR_PROJECTS = [
    {
        id: '2',
        title: 'Reforestation with biodiversity AgroForest',
        author: 'Green Earth',
        image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=1000',
        raised: 850,
        slug: '2',
    },
    {
        id: '3',
        title: 'Web3 Education for All',
        author: 'EduDAO',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1000',
        raised: 3200,
        slug: '3',
    },
    {
        id: '4',
        title: 'Community Garden Project',
        author: 'Local Roots',
        image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=1000',
        raised: 450,
        slug: '4',
    },
];

export function SimilarProjects() {
    return (
        <div>
            <div >
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-900">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
            </div >

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {SIMILAR_PROJECTS.map((project) => (
                    <ProjectCard key={project.id} {...project} />
                ))}
            </div>
        </div>
    );
}
