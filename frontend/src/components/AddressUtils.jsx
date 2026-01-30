import React, { useState, useCallback } from 'react'
import { HiClipboard, HiClipboardCheck, HiExternalLink } from 'react-icons/hi'

/**
 * Address display and copy utilities
 * Includes copy-to-clipboard, truncation, and explorer links
 */

// Truncate address for display
export const truncateAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return ''
  if (address.length <= startChars + endChars + 3) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

// Copy to clipboard hook
export const useCopyToClipboard = (timeout = 2000) => {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text) => {
    if (!text) return false

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), timeout)
      return true
    } catch (error) {
      console.error('Failed to copy:', error)
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), timeout)
        return true
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError)
        return false
      }
    }
  }, [timeout])

  return { copied, copy }
}

// Copy button component
export const CopyButton = ({ 
  text, 
  onCopy,
  size = 'md',
  className = '',
  showTooltip = true
}) => {
  const { copied, copy } = useCopyToClipboard()

  const handleCopy = async () => {
    const success = await copy(text)
    if (success && onCopy) {
      onCopy(text)
    }
  }

  const sizes = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <button
      onClick={handleCopy}
      className={`relative rounded-lg hover:bg-arena-purple/20 transition-all ${sizes[size]} ${className}`}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <HiClipboardCheck className={`${iconSizes[size]} text-arena-green`} />
      ) : (
        <HiClipboard className={`${iconSizes[size]} text-gray-400 hover:text-white transition-colors`} />
      )}
      
      {/* Tooltip */}
      {showTooltip && copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-arena-green text-white rounded-lg whitespace-nowrap animate-fade-in">
          Copied!
        </span>
      )}
    </button>
  )
}

// Full address display with copy
export const AddressDisplay = ({
  address,
  truncate = true,
  startChars = 6,
  endChars = 4,
  showCopy = true,
  showExplorer = false,
  explorerUrl = 'https://explorer.stacks.co/address',
  onCopy,
  className = ''
}) => {
  const displayAddress = truncate 
    ? truncateAddress(address, startChars, endChars) 
    : address

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span 
        className="font-mono text-sm text-gray-300 hover:text-white transition-colors cursor-default"
        title={address}
      >
        {displayAddress}
      </span>
      
      {showCopy && (
        <CopyButton text={address} onCopy={onCopy} size="sm" />
      )}
      
      {showExplorer && (
        <a
          href={`${explorerUrl}/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded-lg hover:bg-arena-purple/20 transition-colors"
          aria-label="View on explorer"
          title="View on explorer"
        >
          <HiExternalLink className="w-3 h-3 text-gray-400 hover:text-arena-cyan transition-colors" />
        </a>
      )}
    </div>
  )
}

// Styled address badge
export const AddressBadge = ({
  address,
  label,
  variant = 'default',
  showCopy = true,
  onCopy,
  className = ''
}) => {
  const variants = {
    default: 'bg-arena-purple/20 text-white',
    success: 'bg-arena-green/20 text-arena-green',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-arena-cyan/20 text-arena-cyan'
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${variants[variant]} ${className}`}>
      {label && (
        <span className="text-xs text-gray-400">{label}</span>
      )}
      <AddressDisplay 
        address={address}
        showCopy={showCopy}
        onCopy={onCopy}
      />
    </div>
  )
}

// Wallet address card with balance
export const WalletAddressCard = ({
  address,
  balance,
  network = 'mainnet',
  onDisconnect,
  onCopy,
  className = ''
}) => {
  const networkColors = {
    mainnet: 'bg-arena-green/20 text-arena-green',
    testnet: 'bg-yellow-500/20 text-yellow-400'
  }

  return (
    <div className={`glass-card rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-0.5 rounded-full text-xs ${networkColors[network]}`}>
          {network}
        </span>
        {onDisconnect && (
          <button
            onClick={onDisconnect}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <AddressDisplay 
            address={address}
            showCopy={true}
            showExplorer={true}
            onCopy={onCopy}
          />
          {balance !== undefined && (
            <p className="text-lg font-semibold text-white mt-1">
              {balance.toLocaleString()} <span className="text-sm text-gray-400">STX</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Transaction hash display
export const TxHashDisplay = ({
  txHash,
  explorerUrl = 'https://explorer.stacks.co/txid',
  showStatus = false,
  status = 'pending',
  onCopy,
  className = ''
}) => {
  const statusColors = {
    pending: 'text-yellow-400',
    success: 'text-arena-green',
    failed: 'text-red-400'
  }

  const statusIcons = {
    pending: '⏳',
    success: '✅',
    failed: '❌'
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {showStatus && (
        <span className={statusColors[status]} title={status}>
          {statusIcons[status]}
        </span>
      )}
      
      <span className="font-mono text-sm text-gray-300">
        {truncateAddress(txHash, 8, 8)}
      </span>
      
      <CopyButton text={txHash} onCopy={onCopy} size="sm" />
      
      <a
        href={`${explorerUrl}/${txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1 rounded-lg hover:bg-arena-purple/20 transition-colors"
        aria-label="View transaction"
        title="View transaction"
      >
        <HiExternalLink className="w-3 h-3 text-gray-400 hover:text-arena-cyan transition-colors" />
      </a>
    </div>
  )
}

export default {
  truncateAddress,
  useCopyToClipboard,
  CopyButton,
  AddressDisplay,
  AddressBadge,
  WalletAddressCard,
  TxHashDisplay
}
