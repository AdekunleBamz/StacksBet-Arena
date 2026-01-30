import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

/**
 * API Client utilities for StacksBet Arena
 * Comprehensive HTTP client with caching, retries, and React hooks
 */

// ============================================
// CONFIGURATION
// ============================================

const DEFAULT_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json'
  }
}

let globalConfig = { ...DEFAULT_CONFIG }

/**
 * Configure API client globally
 */
export const configureApi = (config) => {
  globalConfig = { ...globalConfig, ...config }
}

// ============================================
// CACHE MANAGEMENT
// ============================================

class CacheManager {
  constructor() {
    this.cache = new Map()
    this.subscriptions = new Map()
  }

  generateKey(url, params) {
    const paramString = params ? JSON.stringify(params) : ''
    return `${url}:${paramString}`
  }

  get(key) {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (cached.expiry && Date.now() > cached.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  set(key, data, ttl = 60000) {
    this.cache.set(key, {
      data,
      expiry: ttl ? Date.now() + ttl : null,
      timestamp: Date.now()
    })
    
    // Notify subscribers
    this.subscriptions.get(key)?.forEach(cb => cb(data))
  }

  invalidate(key) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  invalidatePattern(pattern) {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  subscribe(key, callback) {
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set())
    }
    this.subscriptions.get(key).add(callback)
    
    return () => {
      this.subscriptions.get(key)?.delete(callback)
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      totalBytes: JSON.stringify(Array.from(this.cache.values())).length
    }
  }
}

export const cache = new CacheManager()

// ============================================
// REQUEST QUEUE FOR DEDUPLICATION
// ============================================

class RequestQueue {
  constructor() {
    this.pending = new Map()
  }

  async dedupe(key, requestFn) {
    // If request is already pending, return the existing promise
    if (this.pending.has(key)) {
      return this.pending.get(key)
    }

    // Create new request promise
    const promise = requestFn().finally(() => {
      this.pending.delete(key)
    })

    this.pending.set(key, promise)
    return promise
  }
}

const requestQueue = new RequestQueue()

// ============================================
// HTTP CLIENT
// ============================================

/**
 * Make HTTP request with retries and timeout
 */
export const request = async (url, options = {}) => {
  const {
    method = 'GET',
    body,
    headers = {},
    params,
    timeout = globalConfig.timeout,
    retries = globalConfig.retries,
    retryDelay = globalConfig.retryDelay,
    cache: useCache = false,
    cacheTTL = 60000,
    dedupe = true,
    signal
  } = options

  // Build full URL
  let fullUrl = url.startsWith('http') ? url : `${globalConfig.baseUrl}${url}`
  
  // Add query params
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      fullUrl += `?${queryString}`
    }
  }

  // Check cache for GET requests
  const cacheKey = cache.generateKey(fullUrl, params)
  if (useCache && method === 'GET') {
    const cached = cache.get(cacheKey)
    if (cached) return cached
  }

  // Request function
  const executeRequest = async () => {
    let lastError = null
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(fullUrl, {
          method,
          headers: {
            ...globalConfig.headers,
            ...headers
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: signal || controller.signal
        })

        clearTimeout(timeoutId)

        // Handle response
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
          error.status = response.status
          error.statusText = response.statusText
          
          try {
            error.data = await response.json()
          } catch {
            error.data = null
          }
          
          throw error
        }

        // Parse response
        const contentType = response.headers.get('content-type')
        let data
        
        if (contentType?.includes('application/json')) {
          data = await response.json()
        } else if (contentType?.includes('text/')) {
          data = await response.text()
        } else {
          data = await response.blob()
        }

        // Cache successful GET requests
        if (useCache && method === 'GET') {
          cache.set(cacheKey, data, cacheTTL)
        }

        return data
      } catch (err) {
        lastError = err
        
        // Don't retry on abort or certain status codes
        if (
          err.name === 'AbortError' ||
          [400, 401, 403, 404, 422].includes(err.status)
        ) {
          throw err
        }

        // Wait before retry
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, retryDelay * (attempt + 1)))
        }
      }
    }

    throw lastError
  }

  // Dedupe concurrent identical requests
  if (dedupe && method === 'GET') {
    return requestQueue.dedupe(cacheKey, executeRequest)
  }

  return executeRequest()
}

