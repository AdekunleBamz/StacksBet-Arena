import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useRef, 
  createContext, 
  useContext 
} from 'react'

/**
 * Accessibility utilities and components for StacksBet Arena
 * WCAG 2.1 AA compliant components and hooks
 */

// ============================================
// CONTEXT & PROVIDER
// ============================================

const A11yContext = createContext(null)

export const A11yProvider = ({ children }) => {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState('normal')
  const [focusVisible, setFocusVisible] = useState(true)

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handler = (e) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Detect prefers-contrast
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)')
    setHighContrast(mediaQuery.matches)
    
    const handler = (e) => setHighContrast(e.matches)
    mediaQuery.addEventListener('change', handler)
    
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Handle keyboard navigation detection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') setFocusVisible(true)
    }
    
    const handleMouseDown = () => setFocusVisible(false)
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleMouseDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  const value = {
    reducedMotion,
    highContrast,
    fontSize,
    setFontSize,
    focusVisible
  }

  return (
    <A11yContext.Provider value={value}>
      {children}
    </A11yContext.Provider>
  )
}

export const useA11y = () => {
  const context = useContext(A11yContext)
  if (!context) {
    throw new Error('useA11y must be used within A11yProvider')
  }
  return context
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook for reduced motion preference
 */
export const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handler = (e) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return reducedMotion
}

/**
 * Hook for focus management
 */
export const useFocusManagement = () => {
  const firstFocusableRef = useRef(null)
  const lastFocusableRef = useRef(null)
  const previousActiveElement = useRef(null)

  const saveFocus = useCallback(() => {
    previousActiveElement.current = document.activeElement
  }, [])

  const restoreFocus = useCallback(() => {
    if (previousActiveElement.current) {
      previousActiveElement.current.focus()
    }
  }, [])

  const focusFirst = useCallback(() => {
    firstFocusableRef.current?.focus()
  }, [])

  const focusLast = useCallback(() => {
    lastFocusableRef.current?.focus()
  }, [])

  return {
    firstFocusableRef,
    lastFocusableRef,
    saveFocus,
    restoreFocus,
    focusFirst,
    focusLast
  }
}

/**
 * Hook for focus trap within a container
 */
export const useFocusTrap = (isActive = true) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    
    // Focus first element
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive])

  return containerRef
}

/**
 * Hook for announcements to screen readers
 */
export const useAnnounce = () => {
  const announce = useCallback((message, priority = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('role', 'status')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [])

  const announcePolite = useCallback((message) => {
    announce(message, 'polite')
  }, [announce])

  const announceAssertive = useCallback((message) => {
    announce(message, 'assertive')
  }, [announce])

  return { announce, announcePolite, announceAssertive }
}

/**
 * Hook for ARIA live regions
 */
export const useLiveRegion = (priority = 'polite') => {
  const [message, setMessage] = useState('')
  
  const announce = useCallback((newMessage) => {
    setMessage('')
    // Small delay to ensure screen readers pick up the change
    setTimeout(() => setMessage(newMessage), 100)
  }, [])

  const LiveRegion = useCallback(() => (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  ), [message, priority])

  return { announce, LiveRegion, message }
}

/**
 * Hook for escape key handling
 */
export const useEscapeKey = (handler, isActive = true) => {
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handler(e)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handler, isActive])
}

/**
 * Hook for click outside detection
 */
