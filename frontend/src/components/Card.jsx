import React from 'react'

/**
 * Flexible Card component system for consistent layouts
 */

// Base Card component
const Card = ({
  children,
  variant = 'default',
  hover = false,
  glow = false,
  padding = 'md',
  className = '',
  onClick,
  ...props
}) => {
  const variants = {
    default: 'bg-arena-card border border-gray-700/50',
    elevated: 'bg-arena-card border border-gray-700/50 shadow-xl',
    outline: 'bg-transparent border-2 border-gray-700',
    gradient: 'bg-gradient-to-br from-arena-card via-arena-card to-arena-purple/20 border border-arena-purple/30',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    success: 'bg-arena-card border border-arena-green/30',
    warning: 'bg-arena-card border border-yellow-500/30',
    danger: 'bg-arena-card border border-red-500/30'
  }

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }

  const hoverStyles = hover ? `
    cursor-pointer transition-all duration-300
    hover:border-arena-purple/60 hover:shadow-lg hover:shadow-arena-purple/10
    hover:-translate-y-1
  ` : ''

  const glowStyles = glow ? `
    shadow-lg shadow-arena-purple/20
    hover:shadow-xl hover:shadow-arena-purple/30
  ` : ''

  return (
    <div
      className={`
        rounded-2xl
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverStyles}
        ${glowStyles}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => onClick && e.key === 'Enter' && onClick(e)}
      {...props}
    >
      {children}
    </div>
  )
}

// Card Header
export const CardHeader = ({
  title,
  subtitle,
  action,
  icon,
  className = ''
}) => {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded-xl bg-arena-purple/20 text-arena-purple">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// Card Body
export const CardBody = ({ children, className = '' }) => {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  )
}

// Card Footer
export const CardFooter = ({ children, divided = false, className = '' }) => {
  return (
    <div className={`
      ${divided ? 'border-t border-gray-700/50 pt-4 mt-4' : 'mt-4'}
      ${className}
    `}>
      {children}
    </div>
  )
}

// Market Card (specific to prediction markets)
export const MarketCard = ({
  title,
  category,
  endTime,
  totalVolume,
  yesPercentage,
  noPercentage,
  status,
  onBetYes,
  onBetNo,
  onClick,
  className = ''
}) => {
  const formatVolume = (vol) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M STX`
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K STX`
    return `${vol} STX`
  }

  return (
    <Card 
      variant="gradient" 
      hover 
      onClick={onClick}
      className={`group ${className}`}
    >
      {/* Category & Status */}
      <div className="flex items-center justify-between mb-3">
        <span className="px-2 py-1 text-xs font-medium bg-arena-purple/20 text-arena-purple rounded-lg">
          {category}
        </span>
        <span className={`
          px-2 py-1 text-xs font-medium rounded-lg
          ${status === 'active' ? 'bg-arena-green/20 text-arena-green' : 'bg-gray-700 text-gray-400'}
        `}>
          {status === 'active' ? '● Live' : status}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 group-hover:text-arena-cyan transition-colors">
        {title}
      </h3>

      {/* Odds Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-arena-green font-medium">Yes {yesPercentage}%</span>
          <span className="text-arena-pink font-medium">No {noPercentage}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden flex">
          <div 
            className="bg-gradient-to-r from-arena-green to-arena-green/80 transition-all duration-500"
            style={{ width: `${yesPercentage}%` }}
          />
          <div 
            className="bg-gradient-to-r from-arena-pink/80 to-arena-pink transition-all duration-500"
            style={{ width: `${noPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <span>Volume: {formatVolume(totalVolume)}</span>
        <span>Ends: {endTime}</span>
      </div>

      {/* Bet Buttons */}
      <div className="flex gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onBetYes?.() }}
          className="flex-1 py-2 rounded-xl bg-arena-green/20 text-arena-green font-semibold
                     hover:bg-arena-green hover:text-white transition-all"
        >
          Bet Yes
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onBetNo?.() }}
          className="flex-1 py-2 rounded-xl bg-arena-pink/20 text-arena-pink font-semibold
                     hover:bg-arena-pink hover:text-white transition-all"
        >
          Bet No
        </button>
      </div>
    </Card>
  )
}

// Stats Card
export const StatsCard = ({
  icon,
  label,
  value,
  change,
  trend,
  className = ''
}) => {
  const isPositive = trend === 'up'

  return (
    <Card variant="glass" padding="md" className={className}>
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-xl bg-arena-purple/20 text-arena-purple">
          {icon}
        </div>
        {change !== undefined && (
          <span className={`text-sm font-medium ${isPositive ? 'text-arena-green' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400 mt-1">{label}</p>
      </div>
    </Card>
  )
}

// Feature Card
export const FeatureCard = ({
  icon,
  title,
  description,
  className = ''
}) => {
  return (
    <Card variant="default" hover className={`text-center ${className}`}>
      <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-arena-purple to-arena-pink
                      flex items-center justify-center text-white text-2xl mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </Card>
  )
}

// Trader Card (for leaderboard)
export const TraderCard = ({
  rank,
  address,
  avatar,
  totalBets,
  winRate,
  profit,
  onClick,
  className = ''
}) => {
  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const truncateAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <Card 
      variant="default" 
      hover 
      onClick={onClick}
      padding="sm"
      className={`flex items-center gap-4 ${className}`}
    >
      <div className="text-lg font-bold w-8 text-center">
        {getRankBadge(rank)}
      </div>
      
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-arena-purple to-arena-pink
                      flex items-center justify-center text-white font-bold">
        {avatar || address.slice(0, 2).toUpperCase()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">
          {truncateAddress(address)}
        </p>
        <p className="text-xs text-gray-400">
          {totalBets} bets · {winRate}% win rate
        </p>
      </div>
      
      <div className={`font-bold ${profit >= 0 ? 'text-arena-green' : 'text-red-400'}`}>
        {profit >= 0 ? '+' : ''}{profit} STX
      </div>
    </Card>
  )
}

// Card Grid Layout
export const CardGrid = ({
  children,
  columns = 3,
  gap = 'md',
  className = ''
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  )
}

export default Card