// HTTP method shortcuts
export const api = {
  get: (url, options) => request(url, { ...options, method: 'GET' }),
  post: (url, body, options) => request(url, { ...options, method: 'POST', body }),
  put: (url, body, options) => request(url, { ...options, method: 'PUT', body }),
  patch: (url, body, options) => request(url, { ...options, method: 'PATCH', body }),
  delete: (url, options) => request(url, { ...options, method: 'DELETE' })
}

// ============================================
// REACT HOOKS
// ============================================

/**
 * Hook for data fetching
 */
export const useQuery = (url, options = {}) => {
  const {
    params,
    enabled = true,
    cache: useCache = true,
    cacheTTL = 60000,
    refetchInterval,
    refetchOnWindowFocus = false,
    onSuccess,
    onError,
    initialData,
    select
  } = options

  const [state, setState] = useState({
    data: initialData ?? null,
    error: null,
    isLoading: enabled,
    isError: false,
    isSuccess: false,
    isFetching: false
  })

  const abortControllerRef = useRef(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async (showLoading = true) => {
    if (!enabled || !url) return

    // Cancel previous request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    if (showLoading) {
      setState(prev => ({ ...prev, isFetching: true }))
    }

    try {
      let data = await api.get(url, {
        params,
        cache: useCache,
        cacheTTL,
        signal: abortControllerRef.current.signal
      })

      // Apply select transform
      if (select) {
        data = select(data)
      }

      if (mountedRef.current) {
        setState({
          data,
          error: null,
          isLoading: false,
          isError: false,
          isSuccess: true,
          isFetching: false
        })
        onSuccess?.(data)
      }
    } catch (err) {
      if (err.name === 'AbortError') return

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          error: err,
          isLoading: false,
          isError: true,
          isSuccess: false,
          isFetching: false
        }))
        onError?.(err)
      }
    }
  }, [url, JSON.stringify(params), enabled, useCache, cacheTTL, select])

  // Initial fetch
  useEffect(() => {
    fetchData()
    return () => {
      mountedRef.current = false
      abortControllerRef.current?.abort()
    }
  }, [fetchData])

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return

    const interval = setInterval(() => {
      fetchData(false)
    }, refetchInterval)

    return () => clearInterval(interval)
  }, [refetchInterval, enabled, fetchData])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return

    const handleFocus = () => fetchData(false)
    window.addEventListener('focus', handleFocus)

    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, enabled, fetchData])

  const refetch = useCallback(() => {
    cache.invalidate(cache.generateKey(url, params))
    return fetchData()
  }, [url, params, fetchData])

  return {
    ...state,
    refetch
  }
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 */
export const useMutation = (mutationFn, options = {}) => {
  const {
    onSuccess,
    onError,
    onSettled,
    invalidateKeys = []
  } = options

  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    isSuccess: false
  })

  const mutate = useCallback(async (variables) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const data = await mutationFn(variables)

      setState({
        data,
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: true
      })

      // Invalidate cache keys
      invalidateKeys.forEach(key => {
        if (typeof key === 'string') {
          cache.invalidatePattern(key)
        }
      })

      onSuccess?.(data, variables)
      onSettled?.(data, null, variables)

      return data
    } catch (err) {
      setState({
        data: null,
        error: err,
        isLoading: false,
        isError: true,
        isSuccess: false
      })

      onError?.(err, variables)
      onSettled?.(null, err, variables)

      throw err
    }
  }, [mutationFn, onSuccess, onError, onSettled, invalidateKeys])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isError: false,
      isSuccess: false
    })
  }, [])

  return {
    ...state,
    mutate,
    mutateAsync: mutate,
    reset
  }
}

/**
 * Hook for infinite scrolling/pagination
 */
export const useInfiniteQuery = (getUrl, options = {}) => {
  const {
    getNextPageParam,
    initialPageParam = 1,
    enabled = true
  } = options

  const [pages, setPages] = useState([])
  const [pageParam, setPageParam] = useState(initialPageParam)
  const [state, setState] = useState({
    isLoading: false,
    isFetchingNextPage: false,
    hasNextPage: true,
    error: null
  })

  const fetchPage = useCallback(async (param, isNext = false) => {
    if (!enabled) return

    setState(prev => ({
      ...prev,
      isLoading: !isNext,
      isFetchingNextPage: isNext
    }))

    try {
      const url = getUrl(param)
      const data = await api.get(url)

      setPages(prev => isNext ? [...prev, data] : [data])

      const nextParam = getNextPageParam?.(data)
      setPageParam(nextParam)
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: !!nextParam
      }))

      return data
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isFetchingNextPage: false,
        error: err
      }))
    }
  }, [getUrl, enabled, getNextPageParam])

  // Initial fetch
  useEffect(() => {
    fetchPage(initialPageParam)
  }, [])

  const fetchNextPage = useCallback(() => {
    if (state.hasNextPage && !state.isFetchingNextPage && pageParam) {
      fetchPage(pageParam, true)
    }
  }, [fetchPage, state.hasNextPage, state.isFetchingNextPage, pageParam])

  const refetch = useCallback(() => {
    setPages([])
    setPageParam(initialPageParam)
    return fetchPage(initialPageParam)
  }, [fetchPage, initialPageParam])

  const data = useMemo(() => ({
    pages,
    pageParams: pages.map((_, i) => i + 1)
  }), [pages])

  return {
    data,
    ...state,
    fetchNextPage,
    refetch
  }
}

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Market API endpoints
 */
