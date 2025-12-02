'use client';

import { ProjectCard } from '@/components/qf/ProjectCard';
import { useState } from 'react';

// Mock Data
const PROJECTS = [
    {
        id: '1',
        title: 'Diamante Luz Center for Regenerative Living',
        author: 'Diamante Luz',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000',
        raised: 1200,
        slug: '1',
    },
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
    {
        id: '5',
        title: 'Solar Power for Remote Villages',
        author: 'Sun Energy',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1000',
        raised: 5600,
        slug: '5',
    },
    {
        id: '6',
        title: 'Clean Water Initiative',
        author: 'Water for Life',
        image: 'https://images.unsplash.com/photo-1538300342682-cf57afb97285?auto=format&fit=crop&q=80&w=1000',
        raised: 2100,
        slug: '6',
    },
];

const CATEGORIES = ['All', 'Education', 'Environment', 'Community', 'Technology'];

export default function Home() {
    const [activeCategory, setActiveCategory] = useState('All');

    return (
        <main className="min-h-screen bg-[#fcfcff] pb-20">
            {/* Hero Section */}
            <div className="bg-[#1b1657] px-4 py-16 text-center sm:px-6 lg:px-8">
                <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
                    Quadratic Funding Round 3
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-gray-300">
                    Support public goods and see your impact multiplied. Your donation is matched by the QF pool.
                </p>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Filters */}
                <div className="mb-10 flex flex-wrap justify-center gap-3">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`rounded-full px-6 py-2 text-sm font-bold transition-all ${activeCategory === category
                                    ? 'bg-[#fd67ac] text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Projects Grid */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {PROJECTS.map((project) => (
                        <ProjectCard key={project.id} {...project} />
                    ))}
                </div>

                {/* Load More */}
                <div className="mt-16 text-center">
                    <button className="rounded-full border-2 border-[#d81a72] px-8 py-3 text-sm font-bold text-[#d81a72] transition-colors hover:bg-[#d81a72] hover:text-white">
                        Load More Projects
                    </button>
                </div>
            </div>
        </main>
    );
}