export const useClickOutside = (handler, isActive = true) => {
  const ref = useRef(null)

  useEffect(() => {
    if (!isActive) return

    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        handler(e)
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [handler, isActive])

  return ref
}

/**
 * Hook for roving tabindex
 */
export const useRovingTabindex = (items, options = {}) => {
  const { orientation = 'horizontal', wrap = true } = options
  const [activeIndex, setActiveIndex] = useState(0)
  const itemRefs = useRef([])

  const handleKeyDown = useCallback((e, index) => {
    const isHorizontal = orientation === 'horizontal'
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp'
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown'

    let newIndex = index

    if (e.key === prevKey) {
      e.preventDefault()
      newIndex = index - 1
      if (newIndex < 0) {
        newIndex = wrap ? items.length - 1 : 0
      }
    } else if (e.key === nextKey) {
      e.preventDefault()
      newIndex = index + 1
      if (newIndex >= items.length) {
        newIndex = wrap ? 0 : items.length - 1
      }
    } else if (e.key === 'Home') {
      e.preventDefault()
      newIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      newIndex = items.length - 1
    }

    if (newIndex !== index) {
      setActiveIndex(newIndex)
      itemRefs.current[newIndex]?.focus()
    }
  }, [items.length, orientation, wrap])

  const getItemProps = useCallback((index) => ({
    ref: (el) => { itemRefs.current[index] = el },
    tabIndex: index === activeIndex ? 0 : -1,
    onKeyDown: (e) => handleKeyDown(e, index),
    onFocus: () => setActiveIndex(index)
  }), [activeIndex, handleKeyDown])

  return { activeIndex, setActiveIndex, getItemProps }
}

// ============================================
// COMPONENTS
// ============================================

/**
 * Screen reader only text
 */
export const ScreenReaderOnly = ({ children, as: Component = 'span' }) => (
  <Component className="sr-only">
    {children}
  </Component>
)

/**
 * Skip to main content link
 */
export const SkipLink = ({ 
  href = '#main', 
  children = 'Skip to main content' 
}) => (
  <a
    href={href}
    className="
      sr-only focus:not-sr-only
      focus:fixed focus:top-4 focus:left-4 focus:z-50
      focus:px-4 focus:py-2 focus:bg-purple-500 focus:text-white
      focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white
    "
  >
    {children}
  </a>
)

/**
 * Live region component
 */
export const LiveRegion = ({ 
  message, 
  priority = 'polite',
  atomic = true 
}) => (
  <div
    role="status"
    aria-live={priority}
    aria-atomic={atomic}
    className="sr-only"
  >
    {message}
  </div>
)

/**
 * Accessible loading indicator
 */
export const AccessibleLoading = ({ 
  isLoading, 
  loadingText = 'Loading...',
  children 
}) => {
  const { announce } = useAnnounce()

  useEffect(() => {
    if (isLoading) {
      announce(loadingText, 'polite')
    }
  }, [isLoading, loadingText, announce])

  if (isLoading) {
    return (
      <div role="status" aria-label={loadingText}>
        <span className="sr-only">{loadingText}</span>
        {/* Visual loading indicator */}
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  return children
}

/**
 * Accessible icon button
 */
export const IconButton = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const variants = {
    default: 'bg-slate-800 hover:bg-slate-700 text-slate-300',
    primary: 'bg-purple-500 hover:bg-purple-600 text-white',
    ghost: 'hover:bg-slate-700/50 text-slate-400'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        rounded-lg transition-colors
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizes[size]}
        ${variants[variant]}
        ${className}
      `}
    >
      <Icon className={iconSizes[size]} aria-hidden="true" />
    </button>
  )
}

/**
 * Accessible modal/dialog
 */
export const AccessibleDialog = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  initialFocus
}) => {
  const containerRef = useFocusTrap(isOpen)
  const previousActiveElement = useRef(null)

  // Save and restore focus
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus()
    }
  }, [isOpen])

  // Handle escape
  useEscapeKey(onClose, isOpen)

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={description ? 'dialog-description' : undefined}
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dialog content */}
      <div className="relative bg-slate-800 rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
        <h2 id="dialog-title" className="text-xl font-bold text-white mb-2">
          {title}
        </h2>
        
        {description && (
          <p id="dialog-description" className="text-slate-400 mb-4">
            {description}
          </p>
        )}
        
        {children}
      </div>
    </div>
  )
}

/**
 * Accessible tabs
 */
export const AccessibleTabs = ({ tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const { getItemProps } = useRovingTabindex(tabs)

  return (
    <div>
      {/* Tab list */}
      <div role="tablist" className="flex border-b border-slate-700">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={index === activeTab}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(index)}
            {...getItemProps(index)}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset
              ${index === activeTab
                ? 'text-purple-400 border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-white'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={index !== activeTab}
          tabIndex={0}
          className="py-4 focus:outline-none"
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}

/**
 * Accessible tooltip
 */
export const AccessibleTooltip = ({ 
  content, 
  children,
  id 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipId = id || `tooltip-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-describedby={isVisible ? tooltipId : undefined}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className="
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            px-3 py-1.5 bg-slate-900 text-white text-sm
            rounded-lg shadow-lg whitespace-nowrap z-50
          "
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  )
}

/**
 * Accessible progress bar
 */
export const AccessibleProgress = ({
  value,
  max = 100,
  label,
  showValue = true,
  className = ''
}) => {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm text-slate-300">{label}</span>
          {showValue && (
            <span className="text-sm text-slate-400">{percentage}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${percentage}%`}
        className="h-2 bg-slate-700 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-purple-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Accessible form field
 */
export const AccessibleField = ({
  id,
  label,
  error,
  hint,
  required,
  children
}) => {
  const inputId = id || `field-${Math.random().toString(36).substr(2, 9)}`
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className="space-y-1.5">
      <label 
        htmlFor={inputId} 
        className="block text-sm font-medium text-slate-300"
      >
        {label}
        {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
        {required && <span className="sr-only">(required)</span>}
      </label>
      
      {React.cloneElement(children, {
        id: inputId,
        'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? 'true' : undefined,
        'aria-required': required
      })}
      
      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

// ============================================
// UTILITIES
// ============================================

/**
 * Generate unique ID for accessibility
 */
export const generateId = (prefix = 'a11y') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if element is focusable
 */
export const isFocusable = (element) => {
  if (!element) return false
  
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ]
  
  return element.matches(focusableSelectors.join(', '))
}

/**
 * Get all focusable elements within container
 */
export const getFocusableElements = (container) => {
  if (!container) return []
  
  return Array.from(container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )).filter(el => !el.disabled && el.offsetParent !== null)
}

/**
 * Color contrast checker (WCAG AA minimum 4.5:1 for normal text)
 */
export const checkContrast = (foreground, background) => {
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) / 255
    const g = ((rgb >> 8) & 0xff) / 255
    const b = (rgb & 0xff) / 255
    
    const adjustedR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
    const adjustedG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
    const adjustedB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)
    
    return 0.2126 * adjustedR + 0.7152 * adjustedG + 0.0722 * adjustedB
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

  return {
    ratio: ratio.toFixed(2),
    passesAA: ratio >= 4.5,
    passesAALarge: ratio >= 3,
    passesAAA: ratio >= 7
  }
}

// CSS for sr-only class (add to global styles)
export const srOnlyStyles = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`

export default {
  // Context
  A11yProvider,
  useA11y,
  // Hooks
  useReducedMotion,
  useFocusManagement,
  useFocusTrap,
  useAnnounce,
  useLiveRegion,
  useEscapeKey,
  useClickOutside,
  useRovingTabindex,
  // Components
  ScreenReaderOnly,
  SkipLink,
  LiveRegion,
  AccessibleLoading,
  IconButton,
  AccessibleDialog,
  AccessibleTabs,
  AccessibleTooltip,
  AccessibleProgress,
  AccessibleField,
  // Utilities
  generateId,
  isFocusable,
  getFocusableElements,
  checkContrast,
  srOnlyStyles
}
