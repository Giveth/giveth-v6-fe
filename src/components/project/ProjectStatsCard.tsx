import { useCart } from '@/context/CartContext';

export function ProjectStatsCard() {
    const { addToCart, isInCart } = useCart();
    // Hardcoded ID for demo purposes, matching the one in SimilarProjects or just a constant
    const projectId = '1';
    const inCart = isInCart(projectId);

    const handleAddToCart = () => {
        addToCart({
            id: projectId,
            title: 'Diamante Luz Center for Regenerative Living',
            slug: '1',
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000',
        });
    };

    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-1 text-xs font-medium text-gray-500">Total amount raised</div>
            <div className="mb-1 text-4xl font-bold text-gray-900">$1,200</div>
            <div className="mb-6 text-sm text-gray-500">Raised from <span className="font-bold text-gray-900">25</span> contributors</div>

            <div className="mb-6 rounded-xl border border-gray-100 p-4">
                <h3 className="mb-2 text-sm font-bold text-gray-900">100% goes to the project. Always.</h3>
                <p className="mb-3 text-xs text-gray-500">
                    Every donation is peer-to-peer, with no fees and no middlemen.
                </p>
                <a href="#" className="text-xs font-medium text-[#fd67ac] hover:underline">
                    Learn about our zero-fee policy &gt;
                </a>
            </div>

            <button
                onClick={handleAddToCart}
                disabled={inCart}
                className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white transition-colors ${inCart
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-[#6200ea] hover:bg-[#4d00b8]'
                    }`}
            >
                {inCart ? (
                    <>
                        <span>Added to Cart</span>
                    </>
                ) : (
                    <>
                        <span className="text-lg">+</span>
                        Add To Cart
                    </>
                )}
            </button>

            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-gray-100 bg-white py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.59 13.51L15.42 17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15.41 6.51001L8.59 10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Share
            </button>
        </div>
    );
}
