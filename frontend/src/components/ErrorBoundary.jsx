import React, { Component } from 'react'
import { HiRefresh, HiHome, HiExclamation } from 'react-icons/hi'

/**
 * Error Boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the child component tree
 */

class ErrorBoundary extends Component {
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
    
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Report to error tracking service (if configured)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
    
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset
        })
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-6">
              <HiExclamation className="w-8 h-8 text-red-500" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">
              {this.props.title || 'Something went wrong'}
            </h2>

            {/* Message */}
            <p className="text-gray-400 mb-6">
              {this.props.message || "We're sorry, but something unexpected happened. Please try again."}
            </p>

            {/* Error details (development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-400">
                  Error details
                </summary>
                <div className="mt-2 p-4 bg-gray-900 rounded-lg overflow-auto">
                  <pre className="text-xs text-red-400 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-gray-500 mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="btn-primary px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <HiRefresh className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="glass-card px-6 py-3 rounded-xl font-medium hover:bg-arena-purple/20 transition-colors flex items-center justify-center gap-2"
              >
                <HiHome className="w-5 h-5" />
                Go Home
              </button>
            </div>

            {/* Support link */}
            {this.props.supportUrl && (
              <p className="mt-6 text-sm text-gray-500">
                Need help?{' '}
                <a 
                  href={this.props.supportUrl}
                  className="text-arena-cyan hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact Support
                </a>
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for easier use
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Error fallback component for use with Suspense
export const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-6 text-center">
    <div className="text-4xl mb-4">😕</div>
    <h3 className="text-lg font-semibold text-white mb-2">Failed to load</h3>
    <p className="text-gray-400 text-sm mb-4">
      {error?.message || 'An unexpected error occurred'}
    </p>
    <button
      onClick={resetErrorBoundary}
      className="btn-primary px-4 py-2 rounded-lg text-sm"
    >
      Retry
    </button>
  </div>
)

// Network error fallback
export const NetworkErrorFallback = ({ onRetry }) => (
  <div className="p-8 text-center">
    <div className="text-5xl mb-4">🌐</div>
    <h3 className="text-xl font-bold text-white mb-2">Connection Lost</h3>
    <p className="text-gray-400 mb-6">
      Unable to connect to the network. Please check your internet connection and try again.
    </p>
    <button
      onClick={onRetry}
      className="btn-primary px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto"
    >
      <HiRefresh className="w-5 h-5" />
      Retry Connection
    </button>
  </div>
)

// Wallet error fallback
export const WalletErrorFallback = ({ onReconnect }) => (
  <div className="p-8 text-center">
    <div className="text-5xl mb-4">👛</div>
    <h3 className="text-xl font-bold text-white mb-2">Wallet Disconnected</h3>
    <p className="text-gray-400 mb-6">
      Your wallet connection was lost. Please reconnect to continue.
    </p>
    <button
      onClick={onReconnect}
      className="btn-primary px-6 py-3 rounded-xl font-medium"
    >
      Reconnect Wallet
    </button>
  </div>
)

// Contract error fallback
export const ContractErrorFallback = ({ error, onRetry }) => (
  <div className="p-8 text-center">
    <div className="text-5xl mb-4">📜</div>
    <h3 className="text-xl font-bold text-white mb-2">Contract Error</h3>
    <p className="text-gray-400 mb-4">
      Failed to interact with the smart contract.
    </p>
    {error && (
      <p className="text-sm text-red-400 mb-6 font-mono bg-red-500/10 p-3 rounded-lg">
        {error.message || String(error)}
      </p>
    )}
    <button
      onClick={onRetry}
      className="btn-primary px-6 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto"
    >
      <HiRefresh className="w-5 h-5" />
      Try Again
    </button>
  </div>
)

export default ErrorBoundary
