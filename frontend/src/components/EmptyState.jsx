import React from 'react'
import { 
  HiOutlineDocumentAdd, 
  HiOutlineSearch, 
  HiOutlineExclamation,
  HiOutlineWifi,
  HiOutlineDatabase,
  HiOutlineChartBar,
  HiOutlineCash,
  HiOutlineUserGroup,
  HiOutlineShieldCheck
} from 'react-icons/hi'

/**
 * Empty State components for various scenarios
 */

const EmptyState = ({
  icon: Icon = HiOutlineDocumentAdd,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: {
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-sm',
      padding: 'py-8'
    },
    md: {
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-base',
      padding: 'py-12'
    },
    lg: {
      icon: 'w-20 h-20',
      title: 'text-2xl',
      description: 'text-base',
      padding: 'py-16'
    }
  }

  const { icon, title: titleSize, description: descSize, padding } = sizes[size]

  return (
    <div className={`flex flex-col items-center text-center ${padding} ${className}`}>
      <div className="w-20 h-20 rounded-2xl bg-gray-800/50 flex items-center justify-center mb-6">
        <Icon className={`${icon} text-gray-500`} />
      </div>
      
      {title && (
        <h3 className={`font-bold text-white mb-2 ${titleSize}`}>
          {title}
        </h3>
      )}
      
      {description && (
        <p className={`text-gray-400 max-w-sm mb-6 ${descSize}`}>
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}

// No Markets Found
export const NoMarketsFound = ({
  onCreateMarket,
  onClearFilters,
  hasFilters = false,
  className = ''
}) => {
  if (hasFilters) {
    return (
      <EmptyState
        icon={HiOutlineSearch}
        title="No markets found"
        description="Try adjusting your filters or search terms to find what you're looking for."
        action={
          <button
            onClick={onClearFilters}
            className="px-4 py-2 rounded-xl bg-arena-purple text-white font-medium
                     hover:bg-arena-purple/80 transition-colors"
          >
            Clear Filters
          </button>
        }
        className={className}
      />
    )
  }

  return (
    <EmptyState
      icon={HiOutlineChartBar}
      title="No markets yet"
      description="Be the first to create a prediction market and start trading!"
      action={
        <button
          onClick={onCreateMarket}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-arena-purple to-arena-pink
                   text-white font-medium hover:opacity-90 transition-opacity"
        >
          Create Market
        </button>
      }
      className={className}
    />
  )
}

// No Bets
export const NoBets = ({
  onBrowseMarkets,
  className = ''
}) => {
  return (
    <EmptyState
      icon={HiOutlineCash}
      title="No bets yet"
      description="Start making predictions on active markets to see your bets here."
      action={
        <button
          onClick={onBrowseMarkets}
          className="px-4 py-2 rounded-xl bg-arena-purple text-white font-medium
                   hover:bg-arena-purple/80 transition-colors"
        >
          Browse Markets
        </button>
      }
      className={className}
    />
  )
}

// No Transactions
export const NoTransactions = ({
  className = ''
}) => {
  return (
    <EmptyState
      icon={HiOutlineDatabase}
      title="No transactions"
      description="Your transaction history will appear here once you start trading."
      className={className}
    />
  )
}

// No Search Results
export const NoSearchResults = ({
  query,
  onClear,
  className = ''
}) => {
  return (
    <EmptyState
      icon={HiOutlineSearch}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
      action={
        onClear && (
          <button
            onClick={onClear}
            className="px-4 py-2 rounded-xl border border-gray-600 text-gray-300
                     hover:border-arena-purple hover:text-white transition-colors"
          >
            Clear Search
          </button>
        )
      }
      className={className}
    />
  )
}

// Not Connected
export const NotConnected = ({
  onConnect,
  className = ''
}) => {
  return (
    <EmptyState
      icon={HiOutlineShieldCheck}
      title="Connect your wallet"
      description="Connect your Stacks wallet to view your positions and start trading."
      action={
        <button
          onClick={onConnect}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-arena-purple via-arena-pink to-arena-cyan
                   text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Connect Wallet
        </button>
      }
      className={className}
    />
  )
}

// Offline
export const OfflineState = ({
  onRetry,
  className = ''
}) => {
  return (
    <EmptyState
      icon={HiOutlineWifi}
      title="You're offline"
      description="Please check your internet connection and try again."
      action={
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-arena-purple text-white font-medium
                   hover:bg-arena-purple/80 transition-colors"
        >
          Try Again
        </button>
      }
      className={className}
    />
  )
}

// Error State
export const ErrorState = ({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry,
  error,
  showError = false,
  className = ''
}) => {
  return (
    <EmptyState
      icon={HiOutlineExclamation}
      title={title}
      description={
        <>
          {description}
          {showError && error && (
            <code className="block mt-2 text-xs text-red-400 bg-red-900/20 p-2 rounded">
              {error.message || String(error)}
            </code>
          )}
        </>
      }
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 font-medium
                     border border-red-500/30 hover:bg-red-500/30 transition-colors"
          >
            Try Again
          </button>
        )
      }
      className={className}
    />
  )
}

// No Leaderboard Data
export const NoLeaderboardData = ({
  className = ''
}) => {
  return (
    <EmptyState
      icon={HiOutlineUserGroup}
      title="No traders yet"
      description="Be among the first to trade and appear on the leaderboard!"
      className={className}
    />
  )
}

// Coming Soon
export const ComingSoon = ({
  feature = "Feature",
  className = ''
}) => {
  return (
    <div className={`
      flex flex-col items-center text-center py-12
      ${className}
    `}>
      <span className="text-6xl mb-4">🚀</span>
      <h3 className="text-xl font-bold text-white mb-2">
        {feature} Coming Soon
      </h3>
      <p className="text-gray-400 max-w-sm">
        We're working hard to bring you this feature. Stay tuned!
      </p>
    </div>
  )
}

// Under Maintenance
export const UnderMaintenance = ({
  estimatedTime,
  className = ''
}) => {
  return (
    <div className={`
      flex flex-col items-center text-center py-12
      ${className}
    `}>
      <span className="text-6xl mb-4">🔧</span>
      <h3 className="text-xl font-bold text-white mb-2">
        Under Maintenance
      </h3>
      <p className="text-gray-400 max-w-sm mb-4">
        We're performing scheduled maintenance. Please check back soon.
      </p>
      {estimatedTime && (
        <p className="text-sm text-arena-cyan">
          Estimated completion: {estimatedTime}
        </p>
      )}
    </div>
  )
}

// Empty Illustration (decorative)
export const EmptyIllustration = ({
  type = 'default',
  className = ''
}) => {
  const illustrations = {
    default: (
      <svg viewBox="0 0 200 200" className={`w-40 h-40 ${className}`}>
        <circle cx="100" cy="100" r="80" fill="url(#gradient)" opacity="0.1" />
        <circle cx="100" cy="100" r="60" fill="url(#gradient)" opacity="0.1" />
        <circle cx="100" cy="100" r="40" fill="url(#gradient)" opacity="0.2" />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>
    ),
    chart: (
      <svg viewBox="0 0 200 160" className={`w-40 h-32 ${className}`}>
        <rect x="20" y="120" width="24" height="30" fill="#374151" rx="4" />
        <rect x="54" y="90" width="24" height="60" fill="#374151" rx="4" />
        <rect x="88" y="60" width="24" height="90" fill="#8B5CF6" opacity="0.5" rx="4" />
        <rect x="122" y="40" width="24" height="110" fill="#8B5CF6" opacity="0.7" rx="4" />
        <rect x="156" y="70" width="24" height="80" fill="#374151" rx="4" />
      </svg>
    ),
    wallet: (
      <svg viewBox="0 0 200 200" className={`w-40 h-40 ${className}`}>
        <rect x="30" y="50" width="140" height="100" fill="#1F2937" rx="12" />
        <rect x="100" y="80" width="60" height="40" fill="#8B5CF6" opacity="0.3" rx="8" />
        <circle cx="130" cy="100" r="8" fill="#8B5CF6" />
      </svg>
    )
  }

  return illustrations[type] || illustrations.default
}

// Conditional Empty State wrapper
export const ConditionalEmpty = ({
  isEmpty,
  children,
  emptyComponent
}) => {
  if (isEmpty) {
    return emptyComponent
  }
  return children
}

export default EmptyState
