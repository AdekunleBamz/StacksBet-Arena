import React, { useState, useMemo } from 'react'

/**
 * Avatar component for displaying user identities
 * Supports images, initials, and blockchain address-based avatars
 */

// Generate a color from an address/string
const stringToColor = (str) => {
  if (!str) return '#8B5CF6' // Default arena purple
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const colors = [
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#10B981', // Green
    '#06B6D4', // Cyan
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
  ]
  
  return colors[Math.abs(hash) % colors.length]
}

// Generate initials from address
const getInitials = (address) => {
  if (!address) return '?'
  // For Stacks addresses, use first 2 chars after 'SP' or 'ST'
  if (address.startsWith('SP') || address.startsWith('ST')) {
    return address.slice(2, 4).toUpperCase()
  }
  return address.slice(0, 2).toUpperCase()
}

// Generate blocky avatar pattern from address
const generateBlockyPattern = (address) => {
  if (!address) return []
  
  const pattern = []
  for (let i = 0; i < 5; i++) {
    const row = []
    for (let j = 0; j < 5; j++) {
      // Mirror horizontally for symmetric look
      const idx = i * 3 + Math.min(j, 4 - j)
      const charCode = address.charCodeAt(idx % address.length) || 0
      row.push(charCode % 2 === 0)
    }
    pattern.push(row)
  }
  return pattern
}

// Main Avatar component
const Avatar = ({
  address,
  src,
  alt,
  name,
  size = 'md',
  variant = 'initials', // 'initials' | 'blocky' | 'gradient' | 'image'
  status, // 'online' | 'offline' | 'away'
  showBorder = false,
  onClick,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false)
  
  const sizes = {
    xs: { container: 'w-6 h-6', text: 'text-xs', status: 'w-1.5 h-1.5' },
    sm: { container: 'w-8 h-8', text: 'text-sm', status: 'w-2 h-2' },
    md: { container: 'w-10 h-10', text: 'text-base', status: 'w-2.5 h-2.5' },
    lg: { container: 'w-12 h-12', text: 'text-lg', status: 'w-3 h-3' },
    xl: { container: 'w-16 h-16', text: 'text-xl', status: 'w-3.5 h-3.5' },
    '2xl': { container: 'w-20 h-20', text: 'text-2xl', status: 'w-4 h-4' },
  }

  const statusColors = {
    online: 'bg-arena-green',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500'
  }

  const { container, text, status: statusSize } = sizes[size]
  const bgColor = useMemo(() => stringToColor(address || name), [address, name])
  const initials = useMemo(() => name ? name.slice(0, 2).toUpperCase() : getInitials(address), [name, address])
  const pattern = useMemo(() => generateBlockyPattern(address), [address])

  const renderContent = () => {
    // Image variant
    if ((variant === 'image' || src) && src && !imageError) {
      return (
        <img
          src={src}
          alt={alt || name || address || 'User avatar'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      )
    }

    // Blocky pattern variant
    if (variant === 'blocky' && address) {
      const pixelSize = size === 'xs' || size === 'sm' ? 2 : size === 'xl' || size === '2xl' ? 4 : 3
      return (
        <svg 
          viewBox="0 0 5 5" 
          className="w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        >
          {pattern.map((row, i) =>
            row.map((filled, j) => (
              filled && (
                <rect
                  key={`${i}-${j}`}
                  x={j}
                  y={i}
                  width={1}
                  height={1}
                  fill={bgColor}
                />
              )
            ))
          )}
        </svg>
      )
    }

    // Gradient variant
    if (variant === 'gradient') {
      return (
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${bgColor}, ${stringToColor((address || name || '') + 'salt')})` 
          }}
        >
          <span className={`font-semibold text-white ${text}`}>
            {initials}
          </span>
        </div>
      )
    }

    // Default initials variant
    return (
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <span className={`font-semibold text-white ${text}`}>
          {initials}
        </span>
      </div>
    )
  }

  return (
    <div 
      className={`relative inline-flex ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div 
        className={`${container} rounded-full overflow-hidden ${
          showBorder ? 'ring-2 ring-arena-purple/50' : ''
        } ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        title={address || name}
      >
        {renderContent()}
      </div>

      {/* Status indicator */}
      {status && (
        <span 
          className={`absolute bottom-0 right-0 ${statusSize} ${statusColors[status]} rounded-full ring-2 ring-arena-darker`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}

// Avatar group for showing multiple users
export const AvatarGroup = ({
  users = [],
  max = 4,
  size = 'md',
  variant = 'initials',
  className = ''
}) => {
  const visibleUsers = users.slice(0, max)
  const remainingCount = users.length - max

  const overlapSize = {
    xs: '-ml-2',
    sm: '-ml-3',
    md: '-ml-4',
    lg: '-ml-5',
    xl: '-ml-6',
    '2xl': '-ml-8'
  }

  return (
    <div className={`flex ${className}`}>
      {visibleUsers.map((user, index) => (
        <div 
          key={user.address || index}
          className={`${index > 0 ? overlapSize[size] : ''}`}
          style={{ zIndex: visibleUsers.length - index }}
        >
          <Avatar
            address={user.address}
            name={user.name}
            src={user.avatar}
            size={size}
            variant={variant}
            showBorder
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div 
          className={`${overlapSize[size]} relative`}
          style={{ zIndex: 0 }}
        >
          <Avatar
            name={`+${remainingCount}`}
            size={size}
            variant="initials"
            showBorder
          />
        </div>
      )}
    </div>
  )
}

// User badge with avatar and name
export const UserBadge = ({
  address,
  name,
  src,
  size = 'md',
  showAddress = true,
  className = ''
}) => {
  const truncatedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Avatar address={address} name={name} src={src} size={size} />
      <div className="min-w-0">
        {name && (
          <p className="font-medium text-white truncate">{name}</p>
        )}
        {showAddress && address && (
          <p className="text-xs text-gray-400 font-mono truncate">
            {truncatedAddress}
          </p>
        )}
      </div>
    </div>
  )
}

export default Avatar
