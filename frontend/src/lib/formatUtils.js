/**
 * Formatting utility functions for the StacksBet Arena application
 * Handles numbers, currencies, dates, addresses, and more
 */

// ============================================
// Number Formatting
// ============================================

/**
 * Format a number with thousand separators
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatCompactNumber = (value) => {
  if (value === null || value === undefined) return '-'
  
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  
  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(1)}B`
  }
  if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(1)}M`
  }
  if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(1)}K`
  }
  return `${sign}${absValue.toFixed(0)}`
}

/**
 * Format percentage
 */
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(decimals)}%`
}

/**
 * Format odds (e.g., 2.5x)
 */
export const formatOdds = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(decimals)}x`
}

// ============================================
// Currency Formatting
// ============================================

/**
 * Format STX amount (handles microSTX conversion)
 */
export const formatSTX = (microStx, showUnit = true) => {
  if (microStx === null || microStx === undefined) return '-'
  const stx = microStx / 1_000_000
  const formatted = formatNumber(stx, stx < 0.01 ? 6 : stx < 1 ? 4 : 2)
  return showUnit ? `${formatted} STX` : formatted
}

/**
 * Format USD amount
 */
export const formatUSD = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

/**
 * Format crypto with appropriate decimals
 */
export const formatCrypto = (value, symbol = 'STX', decimals = 4) => {
  if (value === null || value === undefined) return '-'
  return `${formatNumber(value, decimals)} ${symbol}`
}

// ============================================
// Date/Time Formatting
// ============================================

/**
 * Format date relative to now
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-'
  const now = new Date()
  const target = new Date(date)
  const diffMs = target - now
  const diffSecs = Math.floor(Math.abs(diffMs) / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  const isPast = diffMs < 0
  const prefix = isPast ? '' : 'in '
  const suffix = isPast ? ' ago' : ''
  
  if (diffDays > 30) {
    return formatDate(date)
  }
  if (diffDays > 0) {
    return `${prefix}${diffDays} day${diffDays === 1 ? '' : 's'}${suffix}`
  }
  if (diffHours > 0) {
    return `${prefix}${diffHours} hour${diffHours === 1 ? '' : 's'}${suffix}`
  }
  if (diffMins > 0) {
    return `${prefix}${diffMins} minute${diffMins === 1 ? '' : 's'}${suffix}`
  }
  return isPast ? 'just now' : 'in a moment'
}

/**
 * Format date for display
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '-'
  const defaultOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

/**
 * Format time
 */
export const formatTime = (date, showSeconds = false) => {
  if (!date) return '-'
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    ...(showSeconds && { second: '2-digit' })
  })
}

/**
 * Format datetime
 */
export const formatDateTime = (date) => {
  if (!date) return '-'
  return `${formatDate(date)} ${formatTime(date)}`
}

/**
 * Format duration in seconds
 */
export const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return '-'
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (days > 0) {
    return `${days}d ${hours}h`
  }
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`
  }
  return `${secs}s`
}

// ============================================
// Address Formatting
// ============================================

/**
 * Truncate blockchain address
 */
export const truncateAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return ''
  if (address.length <= startChars + endChars + 3) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Format transaction hash
 */
export const formatTxHash = (hash, chars = 8) => {
  if (!hash) return ''
  return truncateAddress(hash, chars, chars)
}

/**
 * Get explorer URL for address
 */
export const getAddressExplorerUrl = (address, network = 'mainnet') => {
  const baseUrl = network === 'mainnet' 
    ? 'https://explorer.stacks.co/address'
    : 'https://explorer.stacks.co/address?chain=testnet'
  return `${baseUrl}/${address}`
}

/**
 * Get explorer URL for transaction
 */
export const getTxExplorerUrl = (txId, network = 'mainnet') => {
  const baseUrl = network === 'mainnet'
    ? 'https://explorer.stacks.co/txid'
    : 'https://explorer.stacks.co/txid?chain=testnet'
  return `${baseUrl}/${txId}`
}

// ============================================
// Validation Helpers
// ============================================

/**
 * Check if string is a valid Stacks address
 */
export const isValidStacksAddress = (address) => {
  if (!address || typeof address !== 'string') return false
  // Mainnet: SP..., Testnet: ST...
  return /^S[PT][A-Z0-9]{38,39}$/.test(address)
}

/**
 * Check if string is a valid tx hash
 */
export const isValidTxHash = (hash) => {
  if (!hash || typeof hash !== 'string') return false
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

// ============================================
// Misc Utilities
// ============================================

/**
 * Pluralize a word
 */
export const pluralize = (count, singular, plural = null) => {
  const pluralForm = plural || `${singular}s`
  return count === 1 ? singular : pluralForm
}

/**
 * Convert blocks to approximate time
 */
export const blocksToTime = (blocks, blockTimeSeconds = 600) => {
  return formatDuration(blocks * blockTimeSeconds)
}

/**
 * Calculate percentage change
 */
export const calculatePercentChange = (oldValue, newValue) => {
  if (oldValue === 0) return 0
  return ((newValue - oldValue) / oldValue) * 100
}

export default {
  formatNumber,
  formatCompactNumber,
  formatPercent,
  formatOdds,
  formatSTX,
  formatUSD,
  formatCrypto,
  formatRelativeTime,
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
  truncateAddress,
  formatTxHash,
  getAddressExplorerUrl,
  getTxExplorerUrl,
  isValidStacksAddress,
  isValidTxHash,
  pluralize,
  blocksToTime,
  calculatePercentChange
}
