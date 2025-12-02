'use client';

import { useCart } from '@/context/CartContext';
import { CheckCircledIcon, HeartIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React from 'react';

interface ProjectCardProps {
    id: string;
    title: string;
    image: string;
    raised: number;
    author: string;
    slug: string;
}

export function ProjectCard({ id, title, image, raised, author, slug }: ProjectCardProps) {
    const { addToCart, isInCart } = useCart();
    const inCart = isInCart(id);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to project page
        e.stopPropagation();
        addToCart({ id, title, slug, image });
    };

    return (
        <Link href={`/project/${slug}`} className="group relative flex flex-col overflow-hidden rounded-3xl bg-white transition-all hover:shadow-lg hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badges */}
                <div className="absolute left-3 top-3 flex flex-col gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#37b4a9] backdrop-blur-sm">
                        <CheckCircledIcon className="h-3 w-3" />
                        Verified
                    </span>
                </div>

                {/* Like Button */}
                <button className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-400 backdrop-blur-sm transition-colors hover:text-[#fd67ac]">
                    <HeartIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-1 line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-[#fd67ac]">
                    {title}
                </h3>
                <p className="mb-4 text-sm text-gray-500">by {author}</p>

                <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500">Raised</span>
                        <span className="text-sm font-bold text-gray-900">${raised.toLocaleString()}</span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={inCart}
                        className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${inCart
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-[#fd67ac] hover:text-white'
                            }`}
                    >
                        {inCart ? 'Added' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </Link>
    );
}