export const marketsApi = {
  getAll: (params) => api.get('/markets', { params, cache: true }),
  getById: (id) => api.get(`/markets/${id}`, { cache: true }),
  getFeatured: () => api.get('/markets/featured', { cache: true, cacheTTL: 30000 }),
  getTrending: () => api.get('/markets/trending', { cache: true, cacheTTL: 30000 }),
  getByCategory: (category) => api.get(`/markets/category/${category}`, { cache: true }),
  search: (query) => api.get('/markets/search', { params: { q: query } }),
  create: (data) => api.post('/markets', data),
  resolve: (id, outcome) => api.post(`/markets/${id}/resolve`, { outcome })
}

/**
 * Bets API endpoints
 */
export const betsApi = {
  getByMarket: (marketId) => api.get(`/markets/${marketId}/bets`, { cache: true }),
  getByUser: (address) => api.get(`/users/${address}/bets`, { cache: true }),
  place: (marketId, data) => api.post(`/markets/${marketId}/bets`, data),
  claim: (betId) => api.post(`/bets/${betId}/claim`)
}

/**
 * User API endpoints
 */
export const usersApi = {
  getProfile: (address) => api.get(`/users/${address}`, { cache: true }),
  updateProfile: (address, data) => api.put(`/users/${address}`, data),
  getStats: (address) => api.get(`/users/${address}/stats`, { cache: true }),
  getLeaderboard: (params) => api.get('/leaderboard', { params, cache: true })
}

/**
 * Stacks blockchain API endpoints
 */
export const stacksApi = {
  getBalance: (address) => api.get(
    `https://stacks-node-api.mainnet.stacks.co/extended/v1/address/${address}/balances`,
    { cache: true, cacheTTL: 15000 }
  ),
  getTransaction: (txId) => api.get(
    `https://stacks-node-api.mainnet.stacks.co/extended/v1/tx/${txId}`,
    { cache: true }
  ),
  getAccountTransactions: (address, params) => api.get(
    `https://stacks-node-api.mainnet.stacks.co/extended/v1/address/${address}/transactions`,
    { params, cache: true, cacheTTL: 30000 }
  )
}

// ============================================
// CUSTOM HOOKS FOR SPECIFIC DATA
// ============================================

/**
 * Hook for fetching markets
 */
export const useMarkets = (params = {}) => {
  return useQuery('/markets', {
    params,
    cache: true,
    cacheTTL: 30000,
    refetchInterval: 60000
  })
}

/**
 * Hook for fetching single market
 */
export const useMarket = (id) => {
  return useQuery(id ? `/markets/${id}` : null, {
    enabled: !!id,
    cache: true,
    cacheTTL: 15000
  })
}

/**
 * Hook for fetching user profile
 */
export const useUserProfile = (address) => {
  return useQuery(address ? `/users/${address}` : null, {
    enabled: !!address,
    cache: true,
    cacheTTL: 60000
  })
}

/**
 * Hook for placing bets
 */
export const usePlaceBet = (marketId) => {
  return useMutation(
    (betData) => betsApi.place(marketId, betData),
    {
      invalidateKeys: [`/markets/${marketId}`, '/users/'],
      onSuccess: () => {
        // Optionally show toast notification
      }
    }
  )
}

export default {
  // Configuration
  configureApi,
  // HTTP Client
  request,
  api,
  // Cache
  cache,
  // Hooks
  useQuery,
  useMutation,
  useInfiniteQuery,
  // API Endpoints
  marketsApi,
  betsApi,
  usersApi,
  stacksApi,
  // Custom Hooks
  useMarkets,
  useMarket,
  useUserProfile,
  usePlaceBet
}
