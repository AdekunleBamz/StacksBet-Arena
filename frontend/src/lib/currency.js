import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Currency converter and price utilities for StacksBet Arena
 */

// Supported currencies
export const CURRENCIES = {
  STX: { symbol: 'STX', name: 'Stacks', decimals: 6 },
  USD: { symbol: 'USD', name: 'US Dollar', decimals: 2 },
  EUR: { symbol: 'EUR', name: 'Euro', decimals: 2 },
  GBP: { symbol: 'GBP', name: 'British Pound', decimals: 2 },
  BTC: { symbol: 'BTC', name: 'Bitcoin', decimals: 8 },
  ETH: { symbol: 'ETH', name: 'Ethereum', decimals: 8 }
}

// Currency symbols for display
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  BTC: '₿',
  ETH: 'Ξ',
  STX: ''
}

// Cache for price data
const priceCache = {
  data: null,
  timestamp: 0,
  ttl: 60000 // 1 minute cache
}

/**
 * Fetch current STX price from API
 */
export const fetchStxPrice = async () => {
  // Check cache first
  if (priceCache.data && Date.now() - priceCache.timestamp < priceCache.ttl) {
    return priceCache.data
  }

  try {
    // Using CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd,eur,gbp,btc,eth'
    )
    
    if (!response.ok) {
      throw new Error('Failed to fetch price')
    }

    const data = await response.json()
    const prices = {
      USD: data.blockstack?.usd || 0,
      EUR: data.blockstack?.eur || 0,
      GBP: data.blockstack?.gbp || 0,
      BTC: data.blockstack?.btc || 0,
      ETH: data.blockstack?.eth || 0
    }

    // Update cache
    priceCache.data = prices
    priceCache.timestamp = Date.now()

    return prices
  } catch (error) {
    console.error('Error fetching STX price:', error)
    
    // Return cached data if available, or fallback values
    return priceCache.data || {
      USD: 0.50,
      EUR: 0.46,
      GBP: 0.40,
      BTC: 0.000012,
      ETH: 0.00025
    }
  }
}

/**
 * Convert STX to fiat currency
 */
export const stxToFiat = async (stxAmount, currency = 'USD') => {
  const prices = await fetchStxPrice()
  const rate = prices[currency] || 0
  return stxAmount * rate
}

/**
 * Convert fiat to STX
 */
export const fiatToStx = async (fiatAmount, currency = 'USD') => {
  const prices = await fetchStxPrice()
  const rate = prices[currency] || 0
  if (rate === 0) return 0
  return fiatAmount / rate
}

/**
 * Format currency amount
 */
export const formatCurrency = (amount, currency = 'USD', options = {}) => {
  const {
    showSymbol = true,
    decimals = CURRENCIES[currency]?.decimals || 2,
    locale = 'en-US',
    compact = false
  } = options

  if (currency === 'STX') {
    const formatted = amount.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
    return showSymbol ? `${formatted} STX` : formatted
  }

  if (compact && Math.abs(amount) >= 1000) {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      compactDisplay: 'short'
    })
    return formatter.format(amount)
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

  return formatter.format(amount)
}

/**
 * Format STX amount
 */
export const formatStx = (amount, options = {}) => {
  const { decimals = 2, showSymbol = true, compact = false } = options

  if (compact && Math.abs(amount) >= 1000000) {
    const millions = amount / 1000000
    return `${millions.toFixed(1)}M${showSymbol ? ' STX' : ''}`
  }

  if (compact && Math.abs(amount) >= 1000) {
    const thousands = amount / 1000
    return `${thousands.toFixed(1)}K${showSymbol ? ' STX' : ''}`
  }

  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

  return showSymbol ? `${formatted} STX` : formatted
}

/**
 * Hook for currency conversion
 */
