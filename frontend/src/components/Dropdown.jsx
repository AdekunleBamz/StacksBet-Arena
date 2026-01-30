import React, { useState, useRef, useEffect, createContext, useContext } from 'react'
import { HiChevronDown, HiCheck } from 'react-icons/hi'

/**
 * Dropdown component system with accessibility and animations
 */

const DropdownContext = createContext({})

const Dropdown = ({
  children,
  trigger,
  align = 'left',
  side = 'bottom',
  closeOnSelect = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const triggerRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2'
  }

  const sides = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2'
  }

  const handleSelect = () => {
    if (closeOnSelect) {
      setIsOpen(false)
    }
  }

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, onSelect: handleSelect }}>
      <div ref={dropdownRef} className={`relative inline-block ${className}`}>
        {/* Trigger */}
        <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
          {trigger}
        </div>

        {/* Content */}
        {isOpen && (
          <div
            className={`
              absolute z-50 min-w-[200px]
              bg-arena-card border border-gray-700 rounded-xl shadow-2xl
              animate-dropdown overflow-hidden
              ${alignments[align]}
              ${sides[side]}
            `}
            role="menu"
          >
            {children}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  )
}

// Dropdown Trigger Button
export const DropdownTrigger = ({
  children,
  variant = 'default',
  size = 'md',
  showChevron = true,
  className = ''
}) => {
  const { isOpen } = useContext(DropdownContext)

  const variants = {
    default: 'bg-arena-card border border-gray-700 hover:border-arena-purple/50',
    ghost: 'hover:bg-gray-700/50',
    outline: 'border border-gray-600 hover:border-arena-purple'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  }

  return (
    <button
      className={`
        inline-flex items-center gap-2 font-medium text-white
        rounded-xl transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-arena-purple/50
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      aria-haspopup="menu"
      aria-expanded={isOpen}
    >
      {children}
      {showChevron && (
        <HiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      )}
    </button>
  )
}

// Dropdown Menu Section
export const DropdownSection = ({ children, title, className = '' }) => {
  return (
    <div className={className}>
      {title && (
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </div>
      )}
      {children}
    </div>
  )
}

// Dropdown Menu Item
export const DropdownItem = ({
  children,
  icon,
  rightIcon,
  selected = false,
  disabled = false,
  danger = false,
  onClick,
  className = ''
}) => {
  const { onSelect } = useContext(DropdownContext)

  const handleClick = () => {
    if (!disabled) {
      onClick?.()
      onSelect()
    }
  }

  return (
    <button
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2 text-left
        transition-colors duration-150
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-gray-700/50 cursor-pointer'}
        ${danger && !disabled
          ? 'text-red-400 hover:bg-red-500/10' 
          : 'text-white'}
        ${selected ? 'bg-arena-purple/20' : ''}
        ${className}
      `}
    >
      {icon && (
        <span className={`flex-shrink-0 ${danger ? 'text-red-400' : 'text-gray-400'}`}>
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{children}</span>
      {selected && <HiCheck className="w-4 h-4 text-arena-purple flex-shrink-0" />}
      {rightIcon && !selected && (
        <span className="flex-shrink-0 text-gray-400">{rightIcon}</span>
      )}
    </button>
  )
}

// Dropdown Divider
export const DropdownDivider = ({ className = '' }) => {
  return <div className={`h-px bg-gray-700 my-1 ${className}`} role="separator" />
}

// Dropdown Header
export const DropdownHeader = ({ children, className = '' }) => {
  return (
    <div className={`px-3 py-3 border-b border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

// Dropdown Footer
export const DropdownFooter = ({ children, className = '' }) => {
  return (
    <div className={`px-3 py-3 border-t border-gray-700 bg-gray-800/50 ${className}`}>
      {children}
    </div>
  )
}

// Select Dropdown (single selection)
export const SelectDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  label,
  error,
  disabled = false,
  className = ''
}) => {
  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      
      <Dropdown
        trigger={
          <DropdownTrigger
            variant={error ? 'outline' : 'default'}
            className={`w-full justify-between ${error ? 'border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={selectedOption ? 'text-white' : 'text-gray-400'}>
              {selectedOption?.label || placeholder}
            </span>
          </DropdownTrigger>
        }
      >
        <div className="max-h-60 overflow-y-auto py-1">
          {options.map((option) => (
            <DropdownItem
              key={option.value}
              selected={option.value === value}
              disabled={option.disabled}
              onClick={() => onChange(option.value)}
            >
              {option.icon && <span className="mr-2">{option.icon}</span>}
              {option.label}
            </DropdownItem>
          ))}
        </div>
      </Dropdown>
      
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

// Multi-Select Dropdown
export const MultiSelectDropdown = ({
  values = [],
  onChange,
  options = [],
  placeholder = 'Select options',
  label,
  max,
  className = ''
}) => {
  const selectedLabels = options
    .filter(opt => values.includes(opt.value))
    .map(opt => opt.label)
    .join(', ')

  const handleToggle = (optionValue) => {
    if (values.includes(optionValue)) {
      onChange(values.filter(v => v !== optionValue))
    } else if (!max || values.length < max) {
      onChange([...values, optionValue])
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      
      <Dropdown
        closeOnSelect={false}
        trigger={
          <DropdownTrigger className="w-full justify-between">
            <span className={selectedLabels ? 'text-white truncate' : 'text-gray-400'}>
              {selectedLabels || placeholder}
            </span>
          </DropdownTrigger>
        }
      >
        <div className="max-h-60 overflow-y-auto py-1">
          {options.map((option) => (
            <DropdownItem
              key={option.value}
              selected={values.includes(option.value)}
              disabled={option.disabled || (max && values.length >= max && !values.includes(option.value))}
              onClick={() => handleToggle(option.value)}
            >
              {option.label}
            </DropdownItem>
          ))}
        </div>
        {max && (
          <DropdownFooter>
            <p className="text-xs text-gray-400">
              {values.length}/{max} selected
            </p>
          </DropdownFooter>
        )}
      </Dropdown>
    </div>
  )
}

// User Menu Dropdown
export const UserDropdown = ({
  user,
  onProfile,
  onSettings,
  onDisconnect,
  className = ''
}) => {
  const truncateAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <Dropdown
      align="right"
      trigger={
        <button className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-700/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-arena-purple to-arena-pink
                          flex items-center justify-center text-white font-bold text-sm">
            {user.avatar || user.address?.slice(0, 2).toUpperCase()}
          </div>
          <HiChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      }
      className={className}
    >
      <DropdownHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-arena-purple to-arena-pink
                          flex items-center justify-center text-white font-bold">
            {user.avatar || user.address?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-white">
              {user.name || truncateAddress(user.address)}
            </p>
            {user.balance !== undefined && (
              <p className="text-sm text-gray-400">{user.balance} STX</p>
            )}
          </div>
        </div>
      </DropdownHeader>
      
      <DropdownSection>
        <DropdownItem icon="👤" onClick={onProfile}>
          Profile
        </DropdownItem>
        <DropdownItem icon="⚙️" onClick={onSettings}>
          Settings
        </DropdownItem>
      </DropdownSection>
      
      <DropdownDivider />
      
      <DropdownSection>
        <DropdownItem danger icon="🚪" onClick={onDisconnect}>
          Disconnect
        </DropdownItem>
      </DropdownSection>
    </Dropdown>
  )
}

// Network Switcher Dropdown
export const NetworkDropdown = ({
  network,
  onNetworkChange,
  className = ''
}) => {
  const networks = [
    { value: 'mainnet', label: 'Stacks Mainnet', icon: '🟢' },
    { value: 'testnet', label: 'Stacks Testnet', icon: '🟡' }
  ]

  const currentNetwork = networks.find(n => n.value === network)

  return (
    <Dropdown
      trigger={
        <DropdownTrigger variant="ghost" size="sm">
          <span>{currentNetwork?.icon}</span>
          <span className="hidden sm:inline">{currentNetwork?.label}</span>
        </DropdownTrigger>
      }
      className={className}
    >
      <DropdownSection title="Select Network">
        {networks.map((net) => (
          <DropdownItem
            key={net.value}
            selected={net.value === network}
            onClick={() => onNetworkChange(net.value)}
            icon={net.icon}
          >
            {net.label}
          </DropdownItem>
        ))}
      </DropdownSection>
    </Dropdown>
  )
}

// Add animation styles
const styles = `
  @keyframes dropdown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-dropdown {
    animation: dropdown 0.15s ease-out;
  }
`

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}

export default Dropdown
