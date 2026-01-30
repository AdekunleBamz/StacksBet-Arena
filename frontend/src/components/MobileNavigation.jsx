import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  FiHome, FiTrendingUp, FiPlusCircle, FiUser, FiMenu, 
  FiX, FiSearch, FiSettings, FiBell, FiLogOut, FiAward,
  FiActivity, FiBookOpen, FiHelpCircle, FiMessageSquare,
  FiChevronRight, FiChevronDown, FiWallet
} from 'react-icons/fi'

/**
 * Mobile-first navigation components for StacksBet Arena
 */

// Navigation items configuration
const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: FiHome, path: '/' },
  { id: 'markets', label: 'Markets', icon: FiTrendingUp, path: '/markets' },
  { id: 'create', label: 'Create', icon: FiPlusCircle, path: '/create' },
  { id: 'leaderboard', label: 'Leaders', icon: FiAward, path: '/leaderboard' },
  { id: 'profile', label: 'Profile', icon: FiUser, path: '/profile' }
]

const MENU_SECTIONS = [
  {
    title: 'Browse',
    items: [
      { id: 'trending', label: 'Trending Markets', icon: FiTrendingUp, path: '/markets/trending' },
      { id: 'new', label: 'New Markets', icon: FiActivity, path: '/markets/new' },
      { id: 'ending', label: 'Ending Soon', icon: FiActivity, path: '/markets/ending' }
    ]
  },
  {
    title: 'Account',
    items: [
      { id: 'portfolio', label: 'My Portfolio', icon: FiWallet, path: '/portfolio' },
      { id: 'history', label: 'Transaction History', icon: FiBookOpen, path: '/history' },
      { id: 'settings', label: 'Settings', icon: FiSettings, path: '/settings' }
    ]
  },
  {
    title: 'Help',
    items: [
      { id: 'guide', label: 'How It Works', icon: FiHelpCircle, path: '/guide' },
      { id: 'faq', label: 'FAQ', icon: FiMessageSquare, path: '/faq' }
    ]
  }
]

/**
 * Bottom tab navigation for mobile
 */
