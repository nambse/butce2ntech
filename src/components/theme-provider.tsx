"use client"

import { createContext, useContext, useEffect } from "react"
import { useAppSelector } from "@/store/hooks"

type Theme = 'light' | 'dark' | 'system'

const ThemeProviderContext = createContext({
  theme: 'system' as Theme,
})

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const theme = useAppSelector((state) => state.settings.settings.theme)

  useEffect(() => {
    const root = window.document.documentElement
    
    // Disable transitions before theme change
    root.classList.add('disable-transitions')
    
    // Change theme
    root.classList.remove('light', 'dark')
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    // Re-enable transitions after a small delay
    setTimeout(() => {
      root.classList.remove('disable-transitions')
    }, 0)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      const root = window.document.documentElement
      root.classList.add('disable-transitions')
      root.classList.remove('light', 'dark')
      root.classList.add(mediaQuery.matches ? 'dark' : 'light')
      setTimeout(() => {
        root.classList.remove('disable-transitions')
      }, 0)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <ThemeProviderContext.Provider value={{ theme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
} 