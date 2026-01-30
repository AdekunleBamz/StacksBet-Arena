import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react'
import { 
  FiBell, FiCheck, FiX, FiAlertTriangle, FiInfo, FiCheckCircle,
  FiXCircle, FiTrendingUp, FiDollarSign, FiGift, FiAward,
  FiClock, FiMessageSquare, FiSettings, FiTrash2, FiVolume2, FiVolumeX
} from 'react-icons/fi'

/**
 * Notification system for StacksBet Arena
 */

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  BET_PLACED: 'bet_placed',
  BET_WON: 'bet_won',
  BET_LOST: 'bet_lost',
  MARKET_RESOLVED: 'market_resolved',
  MARKET_CREATED: 'market_created',
  REWARD_EARNED: 'reward_earned',
  SYSTEM: 'system'
}

// Notification icons mapping
const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.SUCCESS]: FiCheckCircle,
  [NOTIFICATION_TYPES.ERROR]: FiXCircle,
  [NOTIFICATION_TYPES.WARNING]: FiAlertTriangle,
  [NOTIFICATION_TYPES.INFO]: FiInfo,
  [NOTIFICATION_TYPES.BET_PLACED]: FiTrendingUp,
  [NOTIFICATION_TYPES.BET_WON]: FiDollarSign,
  [NOTIFICATION_TYPES.BET_LOST]: FiTrendingUp,
  [NOTIFICATION_TYPES.MARKET_RESOLVED]: FiCheck,
  [NOTIFICATION_TYPES.MARKET_CREATED]: FiTrendingUp,
  [NOTIFICATION_TYPES.REWARD_EARNED]: FiGift,
  [NOTIFICATION_TYPES.SYSTEM]: FiBell
}

// Notification colors
const NOTIFICATION_COLORS = {
  [NOTIFICATION_TYPES.SUCCESS]: 'bg-green-500/20 border-green-500 text-green-400',
  [NOTIFICATION_TYPES.ERROR]: 'bg-red-500/20 border-red-500 text-red-400',
  [NOTIFICATION_TYPES.WARNING]: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  [NOTIFICATION_TYPES.INFO]: 'bg-blue-500/20 border-blue-500 text-blue-400',
  [NOTIFICATION_TYPES.BET_PLACED]: 'bg-purple-500/20 border-purple-500 text-purple-400',
  [NOTIFICATION_TYPES.BET_WON]: 'bg-green-500/20 border-green-500 text-green-400',
  [NOTIFICATION_TYPES.BET_LOST]: 'bg-red-500/20 border-red-500 text-red-400',
  [NOTIFICATION_TYPES.MARKET_RESOLVED]: 'bg-blue-500/20 border-blue-500 text-blue-400',
  [NOTIFICATION_TYPES.MARKET_CREATED]: 'bg-purple-500/20 border-purple-500 text-purple-400',
  [NOTIFICATION_TYPES.REWARD_EARNED]: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  [NOTIFICATION_TYPES.SYSTEM]: 'bg-slate-500/20 border-slate-500 text-slate-400'
}

// Notification Context
const NotificationContext = createContext(null)

/**
 * Notification Provider
 */
export const NotificationProvider = ({ children, maxNotifications = 50 }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [toasts, setToasts] = useState([])
  
  // Add notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      return updated.slice(0, maxNotifications)
    })
    setUnreadCount(prev => prev + 1)

    // Play sound if enabled
    if (soundEnabled && notification.playSound !== false) {
      playNotificationSound(notification.type)
    }

    return newNotification.id
  }, [maxNotifications, soundEnabled])

  // Add toast (temporary notification)
  const addToast = useCallback((toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast = {
      id,
      duration: 5000,
      ...toast
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [])

  // Remove toast
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Mark as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  // Remove notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id)
      if (notification && !notification.read) {
        setUnreadCount(c => Math.max(0, c - 1))
      }
      return prev.filter(n => n.id !== id)
    })
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev)
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      soundEnabled,
      toasts,
      addNotification,
      addToast,
      removeToast,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      toggleSound
    }}>
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  )
}

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

// Play notification sound
const playNotificationSound = (type) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different sounds for different types
    const frequencies = {
      [NOTIFICATION_TYPES.SUCCESS]: 880,
      [NOTIFICATION_TYPES.ERROR]: 220,
      [NOTIFICATION_TYPES.WARNING]: 440,
      [NOTIFICATION_TYPES.BET_WON]: 1046.5,
      default: 659.25
    }

    oscillator.frequency.value = frequencies[type] || frequencies.default
    oscillator.type = 'sine'
    gainNode.gain.value = 0.1

    oscillator.start()
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch (e) {
    // Audio not supported
  }
}

/**
 * Toast Container
 */
const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

/**
 * Individual Toast
 */
const Toast = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false)
  const Icon = NOTIFICATION_ICONS[toast.type] || FiBell

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 200)
  }

  return (
    <div
      className={`
        pointer-events-auto
        ${NOTIFICATION_COLORS[toast.type] || NOTIFICATION_COLORS[NOTIFICATION_TYPES.INFO]}
        border rounded-lg p-4 shadow-lg
        transform transition-all duration-200
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        animate-slideIn
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="font-semibold text-white">{toast.title}</p>
          )}
          <p className="text-sm text-slate-300">{toast.message}</p>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      {toast.duration > 0 && (
        <div className="mt-3 h-0.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-current rounded-full"
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-slideIn { animation: slideIn 0.2s ease-out; }
      `}</style>
    </div>
  )
}

/**
 * Notification Bell Button
 */
