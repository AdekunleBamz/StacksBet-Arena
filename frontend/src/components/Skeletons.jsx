import React from 'react'

/**
 * Skeleton loading components for StacksBet Arena
 */

// Base Skeleton component
export const Skeleton = ({
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
  className = ''
}) => {
  const baseStyles = 'bg-slate-700'
  
  const variants = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
    text: 'rounded h-4'
  }
  
  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  }
  
  const style = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height
  
  return (
    <div
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${animations[animation]}
        ${className}
      `}
      style={style}
    />
  )
}

// Text line skeleton
export const SkeletonText = ({ 
  lines = 1, 
  widths = [], 
  className = '' 
}) => {
  const defaultWidths = ['100%', '90%', '80%', '70%']
  
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={widths[i] || defaultWidths[i] || '100%'}
        />
      ))}
    </div>
  )
}

// Avatar skeleton
export const SkeletonAvatar = ({ 
  size = 40, 
  className = '' 
}) => (
  <Skeleton
    variant="circular"
    width={size}
    height={size}
    className={className}
  />
)

// Button skeleton
export const SkeletonButton = ({
  width = 100,
  height = 40,
  className = ''
}) => (
  <Skeleton
    variant="rounded"
    width={width}
    height={height}
    className={className}
  />
)

// Market Card Skeleton
export const MarketCardSkeleton = ({ className = '' }) => (
  <div className={`
    bg-slate-800/50 rounded-xl p-5 border border-slate-700/50
    ${className}
  `}>
    {/* Header */}
    <div className="flex items-start gap-3 mb-4">
      <SkeletonAvatar size={48} />
      <div className="flex-1">
        <Skeleton height={20} width="80%" className="mb-2" />
        <Skeleton height={14} width="50%" />
      </div>
    </div>
    
    {/* Title */}
    <Skeleton height={24} width="90%" className="mb-3" />
    
    {/* Description */}
    <SkeletonText lines={2} widths={['100%', '70%']} className="mb-4" />
    
    {/* Stats */}
    <div className="flex gap-4 mb-4">
      <Skeleton height={32} width={80} variant="rounded" />
      <Skeleton height={32} width={80} variant="rounded" />
      <Skeleton height={32} width={80} variant="rounded" />
    </div>
    
    {/* Progress bar */}
    <Skeleton height={8} variant="rounded" className="mb-4" />
    
    {/* Footer */}
    <div className="flex items-center justify-between">
      <Skeleton height={16} width={100} />
      <Skeleton height={36} width={120} variant="rounded" />
    </div>
  </div>
)

// Market List Skeleton
export const MarketListSkeleton = ({ count = 3, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <MarketCardSkeleton key={i} />
    ))}
  </div>
)

// Leaderboard Row Skeleton
export const LeaderboardRowSkeleton = ({ className = '' }) => (
  <div className={`
    flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg
    ${className}
  `}>
    <Skeleton height={24} width={24} variant="circular" />
    <SkeletonAvatar size={40} />
    <div className="flex-1">
      <Skeleton height={16} width={120} className="mb-1" />
      <Skeleton height={12} width={80} />
    </div>
    <Skeleton height={20} width={60} />
  </div>
)

// Leaderboard Skeleton
export const LeaderboardSkeleton = ({ count = 10, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <LeaderboardRowSkeleton key={i} />
    ))}
  </div>
)

// Stats Card Skeleton
export const StatsCardSkeleton = ({ className = '' }) => (
  <div className={`
    bg-slate-800/50 rounded-xl p-5 border border-slate-700/50
    ${className}
  `}>
    <div className="flex items-center gap-3 mb-3">
      <Skeleton height={40} width={40} variant="rounded" />
      <Skeleton height={14} width={100} />
    </div>
    <Skeleton height={32} width={80} className="mb-2" />
    <Skeleton height={12} width={60} />
  </div>
)

// Stats Grid Skeleton
export const StatsGridSkeleton = ({ count = 4, className = '' }) => (
  <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <StatsCardSkeleton key={i} />
    ))}
  </div>
)

// Profile Skeleton
export const ProfileSkeleton = ({ className = '' }) => (
  <div className={`${className}`}>
    {/* Header */}
    <div className="flex items-center gap-4 mb-6">
      <SkeletonAvatar size={80} />
      <div>
        <Skeleton height={28} width={180} className="mb-2" />
        <Skeleton height={16} width={140} />
      </div>
    </div>
    
    {/* Stats */}
    <StatsGridSkeleton className="mb-6" />
    
    {/* Tabs */}
    <div className="flex gap-4 mb-4 border-b border-slate-700 pb-2">
      <Skeleton height={32} width={80} variant="rounded" />
      <Skeleton height={32} width={80} variant="rounded" />
      <Skeleton height={32} width={80} variant="rounded" />
    </div>
    
    {/* Content */}
    <MarketListSkeleton count={2} />
  </div>
)

// Transaction Item Skeleton
export const TransactionItemSkeleton = ({ className = '' }) => (
  <div className={`
    flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg
    ${className}
  `}>
    <Skeleton height={40} width={40} variant="circular" />
    <div className="flex-1">
      <Skeleton height={16} width="60%" className="mb-1" />
      <Skeleton height={12} width="40%" />
    </div>
    <div className="text-right">
      <Skeleton height={18} width={80} className="mb-1" />
      <Skeleton height={12} width={60} />
    </div>
  </div>
)

// Transaction List Skeleton
export const TransactionListSkeleton = ({ count = 5, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <TransactionItemSkeleton key={i} />
    ))}
  </div>
)

// Table Skeleton
export const TableSkeleton = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`${className}`}>
    {/* Header */}
    <div className="flex gap-4 p-4 border-b border-slate-700">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height={16} width={i === 0 ? 150 : 100} className="flex-1" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 p-4 border-b border-slate-700/50">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            height={14}
            width={colIndex === 0 ? '80%' : '60%'}
            className="flex-1"
          />
        ))}
      </div>
    ))}
  </div>
)

// Chart Skeleton
export const ChartSkeleton = ({ height = 300, className = '' }) => (
  <div className={`
    bg-slate-800/50 rounded-xl p-5 border border-slate-700/50
    ${className}
  `}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton height={20} width={150} />
      <div className="flex gap-2">
        <Skeleton height={28} width={60} variant="rounded" />
        <Skeleton height={28} width={60} variant="rounded" />
        <Skeleton height={28} width={60} variant="rounded" />
      </div>
    </div>
    <Skeleton height={height} variant="rounded" />
  </div>
)

// Bet Panel Skeleton
export const BetPanelSkeleton = ({ className = '' }) => (
  <div className={`
    bg-slate-800/50 rounded-xl p-5 border border-slate-700/50
    ${className}
  `}>
    <Skeleton height={24} width={150} className="mb-4" />
    
    {/* Option buttons */}
    <div className="flex gap-3 mb-4">
      <Skeleton height={48} className="flex-1" variant="rounded" />
      <Skeleton height={48} className="flex-1" variant="rounded" />
    </div>
    
    {/* Amount input */}
    <Skeleton height={48} variant="rounded" className="mb-4" />
    
    {/* Slider */}
    <Skeleton height={8} variant="rounded" className="mb-6" />
    
    {/* Summary */}
    <div className="space-y-2 mb-4">
      <div className="flex justify-between">
        <Skeleton height={14} width={100} />
        <Skeleton height={14} width={60} />
      </div>
      <div className="flex justify-between">
        <Skeleton height={14} width={120} />
        <Skeleton height={14} width={80} />
      </div>
    </div>
    
    {/* Confirm button */}
    <Skeleton height={48} variant="rounded" />
  </div>
)

// Page Header Skeleton
export const PageHeaderSkeleton = ({ className = '' }) => (
  <div className={`mb-8 ${className}`}>
    <Skeleton height={36} width={250} className="mb-2" />
    <Skeleton height={18} width={400} />
  </div>
)

// Notification Item Skeleton
export const NotificationItemSkeleton = ({ className = '' }) => (
  <div className={`flex gap-3 p-4 ${className}`}>
    <Skeleton height={40} width={40} variant="circular" />
    <div className="flex-1">
      <Skeleton height={16} width="70%" className="mb-2" />
      <Skeleton height={12} width="50%" className="mb-1" />
      <Skeleton height={10} width={60} />
    </div>
  </div>
)

// Full Page Skeleton
export const PageSkeleton = ({ type = 'default', className = '' }) => {
  const layouts = {
    default: (
      <>
        <PageHeaderSkeleton />
        <StatsGridSkeleton className="mb-6" />
        <MarketListSkeleton />
      </>
    ),
    market: (
      <>
        <PageHeaderSkeleton />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MarketCardSkeleton className="mb-6" />
            <ChartSkeleton />
          </div>
          <div>
            <BetPanelSkeleton />
          </div>
        </div>
      </>
    ),
    profile: <ProfileSkeleton />,
    leaderboard: (
      <>
        <PageHeaderSkeleton />
        <LeaderboardSkeleton />
      </>
    )
  }
  
  return (
    <div className={`animate-pulse ${className}`}>
      {layouts[type] || layouts.default}
    </div>
  )
}

// Custom shimmer animation (add to tailwind config)
export const shimmerKeyframes = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  .animate-shimmer {
    background: linear-gradient(
      90deg,
      rgb(51 65 85 / 0.5) 0%,
      rgb(71 85 105 / 0.5) 50%,
      rgb(51 65 85 / 0.5) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
`

export default {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  MarketCardSkeleton,
  MarketListSkeleton,
  LeaderboardRowSkeleton,
  LeaderboardSkeleton,
  StatsCardSkeleton,
  StatsGridSkeleton,
  ProfileSkeleton,
  TransactionItemSkeleton,
  TransactionListSkeleton,
  TableSkeleton,
  ChartSkeleton,
  BetPanelSkeleton,
  PageHeaderSkeleton,
  NotificationItemSkeleton,
  PageSkeleton
}
