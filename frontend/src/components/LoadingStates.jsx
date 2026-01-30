import React from 'react'

/**
 * Skeleton loading components for better UX during data fetching
 */

// Base skeleton with shimmer animation
const SkeletonBase = ({ className = '', children }) => (
  <div className={`animate-pulse ${className}`}>
    {children}
  </div>
)

// Simple rectangular skeleton
export const Skeleton = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div className={`bg-gray-700/50 rounded ${width} ${height} ${className}`} />
)

// Circular skeleton for avatars
export const SkeletonCircle = ({ size = 'w-10 h-10', className = '' }) => (
  <div className={`bg-gray-700/50 rounded-full ${size} ${className}`} />
)

// Text skeleton with multiple lines
export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        width={i === lines - 1 ? 'w-3/4' : 'w-full'} 
        height="h-4" 
      />
    ))}
  </div>
)

// Market card skeleton
export const MarketCardSkeleton = () => (
  <SkeletonBase className="glass-card p-6 rounded-2xl">
    {/* Header */}
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-2">
        <Skeleton width="w-20" height="h-6" className="rounded-full" />
        <Skeleton width="w-16" height="h-6" className="rounded-full" />
      </div>
      <Skeleton width="w-24" height="h-5" />
    </div>

    {/* Title */}
    <Skeleton width="w-full" height="h-6" className="mb-2" />
    <Skeleton width="w-3/4" height="h-6" className="mb-4" />

    {/* Progress bar */}
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <Skeleton width="w-16" height="h-4" />
        <Skeleton width="w-16" height="h-4" />
      </div>
      <Skeleton width="w-full" height="h-3" className="rounded-full" />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-4 mb-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="text-center">
          <Skeleton width="w-12" height="h-4" className="mx-auto mb-1" />
          <Skeleton width="w-16" height="h-5" className="mx-auto" />
        </div>
      ))}
    </div>

    {/* Buttons */}
    <div className="flex gap-2">
      <Skeleton width="w-1/2" height="h-10" className="rounded-xl" />
      <Skeleton width="w-1/2" height="h-10" className="rounded-xl" />
    </div>
  </SkeletonBase>
)

// Stats card skeleton
export const StatsCardSkeleton = () => (
  <SkeletonBase className="glass-card p-6 rounded-2xl">
    <SkeletonCircle size="w-8 h-8" className="mb-3" />
    <Skeleton width="w-20" height="h-4" className="mb-2" />
    <Skeleton width="w-24" height="h-8" />
  </SkeletonBase>
)

// Leaderboard row skeleton
export const LeaderboardRowSkeleton = () => (
  <SkeletonBase className="flex items-center px-6 py-4 border-b border-arena-purple/10">
    <SkeletonCircle size="w-8 h-8" className="mr-4" />
    <Skeleton width="w-32" height="h-5" className="mr-auto" />
    <Skeleton width="w-16" height="h-4" className="mx-4" />
    <Skeleton width="w-12" height="h-4" className="mx-4" />
    <Skeleton width="w-20" height="h-4" className="mx-4" />
    <Skeleton width="w-20" height="h-5" />
  </SkeletonBase>
)

// Table skeleton
export const TableSkeleton = ({ rows = 5 }) => (
  <div className="glass-card rounded-2xl overflow-hidden">
    {/* Header */}
    <div className="flex items-center px-6 py-4 border-b border-arena-purple/20 bg-arena-purple/5">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Skeleton key={i} width="w-20" height="h-4" className="mr-4" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <LeaderboardRowSkeleton key={i} />
    ))}
  </div>
)

// Full page loading skeleton
export const PageSkeleton = () => (
  <div className="min-h-screen p-4 sm:p-6 lg:p-8">
    {/* Hero */}
    <SkeletonBase className="text-center mb-12">
      <Skeleton width="w-64" height="h-10" className="mx-auto mb-4" />
      <Skeleton width="w-96" height="h-6" className="mx-auto mb-6" />
      <div className="flex justify-center gap-4">
        <Skeleton width="w-32" height="h-12" className="rounded-xl" />
        <Skeleton width="w-32" height="h-12" className="rounded-xl" />
      </div>
    </SkeletonBase>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {[1, 2, 3, 4].map(i => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>

    {/* Markets */}
    <div className="mb-8">
      <Skeleton width="w-48" height="h-8" className="mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <MarketCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
)

// Inline loading spinner
export const Spinner = ({ size = 'w-5 h-5', className = '' }) => (
  <div 
    className={`border-2 border-gray-600 border-t-arena-purple rounded-full animate-spin ${size} ${className}`}
    role="status"
    aria-label="Loading"
  >
    <span className="sr-only">Loading...</span>
  </div>
)

// Button with loading state
export const LoadingButton = ({ 
  children, 
  isLoading, 
  disabled, 
  className = '', 
  loadingText = 'Loading...',
  ...props 
}) => (
  <button
    disabled={disabled || isLoading}
    className={`relative ${className} ${isLoading ? 'cursor-wait' : ''}`}
    {...props}
  >
    {isLoading && (
      <span className="absolute inset-0 flex items-center justify-center">
        <Spinner size="w-5 h-5" />
      </span>
    )}
    <span className={isLoading ? 'invisible' : ''}>
      {isLoading ? loadingText : children}
    </span>
  </button>
)

// Error state component
export const ErrorState = ({ 
  title = 'Something went wrong', 
  message = 'Please try again later',
  onRetry,
  className = ''
}) => (
  <div className={`text-center py-12 ${className}`}>
    <div className="text-4xl mb-4">😕</div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="btn-primary px-6 py-2 rounded-xl font-medium"
      >
        Try Again
      </button>
    )}
  </div>
)

// Empty state component
export const EmptyState = ({ 
  icon = '📭', 
  title = 'Nothing here yet', 
  message = 'Check back later',
  action,
  actionLabel,
  className = ''
}) => (
  <div className={`text-center py-12 ${className}`}>
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-4">{message}</p>
    {action && actionLabel && (
      <button
        onClick={action}
        className="btn-primary px-6 py-2 rounded-xl font-medium"
      >
        {actionLabel}
      </button>
    )}
  </div>
)

export default {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  MarketCardSkeleton,
  StatsCardSkeleton,
  LeaderboardRowSkeleton,
  TableSkeleton,
  PageSkeleton,
  Spinner,
  LoadingButton,
  ErrorState,
  EmptyState
}
