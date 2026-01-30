import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react'
import { FiCommand, FiSearch, FiHome, FiTrendingUp, FiUser, FiSettings, FiHelpCircle, FiX } from 'react-icons/fi'

/**
 * Keyboard shortcuts system for StacksBet Arena
 */

// Default keyboard shortcuts
const DEFAULT_SHORTCUTS = {
  // Navigation
  'g h': { description: 'Go to Home', category: 'Navigation', action: 'navigate', path: '/' },
  'g m': { description: 'Go to Markets', category: 'Navigation', action: 'navigate', path: '/markets' },
  'g l': { description: 'Go to Leaderboard', category: 'Navigation', action: 'navigate', path: '/leaderboard' },
  'g p': { description: 'Go to Profile', category: 'Navigation', action: 'navigate', path: '/profile' },
  'g s': { description: 'Go to Settings', category: 'Navigation', action: 'navigate', path: '/settings' },
  
  // Actions
  '/': { description: 'Focus Search', category: 'Actions', action: 'search' },
  'c': { description: 'Create New Market', category: 'Actions', action: 'navigate', path: '/create' },
  'n': { description: 'Show Notifications', category: 'Actions', action: 'notifications' },
  'Escape': { description: 'Close Modal / Cancel', category: 'Actions', action: 'escape' },
  
  // UI Controls
  '?': { description: 'Show Keyboard Shortcuts', category: 'UI', action: 'help' },
  't': { description: 'Toggle Theme', category: 'UI', action: 'toggleTheme' },
  'r': { description: 'Refresh Data', category: 'UI', action: 'refresh' },
  
  // Betting
  'y': { description: 'Bet Yes (when in market)', category: 'Betting', action: 'betYes' },
  'o': { description: 'Bet No (when in market)', category: 'Betting', action: 'betNo' },
  'Enter': { description: 'Confirm Bet', category: 'Betting', action: 'confirmBet' }
}

// Keyboard context
const KeyboardContext = createContext(null)

/**
 * Hook to parse key combinations
 */
const parseKeyCombo = (event) => {
  const keys = []
  
  if (event.metaKey) keys.push('Meta')
  if (event.ctrlKey) keys.push('Ctrl')
  if (event.altKey) keys.push('Alt')
  if (event.shiftKey) keys.push('Shift')
  
  // Don't add modifier keys themselves
  if (!['Meta', 'Control', 'Alt', 'Shift'].includes(event.key)) {
    keys.push(event.key)
  }
  
  return keys.join('+')
}

/**
 * Keyboard Provider
 */
