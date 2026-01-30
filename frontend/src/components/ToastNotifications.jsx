import React from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamation, HiX } from 'react-icons/hi'

/**
 * Custom toast notification system with improved UX
 * Wraps react-hot-toast with custom styling and components
 */

// Custom toast container with arena theme
export const ArenaToaster = () => (
  <Toaster
    position="top-right"
    gutter={12}
    containerStyle={{
      top: 80, // Account for header
    }}
    toastOptions={{
      duration: 4000,
      style: {
        background: 'rgba(20, 15, 35, 0.95)',
        backdropFilter: 'blur(12px)',
        color: '#fff',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25)',
        maxWidth: '400px',
      },
      success: {
        iconTheme: {
          primary: '#10B981',
          secondary: '#fff',
        },
      },
      error: {
        iconTheme: {
          primary: '#EF4444',
          secondary: '#fff',
        },
      },
    }}
  />
)

// Custom toast with icon and dismiss button
const CustomToast = ({ t, icon, title, message, type }) => {
  const borderColors = {
    success: 'border-l-arena-green',
    error: 'border-l-red-500',
    warning: 'border-l-yellow-500',
    info: 'border-l-arena-cyan',
  }

  return (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } flex items-start gap-3 border-l-4 ${borderColors[type]} pl-3`}
    >
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-white text-sm mb-0.5">{title}</p>
        )}
        <p className="text-gray-300 text-sm break-words">{message}</p>
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Dismiss notification"
      >
        <HiX className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  )
}

// Success toast
export const showSuccess = (message, title = null) => {
  toast.custom((t) => (
    <CustomToast
      t={t}
      icon={<HiCheckCircle className="w-5 h-5 text-arena-green" />}
      title={title}
      message={message}
      type="success"
    />
  ))
}

// Error toast
export const showError = (message, title = 'Error') => {
  toast.custom((t) => (
    <CustomToast
      t={t}
      icon={<HiXCircle className="w-5 h-5 text-red-500" />}
      title={title}
      message={message}
      type="error"
    />
  ), { duration: 6000 }) // Errors stay longer
}

// Warning toast
export const showWarning = (message, title = 'Warning') => {
  toast.custom((t) => (
    <CustomToast
      t={t}
      icon={<HiExclamation className="w-5 h-5 text-yellow-500" />}
      title={title}
      message={message}
      type="warning"
    />
  ))
}

// Info toast
export const showInfo = (message, title = null) => {
  toast.custom((t) => (
    <CustomToast
      t={t}
      icon={<HiInformationCircle className="w-5 h-5 text-arena-cyan" />}
      title={title}
      message={message}
      type="info"
    />
  ))
}

// Transaction toast with loading state
export const showTransaction = (txId, explorerUrl = 'https://explorer.stacks.co/txid') => {
  const toastId = toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-start gap-3`}>
      <div className="flex-shrink-0 mt-1">
        <div className="w-5 h-5 border-2 border-arena-purple border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white text-sm mb-1">Transaction Submitted</p>
        <p className="text-gray-400 text-xs mb-2">Waiting for confirmation...</p>
        <a
          href={`${explorerUrl}/${txId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-arena-cyan text-xs hover:underline flex items-center gap-1"
        >
          View on Explorer →
        </a>
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Dismiss"
      >
        <HiX className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  ), { duration: Infinity })

  return toastId
}

// Update transaction toast
export const updateTransaction = (toastId, success = true, message = null) => {
  toast.dismiss(toastId)
  if (success) {
    showSuccess(message || 'Transaction confirmed!')
  } else {
    showError(message || 'Transaction failed')
  }
}

// Promise toast for async operations
export const showPromise = (promise, { loading, success, error }) => {
  return toast.promise(promise, {
    loading: loading || 'Loading...',
    success: success || 'Success!',
    error: (err) => error || err?.message || 'Something went wrong',
  })
}

// Wallet connection toast
export const showWalletConnected = (address) => {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  showSuccess(`Connected: ${shortAddress}`, 'Wallet Connected')
}

// Wallet disconnection toast
export const showWalletDisconnected = () => {
  showInfo('Wallet disconnected successfully')
}

// Copy to clipboard toast
export const showCopied = (text = 'Address') => {
  showSuccess(`${text} copied to clipboard!`)
}

// Network error toast
export const showNetworkError = () => {
  showError('Unable to connect to the network. Please check your connection.', 'Network Error')
}

// Dismiss all toasts
export const dismissAll = () => toast.dismiss()

export default {
  ArenaToaster,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showTransaction,
  updateTransaction,
  showPromise,
  showWalletConnected,
  showWalletDisconnected,
  showCopied,
  showNetworkError,
  dismissAll,
}
