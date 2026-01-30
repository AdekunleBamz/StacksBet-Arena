import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

/**
 * Local Storage utilities and hooks for StacksBet Arena
 * Provides persistent state management with SSR safety
 */

// Storage prefix for namespacing
const STORAGE_PREFIX = 'stacksbet_'

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Serialize value for storage
 */
const serialize = (value) => {
  try {
    return JSON.stringify({
      value,
      timestamp: Date.now()
    })
  } catch {
    return null
  }
}

/**
 * Deserialize value from storage
 */
const deserialize = (raw) => {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Get item from storage with prefix
 */
export const getStorageItem = (key, defaultValue = null) => {
  if (!isStorageAvailable()) return defaultValue
  
  try {
    const prefixedKey = STORAGE_PREFIX + key
    const raw = localStorage.getItem(prefixedKey)
    
    if (raw === null) return defaultValue
    
    const parsed = deserialize(raw)
    return parsed?.value ?? defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Set item in storage with prefix
 */
export const setStorageItem = (key, value) => {
  if (!isStorageAvailable()) return false
  
  try {
    const prefixedKey = STORAGE_PREFIX + key
    const serialized = serialize(value)
    
    if (serialized === null) return false
    
    localStorage.setItem(prefixedKey, serialized)
    
    // Dispatch custom event for cross-tab sync
    window.dispatchEvent(new CustomEvent('storage-change', {
      detail: { key: prefixedKey, value }
    }))
    
    return true
  } catch {
    return false
  }
}

/**
 * Remove item from storage
 */
export const removeStorageItem = (key) => {
  if (!isStorageAvailable()) return false
  
  try {
    const prefixedKey = STORAGE_PREFIX + key
    localStorage.removeItem(prefixedKey)
    
    window.dispatchEvent(new CustomEvent('storage-change', {
      detail: { key: prefixedKey, value: null }
    }))
    
    return true
  } catch {
    return false
  }
}

/**
 * Clear all app storage
 */
export const clearAppStorage = () => {
  if (!isStorageAvailable()) return false
  
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
    return true
  } catch {
    return false
  }
}

/**
 * Get storage size in bytes
 */
export const getStorageSize = () => {
  if (!isStorageAvailable()) return 0
  
  let total = 0
  const keys = Object.keys(localStorage)
  
  keys.forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      const value = localStorage.getItem(key)
      total += key.length + (value?.length || 0)
    }
  })
  
  return total * 2 // UTF-16 characters are 2 bytes
}

/**
 * useLocalStorage Hook
 * Persists state to localStorage with automatic serialization
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const { 
    syncTabs = true,
    onError,
    serialize: customSerialize,
    deserialize: customDeserialize
  } = options

  // Get initial value from storage or use default
  const getStoredValue = useCallback(() => {
    if (typeof window === 'undefined') return initialValue
    
    try {
      const prefixedKey = STORAGE_PREFIX + key
      const item = localStorage.getItem(prefixedKey)
      
      if (item === null) return initialValue
      
      const parsed = customDeserialize 
        ? customDeserialize(item) 
        : deserialize(item)?.value
      
      return parsed ?? initialValue
    } catch (error) {
      onError?.(error)
      return initialValue
    }
  }, [key, initialValue, customDeserialize, onError])

  const [storedValue, setStoredValue] = useState(getStoredValue)

  // Update storage when state changes
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function 
        ? value(storedValue) 
        : value
      
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        const prefixedKey = STORAGE_PREFIX + key
        const serialized = customSerialize 
          ? customSerialize(valueToStore)
          : serialize(valueToStore)
        
        localStorage.setItem(prefixedKey, serialized)
        
        // Notify other instances
        window.dispatchEvent(new CustomEvent('storage-change', {
          detail: { key: prefixedKey, value: valueToStore }
        }))
      }
    } catch (error) {
      onError?.(error)
    }
  }, [key, storedValue, customSerialize, onError])

  // Remove value from storage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      
      if (typeof window !== 'undefined') {
        const prefixedKey = STORAGE_PREFIX + key
        localStorage.removeItem(prefixedKey)
        
        window.dispatchEvent(new CustomEvent('storage-change', {
          detail: { key: prefixedKey, value: null }
        }))
      }
    } catch (error) {
      onError?.(error)
    }
  }, [key, initialValue, onError])

  // Sync across tabs
  useEffect(() => {
    if (!syncTabs || typeof window === 'undefined') return

    const handleStorageChange = (event) => {
      const prefixedKey = STORAGE_PREFIX + key
      
      // Handle native storage event (other tabs)
      if (event.type === 'storage' && event.key === prefixedKey) {
        const parsed = customDeserialize 
          ? customDeserialize(event.newValue)
          : deserialize(event.newValue)?.value
        setStoredValue(parsed ?? initialValue)
      }
      
      // Handle custom storage event (same tab, other hooks)
      if (event.type === 'storage-change' && event.detail?.key === prefixedKey) {
        setStoredValue(event.detail.value ?? initialValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('storage-change', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('storage-change', handleStorageChange)
    }
  }, [key, initialValue, syncTabs, customDeserialize])

  return [storedValue, setValue, removeValue]
}

/**
 * useSessionStorage Hook
 * Same as useLocalStorage but for sessionStorage
 */
