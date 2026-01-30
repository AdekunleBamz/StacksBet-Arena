import React, { Component, useState, useCallback, useEffect } from 'react'
import { FiAlertTriangle, FiRefreshCw, FiXCircle, FiAlertCircle, FiWifi, FiLock } from 'react-icons/fi'

/**
 * Error handling utilities and components for StacksBet Arena
 * Comprehensive error management, boundaries, and user-friendly displays
 */

// ============================================
// ERROR TYPES & CODES
// ============================================

export const ErrorCodes = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  NO_CONNECTION: 'NO_CONNECTION',
  
  // API errors
  API_ERROR: 'API_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // Wallet errors
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  WALLET_REJECTED: 'WALLET_REJECTED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // App errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  RENDER_ERROR: 'RENDER_ERROR',
  STATE_ERROR: 'STATE_ERROR'
}

// User-friendly error messages
export const ErrorMessages = {
  [ErrorCodes.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ErrorCodes.TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCodes.NO_CONNECTION]: 'No internet connection.',
  [ErrorCodes.API_ERROR]: 'Something went wrong. Please try again.',
  [ErrorCodes.RATE_LIMITED]: 'Too many requests. Please wait a moment.',
  [ErrorCodes.UNAUTHORIZED]: 'Please connect your wallet to continue.',
  [ErrorCodes.FORBIDDEN]: 'You don\'t have permission to perform this action.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.SERVER_ERROR]: 'Server error. Our team has been notified.',
  [ErrorCodes.WALLET_NOT_CONNECTED]: 'Please connect your wallet.',
  [ErrorCodes.WALLET_REJECTED]: 'Transaction was rejected.',
  [ErrorCodes.INSUFFICIENT_BALANCE]: 'Insufficient STX balance.',
  [ErrorCodes.TRANSACTION_FAILED]: 'Transaction failed. Please try again.',
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input.',
  [ErrorCodes.INVALID_INPUT]: 'Invalid input provided.',
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred.',
  [ErrorCodes.RENDER_ERROR]: 'Something went wrong displaying this content.',
  [ErrorCodes.STATE_ERROR]: 'Application state error. Please refresh.'
}

// ============================================
// CUSTOM ERROR CLASSES
// ============================================

export class AppError extends Error {
  constructor(code, message, details = {}) {
    super(message || ErrorMessages[code] || 'An error occurred')
    this.name = 'AppError'
    this.code = code
    this.details = details
    this.timestamp = Date.now()
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp
    }
  }
}

export class NetworkError extends AppError {
  constructor(message, details = {}) {
    super(ErrorCodes.NETWORK_ERROR, message, details)
    this.name = 'NetworkError'
  }
}

export class WalletError extends AppError {
  constructor(code, message, details = {}) {
    super(code, message, details)
    this.name = 'WalletError'
  }
}

export class ValidationError extends AppError {
  constructor(message, fields = {}) {
    super(ErrorCodes.VALIDATION_ERROR, message, { fields })
    this.name = 'ValidationError'
    this.fields = fields
  }
}

// ============================================
// ERROR PARSING & CLASSIFICATION
// ============================================

/**
 * Parse error from various sources into AppError
 */
export const parseError = (error) => {
  // Already an AppError
  if (error instanceof AppError) {
    return error
  }

  // Fetch/Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new NetworkError('Network request failed')
  }

  // Timeout errors
  if (error.name === 'AbortError') {
    return new AppError(ErrorCodes.TIMEOUT)
  }

  // HTTP response errors
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode
    
    if (status === 401) return new AppError(ErrorCodes.UNAUTHORIZED)
    if (status === 403) return new AppError(ErrorCodes.FORBIDDEN)
    if (status === 404) return new AppError(ErrorCodes.NOT_FOUND)
    if (status === 429) return new AppError(ErrorCodes.RATE_LIMITED)
    if (status >= 500) return new AppError(ErrorCodes.SERVER_ERROR)
    
    return new AppError(ErrorCodes.API_ERROR, error.message)
  }

  // Wallet-specific errors
  if (error.message?.includes('User rejected')) {
    return new WalletError(ErrorCodes.WALLET_REJECTED)
  }
  if (error.message?.includes('insufficient')) {
    return new WalletError(ErrorCodes.INSUFFICIENT_BALANCE)
  }

  // Default unknown error
  return new AppError(ErrorCodes.UNKNOWN_ERROR, error.message)
}

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error) => {
  const parsed = parseError(error)
  return parsed.message
}

