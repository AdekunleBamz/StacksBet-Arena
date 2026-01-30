import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

/**
 * Collection of useful custom React hooks
 * for the StacksBet Arena application
 */

// ============================================
// State Management Hooks
// ============================================

/**
 * useLocalStorage - Persist state in localStorage
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * useDebounce - Debounce a value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * useThrottle - Throttle a value
 */
export const useThrottle = (value, interval = 500) => {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastUpdated = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    if (now - lastUpdated.current >= interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now()
        setThrottledValue(value)
      }, interval - (now - lastUpdated.current))
      return () => clearTimeout(timer)
    }
  }, [value, interval])

  return throttledValue
}

/**
 * usePrevious - Get previous value of a state
 */
export const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

// ============================================
// UI Hooks
// ============================================

/**
 * useMediaQuery - Track media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (e) => setMatches(e.matches)
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

/**
 * useWindowSize - Track window dimensions
 */
export const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

/**
 * useScrollPosition - Track scroll position
 */
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition({ x: window.scrollX, y: window.scrollY })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollPosition
}

/**
 * useOnClickOutside - Detect clicks outside element
 */
export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

/**
 * useIntersectionObserver - Track element visibility
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      setEntry(entry)
    }, {
      threshold: 0.1,
      ...options
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [options.threshold, options.root, options.rootMargin])

  return { ref, isIntersecting, entry }
}

/**
 * useKeyPress - Detect specific key press
 */
export const useKeyPress = (targetKey, handler) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === targetKey) {
        handler(event)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [targetKey, handler])
}

// ============================================
// Async Hooks
// ============================================

/**
 * useAsync - Handle async operations with loading/error states
 */
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle') // idle | pending | success | error
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    setStatus('pending')
    setData(null)
    setError(null)

    try {
      const response = await asyncFunction(...args)
      setData(response)
      setStatus('success')
      return response
    } catch (err) {
      setError(err)
      setStatus('error')
      throw err
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [])

  return {
    execute,
    status,
    data,
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error'
  }
}

/**
 * useFetch - Fetch data with caching
 */
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!url) return

    let cancelled = false
    setLoading(true)

    fetch(url, options)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        if (!cancelled) {
          setData(data)
          setError(null)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err)
          setData(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [url])

  return { data, error, loading, refetch: () => setLoading(true) }
}

// ============================================
// Utility Hooks
// ============================================

/**
 * useToggle - Boolean toggle state
 */
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])
  return [value, toggle, setTrue, setFalse]
}

/**
 * useInterval - setInterval as a hook
 */
export const useInterval = (callback, delay) => {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

/**
 * useTimeout - setTimeout as a hook
 */
export const useTimeout = (callback, delay) => {
  const savedCallback = useRef(callback)
  const timeoutRef = useRef(null)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  const set = useCallback(() => {
    timeoutRef.current = setTimeout(() => savedCallback.current(), delay)
  }, [delay])

  const clear = useCallback(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current)
  }, [])

  useEffect(() => {
    set()
    return clear
  }, [delay, set, clear])

  return { clear, reset: set }
}

/**
 * useMountedState - Track if component is mounted
 */
export const useMountedState = () => {
  const mountedRef = useRef(false)
  const isMounted = useCallback(() => mountedRef.current, [])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  return isMounted
}

export default {
  useLocalStorage,
  useDebounce,
  useThrottle,
  usePrevious,
  useMediaQuery,
  useWindowSize,
  useScrollPosition,
  useOnClickOutside,
  useIntersectionObserver,
  useKeyPress,
  useAsync,
  useFetch,
  useToggle,
  useInterval,
  useTimeout,
  useMountedState
}
