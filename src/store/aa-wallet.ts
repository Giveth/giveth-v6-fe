'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * AA (Account Abstraction) Wallet Store
 *
 * Tracks whether the current user is using a Thirdweb in-app wallet
 * (email/Google sign-in) backed by a smart account, as opposed to
 * a traditional browser wallet (MetaMask, etc.).
 *
 * AA wallet users see a simplified "Donate with dollars" UI:
 * - USD balance display (USDC on Optimism behind the scenes)
 * - Deposit options (crypto or credit card)
 * - Simplified checkout (always USDC on Optimism)
 */

interface AAWalletState {
  /** Whether the connected wallet is an AA (in-app) wallet */
  isAAWallet: boolean
  /** Set the AA wallet flag */
  setIsAAWallet: (isAA: boolean) => void
  /** Whether the deposit modal is open */
  isDepositModalOpen: boolean
  /** Open/close the deposit modal */
  setDepositModalOpen: (open: boolean) => void
  /** Whether the sign-in modal is open */
  isSignInModalOpen: boolean
  /** Open/close the sign-in modal */
  setSignInModalOpen: (open: boolean) => void
  /** Reset all AA wallet state (on disconnect) */
  resetAAWallet: () => void
}

export const useAAWalletStore = create<AAWalletState>()(
  persist(
    set => ({
      isAAWallet: false,
      setIsAAWallet: (isAA: boolean) => set({ isAAWallet: isAA }),
      isDepositModalOpen: false,
      setDepositModalOpen: (open: boolean) => set({ isDepositModalOpen: open }),
      isSignInModalOpen: false,
      setSignInModalOpen: (open: boolean) => set({ isSignInModalOpen: open }),
      resetAAWallet: () =>
        set({
          isAAWallet: false,
          isDepositModalOpen: false,
          isSignInModalOpen: false,
        }),
    }),
    {
      name: 'giveth-aa-wallet',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Only persist isAAWallet, not modal states
      partialize: state => ({ isAAWallet: state.isAAWallet }),
    },
  ),
)
