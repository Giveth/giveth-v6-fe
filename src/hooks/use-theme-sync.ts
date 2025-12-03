'use client'

import { useEffect } from 'react'
import { usePreferencesStore } from '@/store/preferences'

const prefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches

export function useThemeSync() {
  const mode = usePreferencesStore(state => state.theme)

  useEffect(() => {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const applyTheme = () => {
      const resolved =
        mode === 'system' ? (prefersDark() ? 'dark' : 'light') : mode
      root.dataset.theme = resolved
    }

    applyTheme()

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme()
      mediaQuery.addEventListener('change', handler)
      return () => {
        mediaQuery.removeEventListener('change', handler)
      }
    }
    return undefined
  }, [mode])
}
