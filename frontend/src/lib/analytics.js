import { useCallback, useEffect, useRef } from 'react'

/**
 * Analytics utilities and hooks for StacksBet Arena
 * Privacy-focused analytics without external dependencies
 */

// Event types
export const ANALYTICS_EVENTS = {
  // Page views
  PAGE_VIEW: 'page_view',
  
  // User actions
  WALLET_CONNECTED: 'wallet_connected',
  WALLET_DISCONNECTED: 'wallet_disconnected',
  
  // Market events
  MARKET_VIEWED: 'market_viewed',
  MARKET_CREATED: 'market_created',
  MARKET_SHARED: 'market_shared',
  
  // Betting events
  BET_STARTED: 'bet_started',
  BET_CONFIRMED: 'bet_confirmed',
  BET_CANCELLED: 'bet_cancelled',
  
  // UI interactions
  BUTTON_CLICK: 'button_click',
  LINK_CLICK: 'link_click',
  MODAL_OPENED: 'modal_opened',
  MODAL_CLOSED: 'modal_closed',
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  TX_FAILED: 'transaction_failed',
  
  // Performance
  PERFORMANCE_METRIC: 'performance_metric',
  
  // Engagement
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page'
}

// Analytics configuration
const config = {
  enabled: true,
  debug: process.env.NODE_ENV === 'development',
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  endpoint: '/api/analytics',
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxQueueSize: 100
}

// Event queue for batching
let eventQueue = []
let flushTimer = null
let sessionId = null
let sessionStartTime = null
let lastActivityTime = null

/**
 * Generate unique session ID
 */
const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get or create session
 */
const getSession = () => {
  const now = Date.now()
  
  // Check if session exists and is still valid
  if (sessionId && lastActivityTime && (now - lastActivityTime) < config.sessionTimeout) {
    lastActivityTime = now
    return sessionId
  }
  
  // Create new session
  sessionId = generateSessionId()
  sessionStartTime = now
  lastActivityTime = now
  
  // Track session start
  trackEvent(ANALYTICS_EVENTS.SESSION_START, {
    sessionId,
    referrer: document.referrer,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language
  })
  
  return sessionId
}

/**
 * Get device info
 */
const getDeviceInfo = () => {
  const ua = navigator.userAgent
  
  const isMobile = /Mobile|Android|iPhone|iPad/.test(ua)
  const isTablet = /iPad|Tablet/.test(ua)
  
  let browser = 'Unknown'
  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Edge')) browser = 'Edge'
  
  let os = 'Unknown'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iOS') || ua.includes('iPhone')) os = 'iOS'
  
  return {
    deviceType: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    browser,
    os,
    touchEnabled: 'ontouchstart' in window
  }
}

/**
 * Track an analytics event
 */
export const trackEvent = (eventName, properties = {}) => {
  if (!config.enabled) return
  
  const event = {
    event: eventName,
    timestamp: new Date().toISOString(),
    sessionId: getSession(),
    url: window.location.pathname,
    ...getDeviceInfo(),
    properties
  }
  
  if (config.debug) {
    console.log('[Analytics]', eventName, properties)
  }
  
  // Add to queue
  eventQueue.push(event)
  
  // Flush if queue is full
  if (eventQueue.length >= config.batchSize) {
    flushEvents()
  }
  
  // Ensure flush timer is running
  if (!flushTimer) {
    flushTimer = setInterval(flushEvents, config.flushInterval)
  }
  
  // Trim queue if too large
  if (eventQueue.length > config.maxQueueSize) {
    eventQueue = eventQueue.slice(-config.maxQueueSize)
  }
}

/**
 * Flush events to server
 */
const flushEvents = async () => {
  if (eventQueue.length === 0) return
  
  const events = [...eventQueue]
  eventQueue = []
  
  try {
    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(events)], { type: 'application/json' })
      navigator.sendBeacon(config.endpoint, blob)
    } else {
      // Fallback to fetch
      await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(events),
        keepalive: true
      })
    }
  } catch (error) {
    if (config.debug) {
      console.error('[Analytics] Failed to send events:', error)
    }
    // Put events back in queue
    eventQueue = [...events, ...eventQueue].slice(-config.maxQueueSize)
  }
}

/**
 * Track page view
 */
export const trackPageView = (pageName, properties = {}) => {
  trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
    pageName,
    title: document.title,
    referrer: document.referrer,
    ...properties
  })
}

/**
 * Track error
 */
export const trackError = (error, context = {}) => {
  trackEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
    message: error.message || String(error),
    stack: error.stack,
    ...context
  })
}

/**
 * Track performance metric
 */
export const trackPerformance = (metric, value, unit = 'ms') => {
  trackEvent(ANALYTICS_EVENTS.PERFORMANCE_METRIC, {
    metric,
    value,
    unit
  })
}

