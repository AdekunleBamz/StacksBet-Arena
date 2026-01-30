import React from 'react'
import { HiTrendingUp, HiTrendingDown, HiClock, HiCheckCircle, HiXCircle, HiExclamation } from 'react-icons/hi'

/**
 * Badge components for status indicators, labels, and tags
 */

// Base badge component
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  pulse = false,
  removable = false,
  onRemove,
  className = ''
}) => {
  const variants = {
    default: 'bg-gray-700/50 text-gray-300',
    primary: 'bg-arena-purple/20 text-arena-purple border border-arena-purple/30',
    success: 'bg-arena-green/20 text-arena-green border border-arena-green/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-arena-cyan/20 text-arena-cyan border border-arena-cyan/30',
    pink: 'bg-arena-pink/20 text-arena-pink border border-arena-pink/30'
  }

  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  const dotColors = {
    default: 'bg-gray-400',
    primary: 'bg-arena-purple',
    success: 'bg-arena-green',
    warning: 'bg-yellow-400',
    danger: 'bg-red-400',
    info: 'bg-arena-cyan',
    pink: 'bg-arena-pink'
  }

  return (
    <span 
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && (
        <span 
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} ${pulse ? 'animate-pulse' : ''}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-75 transition-opacity"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  )
}

// Market status badge
export const MarketStatusBadge = ({ status, size = 'md' }) => {
  const statusConfig = {
    active: { variant: 'success', icon: <HiCheckCircle className="w-3.5 h-3.5" />, label: 'Active', pulse: true },
    pending: { variant: 'warning', icon: <HiClock className="w-3.5 h-3.5" />, label: 'Pending' },
    ended: { variant: 'default', icon: <HiXCircle className="w-3.5 h-3.5" />, label: 'Ended' },
    resolved: { variant: 'info', icon: <HiCheckCircle className="w-3.5 h-3.5" />, label: 'Resolved' },
    disputed: { variant: 'danger', icon: <HiExclamation className="w-3.5 h-3.5" />, label: 'Disputed' }
  }

  const config = statusConfig[status] || statusConfig.pending
  
  return (
    <Badge variant={config.variant} icon={config.icon} size={size} dot={config.pulse}>
      {config.label}
    </Badge>
  )
}

// Outcome badge (Yes/No)
export const OutcomeBadge = ({ outcome, size = 'md' }) => {
  const isYes = outcome === 'yes' || outcome === true
  
  return (
    <Badge 
      variant={isYes ? 'success' : 'pink'} 
      size={size}
    >
      {isYes ? 'Yes' : 'No'}
    </Badge>
  )
}

// Trend badge
export const TrendBadge = ({ value, size = 'md', showValue = true }) => {
  const isPositive = value > 0
  const isNeutral = value === 0
  
  return (
    <Badge 
      variant={isNeutral ? 'default' : isPositive ? 'success' : 'danger'}
      icon={isPositive ? <HiTrendingUp className="w-3.5 h-3.5" /> : <HiTrendingDown className="w-3.5 h-3.5" />}
      size={size}
    >
      {showValue && `${isPositive ? '+' : ''}${value.toFixed(1)}%`}
    </Badge>
  )
}

// Category badge
export const CategoryBadge = ({ category, size = 'sm' }) => {
  const categoryEmojis = {
    Crypto: '₿',
    Sports: '⚽',
    Finance: '📈',
    Politics: '🏛️',
    Entertainment: '🎬',
    Technology: '💻',
    Other: '📌'
  }

  return (
    <Badge variant="default" size={size}>
      <span className="mr-1">{categoryEmojis[category] || '📌'}</span>
      {category}
    </Badge>
  )
}

// Network badge
export const NetworkBadge = ({ network = 'mainnet', size = 'sm' }) => {
  const isMainnet = network === 'mainnet'
  
  return (
    <Badge 
      variant={isMainnet ? 'success' : 'warning'} 
      size={size}
      dot
    >
      {isMainnet ? 'Mainnet' : 'Testnet'}
    </Badge>
  )
}

// New/Hot badge
export const NewBadge = ({ type = 'new', size = 'xs' }) => {
  const configs = {
    new: { variant: 'info', label: 'New', icon: '✨' },
    hot: { variant: 'danger', label: 'Hot', icon: '🔥' },
    trending: { variant: 'primary', label: 'Trending', icon: '📈' },
    featured: { variant: 'pink', label: 'Featured', icon: '⭐' }
  }
  
  const config = configs[type] || configs.new
  
  return (
    <Badge variant={config.variant} size={size}>
      {config.icon} {config.label}
    </Badge>
  )
}

// Rank badge
export const RankBadge = ({ rank, size = 'md' }) => {
  const getRankConfig = (rank) => {
    if (rank === 1) return { variant: 'warning', icon: '🥇', className: 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30' }
    if (rank === 2) return { variant: 'default', icon: '🥈', className: 'bg-gradient-to-r from-gray-400/30 to-gray-500/30' }
    if (rank === 3) return { variant: 'pink', icon: '🥉', className: 'bg-gradient-to-r from-amber-600/30 to-orange-600/30' }
    return { variant: 'default', icon: `#${rank}`, className: '' }
  }

  const config = getRankConfig(rank)

  return (
    <Badge variant={config.variant} size={size} className={config.className}>
      {typeof config.icon === 'string' && config.icon.startsWith('#') ? config.icon : config.icon}
    </Badge>
  )
}

// Count badge (notification style)
export const CountBadge = ({ count, max = 99, variant = 'danger', size = 'xs' }) => {
  if (!count || count <= 0) return null
  
  const displayCount = count > max ? `${max}+` : count

  return (
    <Badge variant={variant} size={size} className="min-w-[1.25rem] justify-center">
      {displayCount}
    </Badge>
  )
}

// Tag group
export const TagGroup = ({ tags = [], max = 5, onTagClick, onTagRemove }) => {
  const visibleTags = tags.slice(0, max)
  const remainingCount = tags.length - max

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleTags.map((tag, index) => (
        <Badge
          key={index}
          variant="default"
          size="sm"
          removable={!!onTagRemove}
          onRemove={() => onTagRemove?.(tag)}
          className={onTagClick ? 'cursor-pointer hover:bg-arena-purple/20' : ''}
          onClick={() => onTagClick?.(tag)}
        >
          {tag}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="default" size="sm">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  )
}

export default Badge
