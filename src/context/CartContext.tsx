'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { type WalletTokenWithBalance } from '@/lib/types/chain'

export interface Project {
  id: string
  title: string
  slug: string
  image?: string | null
  roundId?: number
  roundName?: string
  selectedToken: WalletTokenWithBalance | undefined
  // Donation details
  walletAddress?: string // Project's receiving wallet address
  donationAmount?: string // Amount to donate
  tokenSymbol?: string // Token symbol (e.g., 'USDT', 'USDC')
  tokenDecimals?: number // Token decimals
  tokenAddress?: string // Token contract address
  chainId?: number // Chain ID for the donation
}

export interface DonationRound {
  roundId: number
  roundName: string
  selectedChainId: number
  selectedToken: WalletTokenWithBalance | undefined
  tokenSymbol: string
  tokenAddress: string
  tokenDecimals: number
  projects: Project[]
  totalAmount: string
  totalUsdValue: string
}

interface CartContextType {
  cartItems: Project[]
  donationRounds: DonationRound[]
  addToCart: (project: Project) => void
  updateSelectedChainId: (roundId: number, chainId: number) => void
  updateSelectedToken: (
    roundId: number,
    selectedToken: WalletTokenWithBalance,
    tokenSymbol: string,
    tokenAddress: string,
    tokenDecimals: number,
  ) => void
  removeFromCart: (projectId: string) => void
  clearCart: () => void
  isInCart: (projectId: string) => boolean
  updateProjectDonation: (
    projectId: string,
    amount: string,
    tokenSymbol: string,
    tokenAddress: string,
    chainId: number,
  ) => void
  getDonationsByChain: (chainId: number) => Project[]
  getTotalDonationForRound: (roundId: number) => string
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<Project[]>([])
  const [donationRounds, setDonationRounds] = useState<DonationRound[]>([])

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('giveth_cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Failed to parse cart from local storage', e)
      }
    }
  }, [])

  // Save to local storage whenever cart changes
  useEffect(() => {
    localStorage.setItem('giveth_cart', JSON.stringify(cartItems))
  }, [cartItems])

  // Group projects by rounds whenever cart changes
  useEffect(() => {
    const rounds = new Map<number, DonationRound>()

    cartItems.forEach(item => {
      if (
        item.roundId &&
        item.roundName &&
        item.chainId &&
        item.tokenSymbol &&
        item.tokenAddress
      ) {
        if (!rounds.has(item.roundId)) {
          rounds.set(item.roundId, {
            roundId: item.roundId,
            roundName: item.roundName,
            selectedChainId: 0,
            selectedToken: undefined,
            tokenSymbol: item.tokenSymbol,
            tokenAddress: item.tokenAddress,
            tokenDecimals: item.tokenDecimals ?? 18,
            projects: [],
            totalAmount: '0',
            totalUsdValue: '0',
          })
        }

        const round = rounds.get(item.roundId)!
        round.projects.push(item)

        // Calculate total amount
        const total = round.projects.reduce((sum, project) => {
          const amount = parseFloat(project.donationAmount || '0')
          return sum + amount
        }, 0)
        round.totalAmount = total.toString()
      }
    })

    setDonationRounds(Array.from(rounds.values()))
  }, [cartItems])

  const addToCart = (project: Project) => {
    setCartItems(prev => {
      if (prev.some(item => item.id === project.id)) return prev
      return [...prev, project]
    })
  }

  const updateSelectedChainId = (roundId: number, chainId: number) => {
    // Persist selection on cart items so any grouping helpers derived from cartItems
    // can reflect the selected chain immediately.
    setCartItems(prev =>
      prev.map(item =>
        item.roundId === roundId ? { ...item, chainId } : item,
      ),
    )

    // Also update derived donationRounds for immediate UI consistency.
    setDonationRounds(prev =>
      prev.map(round =>
        round.roundId === roundId
          ? { ...round, selectedChainId: chainId }
          : round,
      ),
    )
  }

  const updateSelectedToken = (
    roundId: number,
    selectedToken: WalletTokenWithBalance,
    tokenSymbol: string,
    tokenAddress: string,
    tokenDecimals: number,
  ) => {
    setCartItems(prev =>
      prev.map(item =>
        item.roundId === roundId
          ? { ...item, selectedToken, tokenSymbol, tokenAddress, tokenDecimals }
          : item,
      ),
    )
    setDonationRounds(prev =>
      prev.map(round =>
        round.roundId === roundId
          ? {
              ...round,
              selectedToken,
              tokenSymbol,
              tokenAddress,
              tokenDecimals,
            }
          : round,
      ),
    )
  }

  const removeFromCart = (projectId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== projectId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const isInCart = (projectId: string) => {
    return cartItems.some(item => item.id === projectId)
  }

  const updateProjectDonation = (
    projectId: string,
    amount: string,
    tokenSymbol: string,
    tokenAddress: string,
    chainId: number,
  ) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === projectId
          ? {
              ...item,
              donationAmount: amount,
              tokenSymbol,
              tokenAddress,
              chainId,
            }
          : item,
      ),
    )
  }

  const getDonationsByChain = (chainId: number) => {
    return cartItems.filter(item => item.chainId === chainId)
  }

  const getTotalDonationForRound = (roundId: number) => {
    const round = donationRounds.find(r => r.roundId === roundId)
    return round?.totalAmount || '0'
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        donationRounds,
        addToCart,
        updateSelectedChainId,
        updateSelectedToken,
        removeFromCart,
        clearCart,
        isInCart,
        updateProjectDonation,
        getDonationsByChain,
        getTotalDonationForRound,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