// Hook: Track page views
export const usePageTracking = (pageName) => {
  useEffect(() => {
    trackPageView(pageName)
  }, [pageName])
}

// Hook: Track time on page
export const useTimeOnPage = (pageName) => {
  const startTime = useRef(Date.now())
  
  useEffect(() => {
    startTime.current = Date.now()
    
    return () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000)
      trackEvent(ANALYTICS_EVENTS.TIME_ON_PAGE, {
        pageName,
        timeSpent,
        unit: 'seconds'
      })
    }
  }, [pageName])
}

// Hook: Track scroll depth
export const useScrollDepth = (thresholds = [25, 50, 75, 100]) => {
  const trackedDepths = useRef(new Set())
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100)
      
      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !trackedDepths.current.has(threshold)) {
          trackedDepths.current.add(threshold)
          trackEvent(ANALYTICS_EVENTS.SCROLL_DEPTH, {
            depth: threshold,
            url: window.location.pathname
          })
        }
      })
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [thresholds])
}

// Hook: Track click events
export const useClickTracking = () => {
  const trackClick = useCallback((eventName, properties = {}) => {
    trackEvent(ANALYTICS_EVENTS.BUTTON_CLICK, {
      eventName,
      ...properties
    })
  }, [])
  
  return trackClick
}

// Hook: Track market interactions
export const useMarketTracking = () => {
  const trackMarketView = useCallback((marketId, marketTitle) => {
    trackEvent(ANALYTICS_EVENTS.MARKET_VIEWED, {
      marketId,
      marketTitle
    })
  }, [])
  
  const trackMarketShare = useCallback((marketId, platform) => {
    trackEvent(ANALYTICS_EVENTS.MARKET_SHARED, {
      marketId,
      platform
    })
  }, [])
  
  const trackBet = useCallback((action, data) => {
    const eventMap = {
      start: ANALYTICS_EVENTS.BET_STARTED,
      confirm: ANALYTICS_EVENTS.BET_CONFIRMED,
      cancel: ANALYTICS_EVENTS.BET_CANCELLED
    }
    trackEvent(eventMap[action] || ANALYTICS_EVENTS.BET_STARTED, data)
  }, [])
  
  return { trackMarketView, trackMarketShare, trackBet }
}

// Hook: Track wallet events
export const useWalletTracking = () => {
  const trackWalletConnect = useCallback((walletType) => {
    trackEvent(ANALYTICS_EVENTS.WALLET_CONNECTED, {
      walletType
    })
  }, [])
  
  const trackWalletDisconnect = useCallback(() => {
    trackEvent(ANALYTICS_EVENTS.WALLET_DISCONNECTED)
  }, [])
  
  return { trackWalletConnect, trackWalletDisconnect }
}

// Hook: Track search
export const useSearchTracking = () => {
  const trackSearch = useCallback((query, resultCount) => {
    trackEvent(ANALYTICS_EVENTS.SEARCH_PERFORMED, {
      query,
      resultCount,
      hasResults: resultCount > 0
    })
  }, [])
  
  const trackFilter = useCallback((filterType, filterValue) => {
    trackEvent(ANALYTICS_EVENTS.FILTER_APPLIED, {
      filterType,
      filterValue
    })
  }, [])
  
  return { trackSearch, trackFilter }
}

// Hook: Track Core Web Vitals
export const useCoreWebVitals = () => {
  useEffect(() => {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      trackPerformance('LCP', Math.round(lastEntry.startTime))
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
    
    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        trackPerformance('FID', Math.round(entry.processingStart - entry.startTime))
      })
    })
    fidObserver.observe({ type: 'first-input', buffered: true })
    
    // Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })
    
    // Report CLS on page unload
    const reportCLS = () => {
      trackPerformance('CLS', Math.round(clsValue * 1000) / 1000)
    }
    
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        reportCLS()
      }
    })
    
    return () => {
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])
}

// Flush events before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents()
    }
  })
  
  window.addEventListener('pagehide', flushEvents)
  window.addEventListener('beforeunload', flushEvents)
}

/**
 * Analytics Provider Component
 */
export const AnalyticsProvider = ({ children, enabled = true }) => {
  useEffect(() => {
    config.enabled = enabled
    
    if (enabled) {
      // Initialize session
      getSession()
      
      // Track initial page view
      trackPageView(window.location.pathname)
    }
    
    return () => {
      // Cleanup
      if (flushTimer) {
        clearInterval(flushTimer)
        flushTimer = null
      }
      flushEvents()
    }
  }, [enabled])
  
  return children
}

// Export everything
export default {
  trackEvent,
  trackPageView,
  trackError,
  trackPerformance,
  ANALYTICS_EVENTS,
  usePageTracking,
  useTimeOnPage,
  useScrollDepth,
  useClickTracking,
  useMarketTracking,
  useWalletTracking,
  useSearchTracking,
  useCoreWebVitals,
  AnalyticsProvider
}