export const BottomNav = ({
  activeTab = 'home',
  onTabChange,
  className = ''
}) => {
  const [hasNotification, setHasNotification] = useState(false)

  return (
    <nav className={`
      fixed bottom-0 left-0 right-0 z-50
      bg-slate-900/95 backdrop-blur-lg
      border-t border-slate-700/50
      safe-area-bottom
      ${className}
    `}>
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const isCreate = item.id === 'create'

          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item)}
              className={`
                relative flex flex-col items-center justify-center
                w-16 h-full
                transition-all duration-200
                ${isCreate ? 'relative -mt-4' : ''}
                ${isActive ? 'text-purple-400' : 'text-slate-400 hover:text-slate-300'}
              `}
            >
              {isCreate ? (
                <div className="
                  w-12 h-12 rounded-full
                  bg-gradient-to-r from-purple-500 to-pink-500
                  flex items-center justify-center
                  shadow-lg shadow-purple-500/30
                ">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              ) : (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                  {isActive && (
                    <span className="absolute top-1 w-1 h-1 bg-purple-400 rounded-full" />
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

/**
 * Mobile header with hamburger menu
 */
export const MobileHeader = ({
  title = 'StacksBet',
  showBack = false,
  onBack,
  onMenuToggle,
  onSearch,
  onNotifications,
  notificationCount = 0,
  className = ''
}) => {
  return (
    <header className={`
      sticky top-0 z-40
      bg-slate-900/95 backdrop-blur-lg
      border-b border-slate-700/50
      ${className}
    `}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-slate-300 hover:text-white"
            >
              <FiChevronRight className="w-5 h-5 rotate-180" />
            </button>
          ) : (
            <button
              onClick={onMenuToggle}
              className="p-2 -ml-2 text-slate-300 hover:text-white"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-bold text-white">{title}</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSearch}
            className="p-2 text-slate-300 hover:text-white transition-colors"
          >
            <FiSearch className="w-5 h-5" />
          </button>
          <button
            onClick={onNotifications}
            className="relative p-2 text-slate-300 hover:text-white transition-colors"
          >
            <FiBell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="
                absolute top-1 right-1
                min-w-[18px] h-[18px]
                bg-red-500 rounded-full
                text-xs text-white font-bold
                flex items-center justify-center
              ">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

/**
 * Slide-out drawer menu
 */
export const DrawerMenu = ({
  isOpen,
  onClose,
  user,
  walletConnected = false,
  onConnectWallet,
  onDisconnect,
  onNavigate,
  activeItem
}) => {
  const drawerRef = useRef(null)

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when open
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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-50 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`
          fixed top-0 left-0 bottom-0 z-50
          w-80 max-w-[85vw]
          bg-slate-900 shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold">SB</span>
            </div>
            <span className="text-lg font-bold text-white">StacksBet</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* User Section */}
        <div className="p-4 border-b border-slate-700/50">
          {walletConnected && user ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <FiUser className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user.name || 'Anonymous'}</p>
                <p className="text-sm text-slate-400 truncate">
                  {user.address?.slice(0, 8)}...{user.address?.slice(-6)}
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="
                w-full py-3 rounded-lg
                bg-gradient-to-r from-purple-500 to-pink-500
                text-white font-semibold
                flex items-center justify-center gap-2
                hover:opacity-90 transition-opacity
              "
            >
              <FiWallet className="w-5 h-5" />
              Connect Wallet
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-2">
          {MENU_SECTIONS.map((section) => (
            <div key={section.title} className="py-2">
              <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.title}
              </p>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = activeItem === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate?.(item)
                      onClose()
                    }}
                    className={`
                      w-full px-4 py-3
                      flex items-center gap-3
                      transition-colors
                      ${isActive 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'text-slate-300 hover:bg-slate-800/50'}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-purple-400" />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        {walletConnected && (
          <div className="p-4 border-t border-slate-700/50">
            <button
              onClick={onDisconnect}
              className="
                w-full py-3 rounded-lg
                bg-slate-800 text-red-400
                flex items-center justify-center gap-2
                hover:bg-slate-700 transition-colors
              "
            >
              <FiLogOut className="w-5 h-5" />
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    </>
  )
}

/**
 * Search overlay for mobile
 */
export const MobileSearch = ({
  isOpen,
  onClose,
  onSearch,
  recentSearches = [],
  popularSearches = []
}) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch?.(query.trim())
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-2 p-2 border-b border-slate-700/50">
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white"
        >
          <FiChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <form onSubmit={handleSubmit} className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search markets..."
            className="
              w-full py-2 px-4
              bg-slate-800 rounded-lg
              text-white placeholder-slate-500
              border border-slate-700 focus:border-purple-500
              outline-none transition-colors
            "
          />
        </form>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 60px)' }}>
        {query ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Press Enter to search</p>
          </div>
        ) : (
          <>
            {recentSearches.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Recent Searches</h3>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSearch?.(search)
                        onClose()
                      }}
                      className="
                        w-full px-3 py-2 rounded-lg
                        bg-slate-800/50 text-slate-300
                        text-left hover:bg-slate-800
                        transition-colors
                      "
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {popularSearches.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Popular Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSearch?.(search)
                        onClose()
                      }}
                      className="
                        px-4 py-2 rounded-full
                        bg-slate-800 text-slate-300
                        text-sm hover:bg-slate-700
                        transition-colors
                      "
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Pull-to-refresh component
 */
export const PullToRefresh = ({
  children,
  onRefresh,
  threshold = 80,
  className = ''
}) => {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef(null)
  const startY = useRef(0)

  const handleTouchStart = useCallback((e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || isRefreshing) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault()
      setPullDistance(Math.min(diff * 0.5, threshold * 1.5))
    }
  }, [isPulling, isRefreshing, threshold])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return
    setIsPulling(false)

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(threshold)
      
      try {
        await onRefresh?.()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex justify-center items-center transition-all"
        style={{
          top: -40,
          transform: `translateY(${pullDistance}px)`,
          opacity: pullDistance / threshold
        }}
      >
        <div className={`
          w-8 h-8 rounded-full border-2 border-purple-400
          flex items-center justify-center
          ${isRefreshing ? 'animate-spin' : ''}
        `}>
          {isRefreshing ? (
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full" />
          ) : (
            <FiChevronDown 
              className="w-4 h-4 text-purple-400 transition-transform"
              style={{ transform: pullDistance >= threshold ? 'rotate(180deg)' : '' }}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  )
}

/**
 * Swipe actions component
 */
export const SwipeActions = ({
  children,
  leftAction,
  rightAction,
  className = ''
}) => {
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const currentOffset = useRef(0)

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX
    currentOffset.current = offset
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return

    const diff = e.touches[0].clientX - startX.current
    const newOffset = currentOffset.current + diff
    
    // Clamp offset
    const maxOffset = rightAction ? 100 : 0
    const minOffset = leftAction ? -100 : 0
    setOffset(Math.max(minOffset, Math.min(maxOffset, newOffset)))
  }

  const handleTouchEnd = () => {
    setIsDragging(false)

    if (offset > 50 && rightAction) {
      rightAction.onAction?.()
    } else if (offset < -50 && leftAction) {
      leftAction.onAction?.()
    }

    setOffset(0)
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Left action (swipe right to reveal) */}
      {rightAction && (
        <div
          className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-center"
          style={{ backgroundColor: rightAction.color || '#10B981' }}
        >
          {rightAction.icon}
        </div>
      )}

      {/* Right action (swipe left to reveal) */}
      {leftAction && (
        <div
          className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-center"
          style={{ backgroundColor: leftAction.color || '#EF4444' }}
        >
          {leftAction.icon}
        </div>
      )}

      {/* Main content */}
      <div
        className="relative bg-slate-800 transition-transform"
        style={{
          transform: `translateX(${offset}px)`,
          transitionDuration: isDragging ? '0ms' : '200ms'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Combined mobile navigation container
 */
export const MobileNavigation = ({
  children,
  title,
  user,
  walletConnected,
  activeTab,
  notificationCount = 0,
  onTabChange,
  onConnectWallet,
  onDisconnect,
  onNavigate,
  onSearch
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      <MobileHeader
        title={title}
        onMenuToggle={() => setIsMenuOpen(true)}
        onSearch={() => setIsSearchOpen(true)}
        notificationCount={notificationCount}
      />

      <DrawerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        walletConnected={walletConnected}
        onConnectWallet={onConnectWallet}
        onDisconnect={onDisconnect}
        onNavigate={onNavigate}
      />

      <MobileSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={onSearch}
        recentSearches={['Bitcoin ETF', 'Elections 2024', 'World Cup']}
        popularSearches={['Crypto', 'Sports', 'Politics', 'Tech', 'Entertainment']}
      />

      <main>{children}</main>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}

export default MobileNavigation