export const useSessionStorage = (key, initialValue) => {
  const getStoredValue = useCallback(() => {
    if (typeof window === 'undefined') return initialValue
    
    try {
      const prefixedKey = STORAGE_PREFIX + key
      const item = sessionStorage.getItem(prefixedKey)
      
      if (item === null) return initialValue
      
      const parsed = deserialize(item)
      return parsed?.value ?? initialValue
    } catch {
      return initialValue
    }
  }, [key, initialValue])

  const [storedValue, setStoredValue] = useState(getStoredValue)

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function 
        ? value(storedValue) 
        : value
      
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        const prefixedKey = STORAGE_PREFIX + key
        sessionStorage.setItem(prefixedKey, serialize(valueToStore))
      }
    } catch (error) {
      console.error('Session storage error:', error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

/**
 * useStorageState Hook
 * Unified hook that works with both localStorage and sessionStorage
 */
export const useStorageState = (key, initialValue, storageType = 'local') => {
  if (storageType === 'session') {
    return useSessionStorage(key, initialValue)
  }
  return useLocalStorage(key, initialValue)
}

/**
 * usePersistedReducer Hook
 * Persists reducer state to storage
 */
export const usePersistedReducer = (reducer, initialState, key, options = {}) => {
  const { storage = 'local' } = options
  
  const [persistedState, setPersistedState] = useStorageState(
    key, 
    initialState, 
    storage
  )

  const reducerRef = useRef(reducer)
  reducerRef.current = reducer

  const dispatch = useCallback((action) => {
    setPersistedState(prevState => reducerRef.current(prevState, action))
  }, [setPersistedState])

  return [persistedState, dispatch]
}

/**
 * useStorageObject Hook
 * Manages a storage object with individual property updates
 */
export const useStorageObject = (key, initialObject = {}) => {
  const [object, setObject, removeObject] = useLocalStorage(key, initialObject)

  const setProperty = useCallback((propKey, value) => {
    setObject(prev => ({
      ...prev,
      [propKey]: value
    }))
  }, [setObject])

  const removeProperty = useCallback((propKey) => {
    setObject(prev => {
      const { [propKey]: _, ...rest } = prev
      return rest
    })
  }, [setObject])

  const hasProperty = useCallback((propKey) => {
    return propKey in object
  }, [object])

  return {
    object,
    setObject,
    setProperty,
    removeProperty,
    hasProperty,
    clear: removeObject
  }
}

/**
 * useStorageList Hook
 * Manages a list in storage with common array operations
 */
export const useStorageList = (key, initialList = []) => {
  const [list, setList, clearList] = useLocalStorage(key, initialList)

  const push = useCallback((item) => {
    setList(prev => [...prev, item])
  }, [setList])

  const unshift = useCallback((item) => {
    setList(prev => [item, ...prev])
  }, [setList])

  const pop = useCallback(() => {
    let removed
    setList(prev => {
      removed = prev[prev.length - 1]
      return prev.slice(0, -1)
    })
    return removed
  }, [setList])

  const shift = useCallback(() => {
    let removed
    setList(prev => {
      removed = prev[0]
      return prev.slice(1)
    })
    return removed
  }, [setList])

  const removeAt = useCallback((index) => {
    setList(prev => prev.filter((_, i) => i !== index))
  }, [setList])

  const removeBy = useCallback((predicate) => {
    setList(prev => prev.filter((item, index) => !predicate(item, index)))
  }, [setList])

  const updateAt = useCallback((index, value) => {
    setList(prev => prev.map((item, i) => i === index ? value : item))
  }, [setList])

  const find = useCallback((predicate) => {
    return list.find(predicate)
  }, [list])

  return {
    list,
    setList,
    push,
    unshift,
    pop,
    shift,
    removeAt,
    removeBy,
    updateAt,
    find,
    clear: clearList,
    length: list.length,
    isEmpty: list.length === 0
  }
}

/**
 * useRecentItems Hook
 * Tracks recently accessed items with auto-expiration
 */
export const useRecentItems = (key, options = {}) => {
  const { maxItems = 10, expireAfter = 7 * 24 * 60 * 60 * 1000 } = options // 7 days default
  
  const [items, setItems] = useLocalStorage(key, [])

  // Clean expired items on mount
  useEffect(() => {
    const now = Date.now()
    const valid = items.filter(item => {
      const age = now - (item.timestamp || 0)
      return age < expireAfter
    })
    
    if (valid.length !== items.length) {
      setItems(valid)
    }
  }, []) // Only on mount

  const addItem = useCallback((item) => {
    setItems(prev => {
      // Remove existing if already present (by id)
      const filtered = prev.filter(i => i.id !== item.id)
      
      // Add to beginning with timestamp
      const newItem = {
        ...item,
        timestamp: Date.now()
      }
      
      // Keep only maxItems
      return [newItem, ...filtered].slice(0, maxItems)
    })
  }, [setItems, maxItems])

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [setItems])

  const clearItems = useCallback(() => {
    setItems([])
  }, [setItems])

  return {
    items,
    addItem,
    removeItem,
    clear: clearItems
  }
}

/**
 * useStorageSync Hook
 * Syncs state with storage on specific events
 */
export const useStorageSync = (key, state, options = {}) => {
  const { debounce = 500, syncOnBlur = true, syncOnUnload = true } = options
  
  const timeoutRef = useRef(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // Debounced save
  const save = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setStorageItem(key, stateRef.current)
    }, debounce)
  }, [key, debounce])

  // Immediate save
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setStorageItem(key, stateRef.current)
  }, [key])

  // Save on state change
  useEffect(() => {
    save()
  }, [state, save])

  // Save on blur
  useEffect(() => {
    if (!syncOnBlur) return
    
    const handleBlur = () => saveNow()
    window.addEventListener('blur', handleBlur)
    
    return () => window.removeEventListener('blur', handleBlur)
  }, [syncOnBlur, saveNow])

  // Save on unload
  useEffect(() => {
    if (!syncOnUnload) return
    
    const handleUnload = () => saveNow()
    window.addEventListener('beforeunload', handleUnload)
    
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [syncOnUnload, saveNow])

  // Load initial
  const load = useCallback(() => {
    return getStorageItem(key)
  }, [key])

  return { save, saveNow, load }
}