export const KeyboardProvider = ({
  children,
  shortcuts = DEFAULT_SHORTCUTS,
  onNavigate,
  onAction
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [pendingKeys, setPendingKeys] = useState('')
  const [enabled, setEnabled] = useState(true)
  const timeoutRef = useRef(null)

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't handle if disabled
      if (!enabled) return

      // Don't handle if user is typing in an input
      const target = event.target
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Exception: Escape should always work
        if (event.key !== 'Escape') return
      }

      // Handle sequence shortcuts (like 'g h')
      const key = event.key.toLowerCase()
      
      // Clear timeout if exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Build current sequence
      const currentSequence = pendingKeys ? `${pendingKeys} ${key}` : key
      
      // Check if matches a shortcut
      const shortcut = shortcuts[currentSequence] || shortcuts[key] || shortcuts[event.key]
      
      if (shortcut) {
        event.preventDefault()
        handleAction(shortcut)
        setPendingKeys('')
        return
      }

      // Check if could be start of a sequence
      const couldBeSequence = Object.keys(shortcuts).some(k => k.startsWith(currentSequence))
      
      if (couldBeSequence) {
        setPendingKeys(currentSequence)
        // Reset after 1 second
        timeoutRef.current = setTimeout(() => {
          setPendingKeys('')
        }, 1000)
      } else {
        setPendingKeys('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [shortcuts, pendingKeys, enabled])

  // Handle action
  const handleAction = useCallback((shortcut) => {
    switch (shortcut.action) {
      case 'navigate':
        onNavigate?.(shortcut.path)
        break
      case 'search':
        onAction?.('search')
        break
      case 'notifications':
        onAction?.('notifications')
        break
      case 'escape':
        onAction?.('escape')
        setIsHelpOpen(false)
        break
      case 'help':
        setIsHelpOpen(true)
        break
      case 'toggleTheme':
        onAction?.('toggleTheme')
        break
      case 'refresh':
        onAction?.('refresh')
        break
      case 'betYes':
        onAction?.('betYes')
        break
      case 'betNo':
        onAction?.('betNo')
        break
      case 'confirmBet':
        onAction?.('confirmBet')
        break
      default:
        onAction?.(shortcut.action, shortcut)
    }
  }, [onNavigate, onAction])

  return (
    <KeyboardContext.Provider value={{
      shortcuts,
      isHelpOpen,
      setIsHelpOpen,
      pendingKeys,
      enabled,
      setEnabled
    }}>
      {children}
      {pendingKeys && <KeySequenceIndicator keys={pendingKeys} />}
      <KeyboardShortcutsHelp />
    </KeyboardContext.Provider>
  )
}

// Hook to use keyboard shortcuts
export const useKeyboard = () => {
  const context = useContext(KeyboardContext)
  if (!context) {
    throw new Error('useKeyboard must be used within KeyboardProvider')
  }
  return context
}

/**
 * Key Sequence Indicator
 */
const KeySequenceIndicator = ({ keys }) => {
  return (
    <div className="
      fixed bottom-24 left-1/2 transform -translate-x-1/2
      bg-slate-800 border border-slate-600
      px-4 py-2 rounded-lg
      text-white font-mono text-lg
      shadow-xl z-50
    ">
      Waiting for: <span className="text-purple-400">{keys}</span>...
    </div>
  )
}

/**
 * Keyboard Shortcuts Help Modal
 */
const KeyboardShortcutsHelp = () => {
  const { shortcuts, isHelpOpen, setIsHelpOpen } = useKeyboard()

  // Group shortcuts by category
  const groupedShortcuts = Object.entries(shortcuts).reduce((acc, [key, shortcut]) => {
    const category = shortcut.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push({ key, ...shortcut })
    return acc
  }, {})

  if (!isHelpOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsHelpOpen(false)}
      />

      {/* Modal */}
      <div className="
        relative bg-slate-900 border border-slate-700
        rounded-xl shadow-2xl
        max-w-2xl w-full max-h-[80vh]
        overflow-hidden
      ">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FiCommand className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
              <p className="text-sm text-slate-400">Press ? anytime to view this help</p>
            </div>
          </div>
          <button
            onClick={() => setIsHelpOpen(false)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(groupedShortcuts).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <ShortcutItem key={item.key} shortcut={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <p className="text-sm text-slate-400 text-center">
            Press <Kbd>Escape</Kbd> to close this dialog
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Shortcut Item
 */
const ShortcutItem = ({ shortcut }) => {
  const keys = shortcut.key.split(' ')

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-slate-300">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <Kbd>{formatKey(key)}</Kbd>
            {index < keys.length - 1 && (
              <span className="text-slate-500 mx-1">then</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/**
 * Keyboard Key Display
 */
export const Kbd = ({ children, className = '' }) => {
  return (
    <kbd className={`
      inline-flex items-center justify-center
      min-w-[24px] h-6 px-2
      bg-slate-700 border border-slate-600
      rounded text-xs font-mono text-slate-200
      shadow-[0_2px_0_0_rgba(0,0,0,0.3)]
      ${className}
    `}>
      {children}
    </kbd>
  )
}

// Format key for display
const formatKey = (key) => {
  const keyMap = {
    'Meta': '⌘',
    'Ctrl': 'Ctrl',
    'Alt': 'Alt',
    'Shift': '⇧',
    'Enter': '↵',
    'Escape': 'Esc',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    ' ': 'Space',
    '/': '/',
    '?': '?'
  }
  return keyMap[key] || key.toUpperCase()
}

/**
 * Hook for registering custom shortcuts
 */
export const useShortcut = (key, callback, deps = []) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (event.key !== 'Escape') return
      }

      const combo = parseKeyCombo(event)
      if (combo === key || event.key === key) {
        event.preventDefault()
        callback(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, callback, ...deps])
}

/**
 * Command Palette (Spotlight-style)
 */
export const CommandPalette = ({
  isOpen,
  onClose,
  commands = [],
  onCommand,
  placeholder = 'Type a command or search...'
}) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Filter commands
  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.keywords?.some(k => k.toLowerCase().includes(query.toLowerCase()))
  )

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(i => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            onCommand?.(filteredCommands[selectedIndex])
            onClose()
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredCommands, selectedIndex, onCommand, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="
        relative w-full max-w-xl
        bg-slate-900 border border-slate-700
        rounded-xl shadow-2xl overflow-hidden
      ">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-700">
          <FiSearch className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder={placeholder}
            className="
              flex-1 bg-transparent
              text-white placeholder-slate-500
              outline-none text-lg
            "
          />
          <Kbd>Esc</Kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-400">No commands found</p>
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon || FiCommand
              const isSelected = index === selectedIndex

              return (
                <button
                  key={cmd.id || index}
                  onClick={() => {
                    onCommand?.(cmd)
                    onClose()
                  }}
                  className={`
                    w-full px-4 py-3
                    flex items-center gap-3
                    transition-colors
                    ${isSelected ? 'bg-purple-500/20' : 'hover:bg-slate-800'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-400' : 'text-slate-400'}`} />
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {cmd.label}
                    </p>
                    {cmd.description && (
                      <p className="text-sm text-slate-500">{cmd.description}</p>
                    )}
                  </div>
                  {cmd.shortcut && (
                    <Kbd>{cmd.shortcut}</Kbd>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd><Kbd>↓</Kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd> to select
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Default commands for command palette
 */
export const DEFAULT_COMMANDS = [
  { id: 'home', label: 'Go to Home', icon: FiHome, shortcut: 'G H', action: { type: 'navigate', path: '/' } },
  { id: 'markets', label: 'Browse Markets', icon: FiTrendingUp, shortcut: 'G M', action: { type: 'navigate', path: '/markets' } },
  { id: 'profile', label: 'View Profile', icon: FiUser, shortcut: 'G P', action: { type: 'navigate', path: '/profile' } },
  { id: 'settings', label: 'Settings', icon: FiSettings, shortcut: 'G S', action: { type: 'navigate', path: '/settings' } },
  { id: 'help', label: 'Keyboard Shortcuts', icon: FiHelpCircle, shortcut: '?', action: { type: 'help' } },
  { id: 'search', label: 'Search Markets', icon: FiSearch, shortcut: '/', action: { type: 'search' } }
]

export default KeyboardProvider