export const useCurrencyConverter = (defaultCurrency = 'USD') => {
  const [prices, setPrices] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currency, setCurrency] = useState(defaultCurrency)
  const intervalRef = useRef(null)

  // Fetch prices
  const refreshPrices = useCallback(async () => {
    try {
      const newPrices = await fetchStxPrice()
      setPrices(newPrices)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch and setup refresh interval
  useEffect(() => {
    refreshPrices()
    
    // Refresh every minute
    intervalRef.current = setInterval(refreshPrices, 60000)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [refreshPrices])

  // Convert STX to selected currency
  const convertFromStx = useCallback((stxAmount) => {
    if (!prices || !prices[currency]) return 0
    return stxAmount * prices[currency]
  }, [prices, currency])

  // Convert selected currency to STX
  const convertToStx = useCallback((fiatAmount) => {
    if (!prices || !prices[currency] || prices[currency] === 0) return 0
    return fiatAmount / prices[currency]
  }, [prices, currency])

  // Format converted amount
  const formatConverted = useCallback((stxAmount, options = {}) => {
    const converted = convertFromStx(stxAmount)
    return formatCurrency(converted, currency, options)
  }, [convertFromStx, currency])

  return {
    prices,
    loading,
    error,
    currency,
    setCurrency,
    convertFromStx,
    convertToStx,
    formatConverted,
    refreshPrices,
    currentRate: prices?.[currency] || 0
  }
}

/**
 * Hook for displaying both STX and fiat values
 */
export const useDualCurrency = (stxAmount, currency = 'USD') => {
  const { convertFromStx, loading, currentRate } = useCurrencyConverter(currency)
  
  const fiatAmount = convertFromStx(stxAmount)
  
  return {
    stx: formatStx(stxAmount),
    fiat: formatCurrency(fiatAmount, currency),
    loading,
    rate: currentRate
  }
}

/**
 * Price display component data
 */
export const getPriceDisplay = (stxAmount, prices, currency = 'USD') => {
  const rate = prices?.[currency] || 0
  const fiatAmount = stxAmount * rate

  return {
    stx: formatStx(stxAmount),
    fiat: formatCurrency(fiatAmount, currency),
    rate: rate,
    rateFormatted: `1 STX = ${formatCurrency(rate, currency)}`
  }
}

/**
 * Calculate price change percentage
 */
export const calculatePriceChange = (oldPrice, newPrice) => {
  if (oldPrice === 0) return 0
  return ((newPrice - oldPrice) / oldPrice) * 100
}

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * Get price change class for styling
 */
export const getPriceChangeClass = (change) => {
  if (change > 0) return 'text-green-400'
  if (change < 0) return 'text-red-400'
  return 'text-slate-400'
}

/**
 * Parse and format large numbers
 */
export const formatLargeNumber = (num, decimals = 2) => {
  if (Math.abs(num) >= 1e12) {
    return `${(num / 1e12).toFixed(decimals)}T`
  }
  if (Math.abs(num) >= 1e9) {
    return `${(num / 1e9).toFixed(decimals)}B`
  }
  if (Math.abs(num) >= 1e6) {
    return `${(num / 1e6).toFixed(decimals)}M`
  }
  if (Math.abs(num) >= 1e3) {
    return `${(num / 1e3).toFixed(decimals)}K`
  }
  return num.toFixed(decimals)
}

/**
 * Round to significant figures
 */
export const roundToSignificant = (num, figures = 3) => {
  if (num === 0) return 0
  const magnitude = Math.floor(Math.log10(Math.abs(num)))
  const multiplier = Math.pow(10, figures - magnitude - 1)
  return Math.round(num * multiplier) / multiplier
}

/**
 * Currency conversion presets
 */
export const CONVERSION_PRESETS = [
  { stx: 10, label: '10 STX' },
  { stx: 50, label: '50 STX' },
  { stx: 100, label: '100 STX' },
  { stx: 500, label: '500 STX' },
  { stx: 1000, label: '1K STX' }
]

export default {
  CURRENCIES,
  CURRENCY_SYMBOLS,
  fetchStxPrice,
  stxToFiat,
  fiatToStx,
  formatCurrency,
  formatStx,
  useCurrencyConverter,
  useDualCurrency,
  getPriceDisplay,
  calculatePriceChange,
  formatPercentage,
  getPriceChangeClass,
  formatLargeNumber,
  roundToSignificant,
  CONVERSION_PRESETS
}
