import React, { useState, createContext, useContext, useRef, useEffect } from 'react'

/**
 * Tabs component system with multiple variants and animations
 */

const TabsContext = createContext({})

const Tabs = ({
  children,
  defaultValue,
  value: controlledValue,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = ''
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = controlledValue !== undefined ? controlledValue : internalValue
  
  const handleChange = (newValue) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange, variant, size, fullWidth }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

// Tabs List (container for tab triggers)
export const TabsList = ({ children, className = '' }) => {
  const { variant, fullWidth } = useContext(TabsContext)
  const [indicatorStyle, setIndicatorStyle] = useState({})
  const tabsRef = useRef(null)

  const variants = {
    default: 'bg-arena-card border border-gray-700/50 rounded-xl p-1',
    pills: 'bg-transparent gap-2',
    underline: 'border-b border-gray-700',
    cards: 'bg-transparent gap-1'
  }

  return (
    <div 
      ref={tabsRef}
      className={`
        relative flex
        ${variants[variant]}
        ${fullWidth ? 'w-full' : 'w-fit'}
        ${className}
      `}
      role="tablist"
    >
      {variant === 'underline' && (
        <div 
          className="absolute bottom-0 h-0.5 bg-arena-purple transition-all duration-300"
          style={indicatorStyle}
        />
      )}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            setIndicatorStyle: variant === 'underline' ? setIndicatorStyle : undefined
          })
        }
        return child
      })}
    </div>
  )
}

// Tab Trigger
export const TabTrigger = ({ 
  value, 
  children, 
  disabled = false, 
  icon,
  badge,
  setIndicatorStyle,
  className = '' 
}) => {
  const { value: selectedValue, onChange, variant, size, fullWidth } = useContext(TabsContext)
  const isSelected = value === selectedValue
  const triggerRef = useRef(null)

  // Update indicator for underline variant
  useEffect(() => {
    if (isSelected && setIndicatorStyle && triggerRef.current) {
      const { offsetLeft, offsetWidth } = triggerRef.current
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth })
    }
  }, [isSelected, setIndicatorStyle])

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  }

  const variantStyles = {
    default: `
      rounded-lg transition-all duration-200
      ${isSelected 
        ? 'bg-arena-purple text-white shadow-lg shadow-arena-purple/25' 
        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}
    `,
    pills: `
      rounded-xl border-2 transition-all duration-200
      ${isSelected 
        ? 'border-arena-purple bg-arena-purple/20 text-arena-purple' 
        : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700/50'}
    `,
    underline: `
      pb-3 transition-colors duration-200 relative
      ${isSelected 
        ? 'text-arena-purple' 
        : 'text-gray-400 hover:text-white'}
    `,
    cards: `
      rounded-xl border transition-all duration-200
      ${isSelected 
        ? 'border-arena-purple bg-arena-card text-white shadow-lg' 
        : 'border-transparent text-gray-400 hover:text-white hover:bg-arena-card/50'}
    `
  }

  return (
    <button
      ref={triggerRef}
      role="tab"
      aria-selected={isSelected}
      aria-controls={`panel-${value}`}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => onChange(value)}
      className={`
        flex items-center justify-center gap-2 font-medium
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizes[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'flex-1' : ''}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {badge !== undefined && (
        <span className={`
          px-1.5 py-0.5 text-xs rounded-full
          ${isSelected ? 'bg-white/20' : 'bg-gray-700'}
        `}>
          {badge}
        </span>
      )}
    </button>
  )
}

// Tab Panel
export const TabPanel = ({ value, children, className = '' }) => {
  const { value: selectedValue } = useContext(TabsContext)
  const isSelected = value === selectedValue

  if (!isSelected) return null

  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={value}
      className={`animate-fadeIn ${className}`}
    >
      {children}
    </div>
  )
}

// Scrollable Tab List (for many tabs)
export const ScrollableTabsList = ({ children, className = '' }) => {
  const scrollRef = useRef(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className={`relative ${className}`}>
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 
                     w-8 h-8 flex items-center justify-center
                     bg-gradient-to-r from-arena-dark to-transparent text-white"
          aria-label="Scroll left"
        >
          ‹
        </button>
      )}
      
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto scrollbar-hide"
      >
        {children}
      </div>
      
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 
                     w-8 h-8 flex items-center justify-center
                     bg-gradient-to-l from-arena-dark to-transparent text-white"
          aria-label="Scroll right"
        >
          ›
        </button>
      )}
    </div>
  )
}

// Vertical Tabs
export const VerticalTabs = ({
  children,
  defaultValue,
  value: controlledValue,
  onChange,
  className = ''
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = controlledValue !== undefined ? controlledValue : internalValue
  
  const handleChange = (newValue) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange, variant: 'vertical', size: 'md' }}>
      <div className={`flex gap-4 ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

// Vertical Tab List
export const VerticalTabsList = ({ children, className = '' }) => {
  return (
    <div 
      className={`flex flex-col gap-1 min-w-[200px] ${className}`}
      role="tablist"
      aria-orientation="vertical"
    >
      {children}
    </div>
  )
}

// Vertical Tab Trigger
export const VerticalTabTrigger = ({ 
  value, 
  children, 
  icon,
  description,
  className = '' 
}) => {
  const { value: selectedValue, onChange } = useContext(TabsContext)
  const isSelected = value === selectedValue

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      onClick={() => onChange(value)}
      className={`
        flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200
        ${isSelected 
          ? 'bg-arena-purple/20 border border-arena-purple/30 text-white' 
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white border border-transparent'}
        ${className}
      `}
    >
      {icon && (
        <span className={`flex-shrink-0 mt-0.5 ${isSelected ? 'text-arena-purple' : ''}`}>
          {icon}
        </span>
      )}
      <div>
        <div className="font-medium">{children}</div>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </button>
  )
}

// Vertical Tab Panel
export const VerticalTabPanel = ({ value, children, className = '' }) => {
  const { value: selectedValue } = useContext(TabsContext)
  
  if (value !== selectedValue) return null

  return (
    <div 
      className={`flex-1 animate-fadeIn ${className}`}
      role="tabpanel"
    >
      {children}
    </div>
  )
}

// CSS for animations (add to your global styles)
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default Tabs
