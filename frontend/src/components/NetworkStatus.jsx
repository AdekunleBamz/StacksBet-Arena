import React, { useState, useEffect, useCallback } from 'react'
import { HiStatusOnline, HiStatusOffline, HiRefresh } from 'react-icons/hi'

/**
 * Network and blockchain status indicator
 * Shows connection status, block height, and network health
 */

// Hook for network status
export const useNetworkStatus = (apiUrl, pollInterval = 30000) => {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    blockHeight: null,
    lastUpdated: null,
    isLoading: true,
    error: null
  })

  const fetchStatus = useCallback(async () => {
    if (!navigator.onLine) {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        isLoading: false,
        error: 'No internet connection'
      }))
      return
    }

    try {
      const response = await fetch(`${apiUrl}/extended/v1/status`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      
      const data = await response.json()
      
      setStatus({
        isOnline: true,
        blockHeight: data.chain_tip?.block_height,
        lastUpdated: new Date(),
        isLoading: false,
        error: null
      })
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }))
    }
  }, [apiUrl])

  // Initial fetch and polling
  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, pollInterval)
    return () => clearInterval(interval)
  }, [fetchStatus, pollInterval])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }))
      fetchStatus()
    }
    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false, error: 'No internet connection' }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [fetchStatus])

  return { ...status, refetch: fetchStatus }
}

// Main status indicator component
const NetworkStatusIndicator = ({
  apiUrl = 'https://api.mainnet.hiro.so',
  showBlockHeight = true,
  showRefresh = true,
  compact = false,
  className = ''
}) => {
  const { isOnline, blockHeight, lastUpdated, isLoading, error, refetch } = useNetworkStatus(apiUrl)

  const formatTime = (date) => {
    if (!date) return ''
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (compact) {
    return (
      <div 
        className={`inline-flex items-center gap-2 ${className}`}
        title={isOnline ? `Block: ${blockHeight?.toLocaleString()}` : error || 'Offline'}
      >
        <span 
          className={`w-2 h-2 rounded-full ${isOnline ? 'bg-arena-green animate-pulse' : 'bg-red-500'}`}
          aria-hidden="true"
        />
        <span className="text-xs text-gray-400">
          {isOnline ? 'Connected' : 'Offline'}
        </span>
      </div>
    )
  }

  return (
    <div className={`glass-card p-4 rounded-xl ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Status icon */}
          {isOnline ? (
            <div className="relative">
              <HiStatusOnline className="w-6 h-6 text-arena-green" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-arena-green rounded-full animate-ping" />
            </div>
          ) : (
            <HiStatusOffline className="w-6 h-6 text-red-500" />
          )}

          {/* Status text */}
          <div>
            <p className={`font-medium ${isOnline ? 'text-arena-green' : 'text-red-500'}`}>
              {isLoading ? 'Connecting...' : isOnline ? 'Connected' : 'Disconnected'}
            </p>
            {error && !isOnline && (
              <p className="text-xs text-red-400">{error}</p>
            )}
          </div>
        </div>

        {/* Refresh button */}
        {showRefresh && (
          <button
            onClick={refetch}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-arena-purple/20 transition-colors disabled:opacity-50"
            aria-label="Refresh status"
          >
            <HiRefresh className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Block height and last updated */}
      {isOnline && showBlockHeight && (
        <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between text-sm">
          <div>
            <span className="text-gray-500">Block Height: </span>
            <span className="text-white font-mono">{blockHeight?.toLocaleString() || '...'}</span>
          </div>
          {lastUpdated && (
            <span className="text-gray-500">
              Updated {formatTime(lastUpdated)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Inline status badge
export const NetworkBadge = ({
  apiUrl = 'https://api.mainnet.hiro.so',
  network = 'mainnet',
  className = ''
}) => {
  const { isOnline, blockHeight, isLoading } = useNetworkStatus(apiUrl)

  const networkStyles = {
    mainnet: 'bg-arena-green/20 text-arena-green border-arena-green/30',
    testnet: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  }

  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${networkStyles[network]} ${className}`}
    >
      <span 
        className={`w-2 h-2 rounded-full ${
          isLoading ? 'bg-gray-500 animate-pulse' : isOnline ? 'bg-current animate-pulse' : 'bg-red-500'
        }`}
      />
      <span className="text-sm font-medium capitalize">{network}</span>
      {blockHeight && (
        <span className="text-xs opacity-75 font-mono">#{blockHeight.toLocaleString()}</span>
      )}
    </div>
  )
}

// Floating status bar for bottom of page
export const NetworkStatusBar = ({
  apiUrl = 'https://api.mainnet.hiro.so',
  className = ''
}) => {
  const { isOnline, blockHeight, error } = useNetworkStatus(apiUrl)

  if (isOnline && !error) return null

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 py-2 px-4 text-center text-sm z-40 ${
        isOnline ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
      } ${className}`}
      role="alert"
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <HiStatusOnline className="w-4 h-4" />
        ) : (
          <HiStatusOffline className="w-4 h-4" />
        )}
        <span>
          {isOnline 
            ? error || 'Connection issue detected'
            : 'You are offline. Some features may not work.'
          }
        </span>
      </div>
    </div>
  )
}

export default NetworkStatusIndicator