export const NotificationBell = ({ onClick, className = '' }) => {
  const { unreadCount } = useNotifications()

  return (
    <button
      onClick={onClick}
      className={`
        relative p-2 text-slate-400 hover:text-white
        transition-colors ${className}
      `}
    >
      <FiBell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="
          absolute -top-1 -right-1
          min-w-[20px] h-5 px-1.5
          bg-red-500 rounded-full
          text-xs text-white font-bold
          flex items-center justify-center
          animate-bounce
        ">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

/**
 * Notification Panel
 */
export const NotificationPanel = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const {
    notifications,
    unreadCount,
    soundEnabled,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    toggleSound
  } = useNotifications()

  const panelRef = useRef(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      className={`
        absolute right-0 top-full mt-2
        w-96 max-w-[calc(100vw-2rem)]
        bg-slate-900 border border-slate-700
        rounded-xl shadow-2xl
        overflow-hidden z-50
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-1.5 text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <FiVolume2 className="w-4 h-4" /> : <FiVolumeX className="w-4 h-4" />}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <FiBell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No notifications yet</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={() => markAsRead(notification.id)}
              onRemove={() => removeNotification(notification.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-slate-700 flex justify-between">
          <button
            onClick={clearAll}
            className="text-sm text-slate-400 hover:text-red-400 flex items-center gap-1"
          >
            <FiTrash2 className="w-4 h-4" />
            Clear all
          </button>
          <button
            onClick={onClose}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            View all
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Individual Notification Item
 */
const NotificationItem = ({ notification, onRead, onRemove }) => {
  const Icon = NOTIFICATION_ICONS[notification.type] || FiBell
  const colorClass = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS[NOTIFICATION_TYPES.INFO]

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div
      className={`
        p-4 border-b border-slate-800 last:border-b-0
        hover:bg-slate-800/50 cursor-pointer
        ${!notification.read ? 'bg-slate-800/30' : ''}
      `}
      onClick={onRead}
    >
      <div className="flex gap-3">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
          ${colorClass.split(' ')[0]}
        `}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`font-medium ${notification.read ? 'text-slate-400' : 'text-white'}`}>
              {notification.title}
            </p>
            {!notification.read && (
              <span className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-2" />
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {formatTime(notification.timestamp)}
            </span>
            {notification.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  notification.action.onClick?.()
                }}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                {notification.action.label}
              </button>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="text-slate-500 hover:text-red-400 transition-colors p-1"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/**
 * Notification Preferences
 */
export const NotificationPreferences = ({ onChange }) => {
  const [preferences, setPreferences] = useState({
    betUpdates: true,
    marketResolutions: true,
    rewards: true,
    promotions: false,
    systemAlerts: true,
    email: false,
    push: true
  })

  const updatePreference = (key, value) => {
    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    onChange?.(updated)
  }

  const PreferenceToggle = ({ id, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => updatePreference(id, !preferences[id])}
        className={`
          relative w-12 h-6 rounded-full transition-colors
          ${preferences[id] ? 'bg-purple-500' : 'bg-slate-600'}
        `}
      >
        <span
          className={`
            absolute top-1 w-4 h-4 rounded-full bg-white
            transition-transform
            ${preferences[id] ? 'left-7' : 'left-1'}
          `}
        />
      </button>
    </div>
  )

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <FiSettings className="w-5 h-5" />
        Notification Preferences
      </h3>

      <div className="divide-y divide-slate-700">
        <PreferenceToggle
          id="betUpdates"
          label="Bet Updates"
          description="Get notified when your bets are placed or resolved"
        />
        <PreferenceToggle
          id="marketResolutions"
          label="Market Resolutions"
          description="Notifications when markets you're in get resolved"
        />
        <PreferenceToggle
          id="rewards"
          label="Rewards & Achievements"
          description="Earn badges and unlock new achievements"
        />
        <PreferenceToggle
          id="promotions"
          label="Promotions"
          description="Special offers and promotional events"
        />
        <PreferenceToggle
          id="systemAlerts"
          label="System Alerts"
          description="Important platform updates and maintenance"
        />
      </div>

      <div className="mt-6 pt-4 border-t border-slate-700">
        <h4 className="text-white font-medium mb-3">Delivery Methods</h4>
        <div className="space-y-3">
          <PreferenceToggle
            id="push"
            label="Push Notifications"
            description="Browser push notifications"
          />
          <PreferenceToggle
            id="email"
            label="Email Notifications"
            description="Receive notifications via email"
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Utility function to create notification helpers
 */
export const createNotificationHelpers = (addNotification, addToast) => ({
  notifyBetPlaced: (market, amount, outcome) => {
    addNotification({
      type: NOTIFICATION_TYPES.BET_PLACED,
      title: 'Bet Placed Successfully',
      message: `You bet ${amount} STX on "${outcome}" in "${market}"`
    })
    addToast({
      type: NOTIFICATION_TYPES.SUCCESS,
      title: 'Bet Placed!',
      message: `${amount} STX on "${outcome}"`,
      duration: 3000
    })
  },

  notifyBetWon: (market, winnings) => {
    addNotification({
      type: NOTIFICATION_TYPES.BET_WON,
      title: 'Congratulations! You Won! 🎉',
      message: `You won ${winnings} STX on "${market}"`
    })
    addToast({
      type: NOTIFICATION_TYPES.SUCCESS,
      title: 'You Won!',
      message: `+${winnings} STX`,
      duration: 5000
    })
  },

  notifyBetLost: (market) => {
    addNotification({
      type: NOTIFICATION_TYPES.BET_LOST,
      title: 'Better Luck Next Time',
      message: `Your bet on "${market}" did not win`
    })
  },

  notifyError: (message) => {
    addToast({
      type: NOTIFICATION_TYPES.ERROR,
      title: 'Error',
      message,
      duration: 5000
    })
  },

  notifySuccess: (message) => {
    addToast({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      duration: 3000
    })
  }
})

export default NotificationProvider
