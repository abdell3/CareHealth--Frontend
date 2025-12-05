import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authStore } from '@/store/auth.store'
import { getThemeForRole, type ThemeConfig, type UserRole } from '../themes'

interface ThemeContextValue {
  theme: ThemeConfig
  role: UserRole | null
  setTheme?: (theme: ThemeConfig) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  overrideRole?: UserRole
}

export const ThemeProvider = ({ children, overrideRole }: ThemeProviderProps) => {
  // Access user directly from store instead of useAuth to avoid Router dependency
  const user = authStore((state) => state.user)
  const [customTheme, setCustomTheme] = useState<ThemeConfig | null>(null)

  const role = overrideRole || user?.role || 'patient'
  const defaultTheme = getThemeForRole(role)
  const theme = customTheme || defaultTheme

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--theme-primary', theme.primary)
    root.style.setProperty('--theme-secondary', theme.secondary)
    root.style.setProperty('--theme-accent', theme.accent)
  }, [theme])

  // Load custom theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('carehealth-custom-theme')
    if (savedTheme) {
      try {
        setCustomTheme(JSON.parse(savedTheme))
      } catch {
        // Invalid theme, ignore
      }
    }
  }, [])

  const handleSetTheme = (newTheme: ThemeConfig) => {
    setCustomTheme(newTheme)
    localStorage.setItem('carehealth-custom-theme', JSON.stringify(newTheme))
  }

  return (
    <ThemeContext.Provider value={{ theme, role, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