/**
 * useUserPreferences Hook
 * Manages common user preferences
 */
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage('user_preferences', {
    theme: 'dark',
    currency: 'USD',
    language: 'en',
    notifications: true,
    sounds: true,
    animations: true,
    compactMode: false,
    showBalances: true
  })

  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }, [setPreferences])

  const resetPreferences = useCallback(() => {
    setPreferences({
      theme: 'dark',
      currency: 'USD',
      language: 'en',
      notifications: true,
      sounds: true,
      animations: true,
      compactMode: false,
      showBalances: true
    })
  }, [setPreferences])

  return {
    preferences,
    updatePreference,
    resetPreferences,
    // Shorthand accessors
    theme: preferences.theme,
    currency: preferences.currency,
    language: preferences.language,
    setTheme: (v) => updatePreference('theme', v),
    setCurrency: (v) => updatePreference('currency', v),
    setLanguage: (v) => updatePreference('language', v)
  }
}

/**
 * useWatchlist Hook
 * Manages market watchlist
 */
export const useWatchlist = () => {
  const { list, push, removeBy, find } = useStorageList('watchlist', [])

  const addToWatchlist = useCallback((marketId, marketData = {}) => {
    if (find(item => item.id === marketId)) return false
    
    push({
      id: marketId,
      ...marketData,
      addedAt: Date.now()
    })
    return true
  }, [push, find])

  const removeFromWatchlist = useCallback((marketId) => {
    removeBy(item => item.id === marketId)
  }, [removeBy])

  const isWatched = useCallback((marketId) => {
    return !!find(item => item.id === marketId)
  }, [find])

  const toggleWatchlist = useCallback((marketId, marketData) => {
    if (isWatched(marketId)) {
      removeFromWatchlist(marketId)
      return false
    } else {
      addToWatchlist(marketId, marketData)
      return true
    }
  }, [isWatched, removeFromWatchlist, addToWatchlist])

  return {
    watchlist: list,
    addToWatchlist,
    removeFromWatchlist,
    isWatched,
    toggleWatchlist
  }
}

/**
 * Storage Statistics
 */
export const useStorageStats = () => {
  const [stats, setStats] = useState({
    used: 0,
    available: true,
    itemCount: 0
  })

  useEffect(() => {
    const calculateStats = () => {
      const available = isStorageAvailable()
      const used = getStorageSize()
      
      let itemCount = 0
      if (available) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(STORAGE_PREFIX)) itemCount++
        })
      }

      setStats({ used, available, itemCount })
    }

    calculateStats()
    
    // Recalculate on storage changes
    window.addEventListener('storage', calculateStats)
    window.addEventListener('storage-change', calculateStats)
    
    return () => {
      window.removeEventListener('storage', calculateStats)
      window.removeEventListener('storage-change', calculateStats)
    }
  }, [])

  return {
    ...stats,
    usedKB: (stats.used / 1024).toFixed(2),
    usedMB: (stats.used / 1024 / 1024).toFixed(4)
  }
}

export default {
  // Utilities
  isStorageAvailable,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearAppStorage,
  getStorageSize,
  // Hooks
  useLocalStorage,
  useSessionStorage,
  useStorageState,
  usePersistedReducer,
  useStorageObject,
  useStorageList,
  useRecentItems,
  useStorageSync,
  useUserPreferences,
  useWatchlist,
  useStorageStats
}
