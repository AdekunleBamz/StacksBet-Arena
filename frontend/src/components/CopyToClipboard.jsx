import React, { useState, useCallback, useRef } from 'react'
import { FiCopy, FiCheck, FiLink, FiShare2 } from 'react-icons/fi'

/**
 * Copy to clipboard utilities and components for StacksBet Arena
 */

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  // Modern clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Clipboard API failed:', err)
    }
  }

  // Fallback for older browsers
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    textArea.style.top = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    return successful
  } catch (err) {
    console.error('Fallback copy failed:', err)
    return false
  }
}

/**
 * Hook for clipboard operations
 */
export const useClipboard = (options = {}) => {
  const { timeout = 2000, onSuccess, onError } = options
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const timeoutRef = useRef(null)

  const copy = useCallback(async (text) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    try {
      const success = await copyToClipboard(text)
      
      if (success) {
        setCopied(true)
        setError(null)
        onSuccess?.(text)
        
        // Reset after timeout
        timeoutRef.current = setTimeout(() => {
          setCopied(false)
        }, timeout)
      } else {
        throw new Error('Copy failed')
      }
    } catch (err) {
      setCopied(false)
      setError(err.message)
      onError?.(err)
    }
  }, [timeout, onSuccess, onError])

  const reset = useCallback(() => {
    setCopied(false)
    setError(null)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return { copy, copied, error, reset }
}

/**
 * Copy Button Component
 */
export const CopyButton = ({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  variant = 'default',
  size = 'md',
  showIcon = true,
  showLabel = true,
  onCopy,
  className = ''
}) => {
  const { copy, copied } = useClipboard({
    onSuccess: onCopy
  })

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-base'
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const variants = {
    default: `
      bg-slate-700 hover:bg-slate-600 text-slate-300
      ${copied ? 'bg-green-600 text-white' : ''}
    `,
    outline: `
      border border-slate-600 hover:border-slate-500 text-slate-300
      ${copied ? 'border-green-500 text-green-400' : ''}
    `,
    ghost: `
      hover:bg-slate-700/50 text-slate-400
      ${copied ? 'text-green-400' : ''}
    `,
    primary: `
      bg-purple-500 hover:bg-purple-600 text-white
      ${copied ? 'bg-green-500' : ''}
    `
  }

  const Icon = copied ? FiCheck : FiCopy

  return (
    <button
      onClick={() => copy(text)}
      className={`
        inline-flex items-center gap-1.5 rounded-lg
        transition-all duration-200
        ${sizes[size]}
        ${variants[variant]}
        ${className}
      `}
      title={copied ? copiedLabel : label}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {showLabel && <span>{copied ? copiedLabel : label}</span>}
    </button>
  )
}

/**
 * Copyable Text Component
 */
export const CopyableText = ({
  text,
  displayText,
  truncate = false,
  maxLength = 20,
  showCopyButton = true,
  className = ''
}) => {
  const { copy, copied } = useClipboard()
  
  const displayValue = displayText || text
  const truncatedText = truncate && displayValue.length > maxLength
    ? `${displayValue.slice(0, maxLength)}...`
    : displayValue

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`font-mono text-slate-300 ${truncate ? 'cursor-pointer' : ''}`}
        title={displayValue}
        onClick={() => truncate && copy(text)}
      >
        {truncatedText}
      </span>
      
      {showCopyButton && (
        <button
          onClick={() => copy(text)}
          className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
          title="Copy"
        >
          {copied ? (
            <FiCheck className="w-4 h-4 text-green-400" />
          ) : (
            <FiCopy className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  )
}

/**
 * Address Copy Component (for STX addresses)
 */
export const AddressCopy = ({
  address,
  truncateChars = 4,
  showFull = false,
  className = ''
}) => {
  const { copy, copied } = useClipboard()
  
  const truncatedAddress = showFull
    ? address
    : `${address.slice(0, truncateChars + 2)}...${address.slice(-truncateChars)}`

  return (
    <button
      onClick={() => copy(address)}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5
        bg-slate-800 rounded-lg
        text-slate-300 hover:text-white
        transition-colors group
        ${className}
      `}
      title={address}
    >
      <span className="font-mono text-sm">{truncatedAddress}</span>
      {copied ? (
        <FiCheck className="w-4 h-4 text-green-400" />
      ) : (
        <FiCopy className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
      )}
    </button>
  )
}

/**
 * Copy Link Button
 */
export const CopyLinkButton = ({
  url,
  label = 'Copy Link',
  className = ''
}) => {
  const { copy, copied } = useClipboard()

  return (
    <button
      onClick={() => copy(url || window.location.href)}
      className={`
        inline-flex items-center gap-2 px-4 py-2
        bg-slate-800 hover:bg-slate-700
        rounded-lg text-slate-300
        transition-colors
        ${className}
      `}
    >
      {copied ? (
        <>
          <FiCheck className="w-4 h-4 text-green-400" />
          <span className="text-green-400">Link Copied!</span>
        </>
      ) : (
        <>
          <FiLink className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  )
}

/**
 * Share Button with Copy Fallback
 */
export const ShareButton = ({
  title,
  text,
  url,
  onShare,
  className = ''
}) => {
  const { copy, copied } = useClipboard()
  const [shared, setShared] = useState(false)

  const canShare = navigator.share !== undefined

  const handleShare = async () => {
    const shareUrl = url || window.location.href

    if (canShare) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl
        })
        setShared(true)
        onShare?.('native')
        setTimeout(() => setShared(false), 2000)
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fallback to copy
          copy(shareUrl)
          onShare?.('clipboard')
        }
      }
    } else {
      // Browser doesn't support Web Share API
      copy(shareUrl)
      onShare?.('clipboard')
    }
  }

  const isSuccess = shared || copied

  return (
    <button
      onClick={handleShare}
      className={`
        inline-flex items-center gap-2 px-4 py-2
        bg-purple-500 hover:bg-purple-600
        rounded-lg text-white font-medium
        transition-colors
        ${isSuccess ? 'bg-green-500' : ''}
        ${className}
      `}
    >
      {isSuccess ? (
        <>
          <FiCheck className="w-4 h-4" />
          {shared ? 'Shared!' : 'Copied!'}
        </>
      ) : (
        <>
          <FiShare2 className="w-4 h-4" />
          Share
        </>
      )}
    </button>
  )
}

/**
 * Code Block with Copy
 */
export const CodeBlock = ({
  code,
  language = 'text',
  showLineNumbers = false,
  className = ''
}) => {
  const { copy, copied } = useClipboard()
  const lines = code.split('\n')

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <span className="text-xs text-slate-400 uppercase">{language}</span>
        <button
          onClick={() => copy(code)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <FiCheck className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <FiCopy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="p-4 bg-slate-800 overflow-x-auto">
        <pre className="text-sm font-mono text-slate-300">
          {showLineNumbers ? (
            lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="w-8 text-slate-600 select-none">{i + 1}</span>
                <code>{line}</code>
              </div>
            ))
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  )
}

/**
 * Input with Copy Button
 */
export const CopyInput = ({
  value,
  label,
  readOnly = true,
  className = ''
}) => {
  const { copy, copied } = useClipboard()

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="flex">
        <input
          type="text"
          value={value}
          readOnly={readOnly}
          className="
            flex-1 px-4 py-2
            bg-slate-800 border border-slate-700
            rounded-l-lg text-slate-300
            font-mono text-sm
            focus:outline-none focus:border-purple-500
          "
        />
        <button
          onClick={() => copy(value)}
          className={`
            px-4 py-2 border border-l-0 border-slate-700
            rounded-r-lg transition-colors
            ${copied
              ? 'bg-green-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }
          `}
        >
          {copied ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}

export default {
  copyToClipboard,
  useClipboard,
  CopyButton,
  CopyableText,
  AddressCopy,
  CopyLinkButton,
  ShareButton,
  CodeBlock,
  CopyInput
}
