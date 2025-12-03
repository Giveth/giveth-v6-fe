'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type ThemePreference = 'system' | 'light' | 'dark'

interface PreferencesState {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    set => ({
      theme: 'system',
      setTheme: theme => set({ theme }),
    }),
    {
      name: 'giveth-preferences',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
