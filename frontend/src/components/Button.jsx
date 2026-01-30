import React, { forwardRef } from 'react'
import { ImSpinner8 } from 'react-icons/im'

/**
 * Comprehensive Button component with multiple variants, sizes, and states
 */

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  as: Component = 'button',
  className = '',
  ...props
}, ref) => {
  // Base styles
  const baseStyles = `
    relative inline-flex items-center justify-center font-semibold rounded-xl
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-arena-dark
    disabled:opacity-50 disabled:cursor-not-allowed
    transform active:scale-[0.98]
  `

  // Variant styles
  const variants = {
    primary: `
      bg-gradient-to-r from-arena-purple via-arena-pink to-arena-cyan
      text-white shadow-lg shadow-arena-purple/25
      hover:shadow-xl hover:shadow-arena-purple/40
      focus:ring-arena-purple
      before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r
      before:from-arena-purple before:via-arena-pink before:to-arena-cyan
      before:opacity-0 before:transition-opacity before:duration-300
      hover:before:opacity-100
    `,
    secondary: `
      bg-arena-card border border-arena-purple/30 text-white
      hover:bg-arena-purple/20 hover:border-arena-purple/60
      focus:ring-arena-purple
    `,
    outline: `
      bg-transparent border-2 border-arena-purple text-arena-purple
      hover:bg-arena-purple hover:text-white
      focus:ring-arena-purple
    `,
    ghost: `
      bg-transparent text-gray-300
      hover:bg-gray-700/50 hover:text-white
      focus:ring-gray-500
    `,
    success: `
      bg-arena-green/20 border border-arena-green/30 text-arena-green
      hover:bg-arena-green hover:text-white
      focus:ring-arena-green
    `,
    danger: `
      bg-red-500/20 border border-red-500/30 text-red-400
      hover:bg-red-500 hover:text-white
      focus:ring-red-500
    `,
    warning: `
      bg-yellow-500/20 border border-yellow-500/30 text-yellow-400
      hover:bg-yellow-500 hover:text-black
      focus:ring-yellow-500
    `,
    gradient: `
      bg-gradient-to-r from-arena-purple to-arena-pink text-white
      shadow-lg shadow-arena-pink/25
      hover:shadow-xl hover:shadow-arena-pink/40 hover:brightness-110
      focus:ring-arena-pink
    `
  }

  // Size styles
  const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
    xl: 'px-6 py-3 text-lg gap-2.5',
    '2xl': 'px-8 py-4 text-xl gap-3'
  }

  // Icon sizes
  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-5 h-5',
    '2xl': 'w-6 h-6'
  }

  const isDisabled = disabled || loading

  return (
    <Component
      ref={ref}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <ImSpinner8 className={`animate-spin ${iconSizes[size]}`} />
      )}
      
      {/* Left icon */}
      {!loading && leftIcon && (
        <span className={`flex-shrink-0 ${iconSizes[size]}`}>
          {leftIcon}
        </span>
      )}
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
      
      {/* Right icon */}
      {rightIcon && (
        <span className={`flex-shrink-0 ${iconSizes[size]}`}>
          {rightIcon}
        </span>
      )}
    </Component>
  )
})

Button.displayName = 'Button'

// Icon-only button variant
export const IconButton = forwardRef(({
  icon,
  variant = 'ghost',
  size = 'md',
  label,
  className = '',
  ...props
}, ref) => {
  const sizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3'
  }

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7'
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      className={`${sizes[size]} !rounded-lg ${className}`}
      aria-label={label}
      {...props}
    >
      <span className={iconSizes[size]}>{icon}</span>
    </Button>
  )
})

IconButton.displayName = 'IconButton'

// Button group for connected buttons
export const ButtonGroup = ({ children, className = '' }) => {
  return (
    <div 
      className={`inline-flex rounded-xl overflow-hidden ${className}`}
      role="group"
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null
        
        return React.cloneElement(child, {
          className: `
            ${child.props.className || ''}
            ${index === 0 ? 'rounded-r-none' : ''}
            ${index === React.Children.count(children) - 1 ? 'rounded-l-none' : ''}
            ${index > 0 && index < React.Children.count(children) - 1 ? 'rounded-none' : ''}
            ${index > 0 ? 'border-l-0' : ''}
          `
        })
      })}
    </div>
  )
}

// Connect wallet button (specialized)
export const ConnectWalletButton = ({ 
  connected = false, 
  address,
  onConnect,
  onDisconnect,
  loading = false,
  ...props 
}) => {
  const truncateAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (connected && address) {
    return (
      <Button
        variant="secondary"
        onClick={onDisconnect}
        leftIcon={
          <span className="w-2 h-2 rounded-full bg-arena-green animate-pulse" />
        }
        {...props}
      >
        {truncateAddress(address)}
      </Button>
    )
  }

  return (
    <Button
      variant="primary"
      onClick={onConnect}
      loading={loading}
      {...props}
    >
      Connect Wallet
    </Button>
  )
}

// Bet buttons (Yes/No)
export const BetButton = ({ outcome, onClick, disabled, loading, ...props }) => {
  const isYes = outcome === 'yes'
  
  return (
    <Button
      variant={isYes ? 'success' : 'danger'}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      className={`
        ${isYes ? 'hover:bg-arena-green' : 'hover:bg-arena-pink'}
        min-w-[100px]
      `}
      {...props}
    >
      Bet {isYes ? 'Yes' : 'No'}
    </Button>
  )
}

// Social share button
export const ShareButton = ({ platform, url, text, className = '' }) => {
  const platforms = {
    twitter: {
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      label: 'Share on Twitter',
      icon: '𝕏'
    },
    farcaster: {
      href: `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`,
      label: 'Share on Farcaster',
      icon: '🟣'
    }
  }

  const config = platforms[platform]
  if (!config) return null

  return (
    <Button
      as="a"
      href={config.href}
      target="_blank"
      rel="noopener noreferrer"
      variant="ghost"
      size="sm"
      aria-label={config.label}
      className={className}
    >
      {config.icon}
    </Button>
  )
}

export default Button
