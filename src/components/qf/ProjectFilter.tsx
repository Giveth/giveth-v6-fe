import { MixerHorizontalIcon } from '@radix-ui/react-icons';

export function ProjectFilter() {
    return (
        <div className="flex items-center justify-between py-4">
            <h2 className="text-2xl font-bold text-gray-900">
                Explore <span className="text-gray-400">X projects</span>
            </h2>

            <div className="flex gap-3">
                <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <span>Highest GIVpower</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 4H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <span>Filters</span>
                    <MixerHorizontalIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
