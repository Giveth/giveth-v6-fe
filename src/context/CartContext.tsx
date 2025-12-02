'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Project {
    id: string;
    title: string;
    slug: string;
    image: string;
}

interface CartContextType {
    cartItems: Project[];
    addToCart: (project: Project) => void;
    removeFromCart: (projectId: string) => void;
    clearCart: () => void;
    isInCart: (projectId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<Project[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('giveth_cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart from local storage', e);
            }
        }
    }, []);

    // Save to local storage whenever cart changes
    useEffect(() => {
        localStorage.setItem('giveth_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (project: Project) => {
        setCartItems((prev) => {
            if (prev.some((item) => item.id === project.id)) return prev;
            return [...prev, project];
        });
    };

    const removeFromCart = (projectId: string) => {
        setCartItems((prev) => prev.filter((item) => item.id !== projectId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const isInCart = (projectId: string) => {
        return cartItems.some((item) => item.id === projectId);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, isInCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
