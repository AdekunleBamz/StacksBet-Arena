import React, { useState, useEffect } from 'react'
import { 
  HiCheckCircle, 
  HiExclamation, 
  HiInformationCircle, 
  HiXCircle,
  HiX,
  HiLightningBolt
} from 'react-icons/hi'

/**
 * Alert components for notifications and status messages
 */

// Alert variants configuration
const alertConfig = {
  success: {
    icon: HiCheckCircle,
    bgColor: 'bg-arena-green/10',
    borderColor: 'border-arena-green/30',
    iconColor: 'text-arena-green',
    titleColor: 'text-arena-green'
  },
  error: {
    icon: HiXCircle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    iconColor: 'text-red-400',
    titleColor: 'text-red-400'
  },
  warning: {
    icon: HiExclamation,
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    iconColor: 'text-yellow-400',
    titleColor: 'text-yellow-400'
  },
  info: {
    icon: HiInformationCircle,
    bgColor: 'bg-arena-cyan/10',
    borderColor: 'border-arena-cyan/30',
    iconColor: 'text-arena-cyan',
    titleColor: 'text-arena-cyan'
  },
  purple: {
    icon: HiLightningBolt,
    bgColor: 'bg-arena-purple/10',
    borderColor: 'border-arena-purple/30',
    iconColor: 'text-arena-purple',
    titleColor: 'text-arena-purple'
  }
}

const Alert = ({
  variant = 'info',
  title,
  children,
  icon: CustomIcon,
  dismissible = false,
  onDismiss,
  action,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const config = alertConfig[variant]
  const Icon = CustomIcon || config.icon

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <div
      role="alert"
      className={`
        relative flex gap-3 p-4 rounded-xl border
        ${config.bgColor} ${config.borderColor}
        animate-fadeIn
        ${className}
      `}
    >
      {/* Icon */}
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`font-semibold mb-1 ${config.titleColor}`}>
            {title}
          </h4>
        )}
        <div className="text-sm text-gray-300">
          {children}
        </div>
        {action && (
          <div className="mt-3">
            {action}
          </div>
        )}
      </div>
      
      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <HiX className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  )
}

// Inline Alert (smaller, more compact)
export const InlineAlert = ({
  variant = 'info',
  children,
  className = ''
}) => {
  const config = alertConfig[variant]
  const Icon = config.icon

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
      ${config.bgColor} ${config.borderColor} border
      ${className}
    `}>
      <Icon className={`w-4 h-4 ${config.iconColor}`} />
      <span className="text-gray-300">{children}</span>
    </div>
  )
}

// Banner Alert (full width, typically at top of page)
export const BannerAlert = ({
  variant = 'info',
  children,
  dismissible = false,
  onDismiss,
  action,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const config = alertConfig[variant]
  const Icon = config.icon

  if (!isVisible) return null

  return (
    <div className={`
      w-full py-3 px-4 ${config.bgColor} border-b ${config.borderColor}
      ${className}
    `}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
          <span className="text-sm text-gray-300">{children}</span>
        </div>
        
        <div className="flex items-center gap-3">
          {action}
          {dismissible && (
            <button
              onClick={() => {
                setIsVisible(false)
                onDismiss?.()
              }}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <HiX className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Auto-dismiss Alert
export const TimedAlert = ({
  variant = 'info',
  children,
  duration = 5000,
  onExpire,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
        setIsVisible(false)
        onExpire?.()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [duration, onExpire])

  if (!isVisible) return null

  return (
    <div className="relative overflow-hidden">
      <Alert variant={variant} {...props}>
        {children}
      </Alert>
      <div 
        className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-50"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Transaction Alert (specific to blockchain)
export const TransactionAlert = ({
  status = 'pending', // 'pending', 'success', 'error'
  txHash,
  message,
  explorerUrl = 'https://explorer.hiro.so/txid/',
  onClose,
  className = ''
}) => {
  const statusConfig = {
    pending: {
      variant: 'info',
      title: 'Transaction Pending',
      icon: (
        <div className="w-5 h-5 border-2 border-arena-cyan border-t-transparent rounded-full animate-spin" />
      )
    },
    success: {
      variant: 'success',
      title: 'Transaction Successful',
      icon: null
    },
    error: {
      variant: 'error',
      title: 'Transaction Failed',
      icon: null
    }
  }

  const config = statusConfig[status]
  const truncatedHash = txHash ? `${txHash.slice(0, 8)}...${txHash.slice(-8)}` : ''

  return (
    <Alert
      variant={config.variant}
      title={config.title}
      icon={config.icon ? () => config.icon : undefined}
      dismissible={status !== 'pending'}
      onDismiss={onClose}
      action={txHash && (
        <a
          href={`${explorerUrl}${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-arena-cyan hover:underline"
        >
          View on Explorer ({truncatedHash})
          <span className="text-xs">↗</span>
        </a>
      )}
      className={className}
    >
      {message}
    </Alert>
  )
}

// Network Alert
export const NetworkAlert = ({
  isConnected,
  networkName = 'Stacks',
  onSwitchNetwork,
  className = ''
}) => {
  if (isConnected) return null

  return (
    <BannerAlert
      variant="warning"
      action={
        onSwitchNetwork && (
          <button
            onClick={onSwitchNetwork}
            className="px-3 py-1 text-sm font-medium bg-yellow-500 text-black rounded-lg
                       hover:bg-yellow-400 transition-colors"
          >
            Switch Network
          </button>
        )
      }
      className={className}
    >
      You are not connected to {networkName}. Some features may not work correctly.
    </NetworkAlert>
  )
}

// Callout (styled quote/highlight box)
export const Callout = ({
  emoji,
  title,
  children,
  variant = 'default',
  className = ''
}) => {
  const variants = {
    default: 'bg-gray-800/50 border-gray-700',
    tip: 'bg-arena-green/10 border-arena-green/30',
    note: 'bg-arena-cyan/10 border-arena-cyan/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    danger: 'bg-red-500/10 border-red-500/30'
  }

  return (
    <div className={`
      p-4 rounded-xl border-l-4
      ${variants[variant]}
      ${className}
    `}>
      <div className="flex gap-3">
        {emoji && (
          <span className="text-2xl flex-shrink-0">{emoji}</span>
        )}
        <div>
          {title && (
            <h4 className="font-semibold text-white mb-1">{title}</h4>
          )}
          <div className="text-sm text-gray-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Alert List (for showing multiple alerts)
export const AlertList = ({
  alerts = [],
  onDismiss,
  className = ''
}) => {
  if (alerts.length === 0) return null

  return (
    <div className={`space-y-2 ${className}`}>
      {alerts.map((alert, index) => (
        <Alert
          key={alert.id || index}
          variant={alert.variant}
          title={alert.title}
          dismissible={alert.dismissible}
          onDismiss={() => onDismiss?.(alert.id || index)}
        >
          {alert.message}
        </Alert>
      ))}
    </div>
  )
}

// Styles for animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`

if (typeof document !== 'undefined') {
  const existing = document.querySelector('[data-alert-styles]')
  if (!existing) {
    const styleSheet = document.createElement('style')
    styleSheet.setAttribute('data-alert-styles', 'true')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
  }
}

export default Alert