/**
 * Check if error is retryable
 */
export const isRetryable = (error) => {
  const parsed = parseError(error)
  const retryableCodes = [
    ErrorCodes.NETWORK_ERROR,
    ErrorCodes.TIMEOUT,
    ErrorCodes.SERVER_ERROR,
    ErrorCodes.RATE_LIMITED
  ]
  return retryableCodes.includes(parsed.code)
}

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    
    // Log to error tracking service
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
    
    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught:', error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          retry: this.handleRetry
        })
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          showDetails={this.props.showDetails}
        />
      )
    }

    return this.props.children
  }
}

// ============================================
// ERROR DISPLAY COMPONENTS
// ============================================

/**
 * Default error fallback UI
 */
export const ErrorFallback = ({ 
  error, 
  onRetry,
  showDetails = false,
  className = ''
}) => {
  const parsed = parseError(error)
  
  return (
    <div className={`p-6 text-center ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <FiAlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">
        Something went wrong
      </h3>
      
      <p className="text-slate-400 mb-4">
        {parsed.message}
      </p>
      
      {showDetails && parsed.code && (
        <p className="text-xs text-slate-600 mb-4 font-mono">
          Error code: {parsed.code}
        </p>
      )}
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="
            inline-flex items-center gap-2 px-4 py-2
            bg-purple-500 hover:bg-purple-600
            text-white rounded-lg transition-colors
          "
        >
          <FiRefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  )
}

/**
 * Inline error message
 */
export const InlineError = ({ 
  error, 
  onDismiss,
  className = '' 
}) => {
  if (!error) return null
  
  const message = typeof error === 'string' ? error : getErrorMessage(error)
  
  return (
    <div className={`
      flex items-center gap-2 p-3
      bg-red-500/10 border border-red-500/30
      rounded-lg text-red-400 text-sm
      ${className}
    `}>
      <FiXCircle className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="p-1 hover:bg-red-500/20 rounded"
        >
          <FiXCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

/**
 * Error alert banner
 */
export const ErrorBanner = ({
  error,
  onRetry,
  onDismiss,
  className = ''
}) => {
  const parsed = parseError(error)
  const canRetry = isRetryable(error)
  
  const getIcon = () => {
    switch (parsed.code) {
      case ErrorCodes.NO_CONNECTION:
      case ErrorCodes.NETWORK_ERROR:
        return FiWifi
      case ErrorCodes.UNAUTHORIZED:
      case ErrorCodes.FORBIDDEN:
        return FiLock
      default:
        return FiAlertCircle
    }
  }
  
  const Icon = getIcon()
  
  return (
    <div className={`
      flex items-center gap-3 p-4
      bg-red-500/10 border-b border-red-500/30
      ${className}
    `}>
      <Icon className="w-5 h-5 text-red-400 flex-shrink-0" />
      
      <div className="flex-1">
        <p className="text-red-300 font-medium">{parsed.message}</p>
      </div>
      
      <div className="flex items-center gap-2">
        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            className="
              px-3 py-1.5 text-sm
              bg-red-500/20 hover:bg-red-500/30
              text-red-300 rounded-lg transition-colors
            "
          >
            Retry
          </button>
        )}
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 text-red-400 hover:bg-red-500/20 rounded"
          >
            <FiXCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Empty state with error
 */
export const ErrorEmptyState = ({
  title = 'Unable to load',
  message,
  error,
  onRetry,
  icon: Icon = FiAlertTriangle,
  className = ''
}) => {
  const errorMessage = message || (error && getErrorMessage(error))
  
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="w-20 h-20 mb-6 rounded-full bg-slate-800 flex items-center justify-center">
        <Icon className="w-10 h-10 text-slate-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      
      {errorMessage && (
        <p className="text-slate-400 mb-6 max-w-sm">{errorMessage}</p>
      )}
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="
            inline-flex items-center gap-2 px-6 py-2.5
            bg-purple-500 hover:bg-purple-600
            text-white rounded-lg font-medium transition-colors
          "
        >
          <FiRefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  )
}

// ============================================
// ERROR HOOKS
// ============================================

/**
 * Hook for managing error state
 */
export const useError = () => {
  const [error, setError] = useState(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((err) => {
    const parsed = parseError(err)
    setError(parsed)
    return parsed
  }, [])

  return {
    error,
    setError: handleError,
    clearError,
    hasError: !!error
  }
}

/**
 * Hook for async operations with error handling
 */
export const useAsyncError = (asyncFn, options = {}) => {
  const { 
    onSuccess, 
    onError, 
    retries = 0,
    retryDelay = 1000 
  } = options
  
  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false
  })

  const execute = useCallback(async (...args) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    let lastError = null
    let attempts = 0
    
    while (attempts <= retries) {
      try {
        const result = await asyncFn(...args)
        
        setState({
          data: result,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false
        })
        
        onSuccess?.(result)
        return result
      } catch (err) {
        lastError = err
        attempts++
        
        if (attempts <= retries && isRetryable(err)) {
          await new Promise(r => setTimeout(r, retryDelay * attempts))
        }
      }
    }
    
    const parsed = parseError(lastError)
    
    setState({
      data: null,
      error: parsed,
      isLoading: false,
      isSuccess: false,
      isError: true
    })
    
    onError?.(parsed)
    return null
  }, [asyncFn, onSuccess, onError, retries, retryDelay])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false
    })
  }, [])

  return { ...state, execute, reset }
}

/**
 * Hook for global error handling
 */
export const useGlobalErrorHandler = (onError) => {
  useEffect(() => {
    const handleError = (event) => {
      const error = event.error || event.reason
      onError?.(parseError(error))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleError)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleError)
    }
  }, [onError])
}

// ============================================
// ERROR LOGGING
// ============================================

/**
 * Log error to console/service
 */
export const logError = (error, context = {}) => {
  const parsed = parseError(error)
  
  const errorLog = {
    ...parsed.toJSON(),
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Log')
    console.error('Error:', parsed.message)
    console.info('Code:', parsed.code)
    console.info('Context:', context)
    console.groupEnd()
  }

  // In production, send to error tracking service
  // Example: Sentry.captureException(error, { extra: errorLog })

  return errorLog
}

/**
 * Create error reporter
 */
export const createErrorReporter = (config = {}) => {
  const { endpoint, appName, version } = config

  return {
    report: async (error, context = {}) => {
      const errorLog = logError(error, context)

      if (endpoint) {
        try {
          await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...errorLog,
              appName,
              version
            })
          })
        } catch (e) {
          console.error('Failed to report error:', e)
        }
      }

      return errorLog
    }
  }
}

export default {
  // Error types
  ErrorCodes,
  ErrorMessages,
  AppError,
  NetworkError,
  WalletError,
  ValidationError,
  // Utilities
  parseError,
  getErrorMessage,
  isRetryable,
  logError,
  createErrorReporter,
  // Components
  ErrorBoundary,
  ErrorFallback,
  InlineError,
  ErrorBanner,
  ErrorEmptyState,
  // Hooks
  useError,
  useAsyncError,
  useGlobalErrorHandler
}
