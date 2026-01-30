import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { HiSun, HiMoon, HiDesktopComputer } from 'react-icons/hi'

/**
 * Theme context and provider for dark/light mode support
 * Includes system preference detection and persistence
 */

const ThemeContext = createContext(undefined)

// Theme options
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  SYSTEM: 'system'
}

// Local storage key
const STORAGE_KEY = 'stacksbet-theme'

// Get system preference
const getSystemTheme = () => {
  if (typeof window === 'undefined') return THEMES.DARK
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT
}

// Theme Provider Component
export const ThemeProvider = ({ children, defaultTheme = THEMES.DARK }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return defaultTheme
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored || defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (theme === THEMES.SYSTEM) return getSystemTheme()
    return theme
  })

  // Apply theme to document
  const applyTheme = useCallback((newTheme) => {
    const root = document.documentElement
    const resolved = newTheme === THEMES.SYSTEM ? getSystemTheme() : newTheme

    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    root.style.colorScheme = resolved

    setResolvedTheme(resolved)
  }, [])

  // Update theme
  const updateTheme = useCallback((newTheme) => {
    setTheme(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
    applyTheme(newTheme)
  }, [applyTheme])

  // Toggle between dark and light
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
    updateTheme(newTheme)
  }, [resolvedTheme, updateTheme])

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (theme === THEMES.SYSTEM) {
        applyTheme(THEMES.SYSTEM)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, applyTheme])

  // Initial theme application
  useEffect(() => {
    applyTheme(theme)
  }, [])

  const value = {
    theme,
    resolvedTheme,
    setTheme: updateTheme,
    toggleTheme,
    isDark: resolvedTheme === THEMES.DARK,
    isLight: resolvedTheme === THEMES.LIGHT,
    isSystem: theme === THEMES.SYSTEM
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Simple toggle button
export const ThemeToggle = ({ className = '' }) => {
  const { toggleTheme, isDark } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl glass-card hover:bg-arena-purple/20 transition-all duration-300 ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <HiSun className="w-5 h-5 text-yellow-400 hover:rotate-180 transition-transform duration-500" />
      ) : (
        <HiMoon className="w-5 h-5 text-arena-purple hover:rotate-12 transition-transform duration-300" />
      )}
    </button>
  )
}

// Dropdown theme selector
export const ThemeSelector = ({ className = '' }) => {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const options = [
    { value: THEMES.LIGHT, label: 'Light', icon: HiSun },
    { value: THEMES.DARK, label: 'Dark', icon: HiMoon },
    { value: THEMES.SYSTEM, label: 'System', icon: HiDesktopComputer },
  ]

  const currentOption = options.find(o => o.value === theme)
  const CurrentIcon = currentOption?.icon || HiMoon

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card hover:bg-arena-purple/20 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <CurrentIcon className="w-5 h-5" />
        <span className="text-sm">{currentOption?.label}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div 
            className="absolute right-0 mt-2 w-40 py-1 glass-card rounded-xl shadow-xl z-20 animate-fade-in"
            role="listbox"
          >
            {options.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-arena-purple/20 transition-colors ${
                    theme === option.value ? 'text-arena-cyan' : 'text-gray-300'
                  }`}
                  role="option"
                  aria-selected={theme === option.value}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{option.label}</span>
                  {theme === option.value && (
                    <span className="ml-auto text-arena-green">✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// Animated theme switch with icons
export const AnimatedThemeSwitch = ({ className = '' }) => {
  const { toggleTheme, isDark } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
        isDark ? 'bg-arena-darker' : 'bg-blue-100'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background icons */}
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-yellow-500 opacity-30">
        <HiSun className="w-4 h-4" />
      </span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-300 opacity-30">
        <HiMoon className="w-4 h-4" />
      </span>

      {/* Toggle circle */}
      <span
        className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center ${
          isDark 
            ? 'left-9 bg-arena-purple' 
            : 'left-1 bg-yellow-400'
        }`}
      >
        {isDark ? (
          <HiMoon className="w-3 h-3 text-white" />
        ) : (
          <HiSun className="w-3 h-3 text-white" />
        )}
      </span>
    </button>
  )
}

export default { ThemeProvider, useTheme, ThemeToggle, ThemeSelector, AnimatedThemeSwitch, THEMES }
