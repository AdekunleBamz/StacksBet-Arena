import { useState, useEffect, useCallback, useMemo } from 'react'

/**
 * Date and Time utilities for StacksBet Arena
 * Comprehensive datetime handling with localization support
 */

// Time constants
export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR
export const WEEK = 7 * DAY
export const MONTH = 30 * DAY
export const YEAR = 365 * DAY

/**
 * Format date to various formats
 */
export const formatDate = (date, format = 'medium', locale = 'en-US') => {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) return 'Invalid date'

  const formats = {
    // Short: 1/20/24
    short: { dateStyle: 'short' },
    // Medium: Jan 20, 2024
    medium: { dateStyle: 'medium' },
    // Long: January 20, 2024
    long: { dateStyle: 'long' },
    // Full: Saturday, January 20, 2024
    full: { dateStyle: 'full' },
    // Time only: 3:45 PM
    time: { timeStyle: 'short' },
    // Time with seconds: 3:45:30 PM
    timeLong: { timeStyle: 'medium' },
    // Date and time: Jan 20, 2024, 3:45 PM
    datetime: { dateStyle: 'medium', timeStyle: 'short' },
    // ISO: 2024-01-20
    iso: 'iso',
    // Custom numeric: 01/20/2024
    numeric: { year: 'numeric', month: '2-digit', day: '2-digit' }
  }

  if (format === 'iso') {
    return d.toISOString().split('T')[0]
  }

  const options = formats[format] || formats.medium
  return new Intl.DateTimeFormat(locale, options).format(d)
}

/**
 * Format time to various formats
 */
export const formatTime = (date, format = 'short', locale = 'en-US') => {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) return 'Invalid time'

  const formats = {
    short: { hour: '2-digit', minute: '2-digit' },
    long: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
    hour: { hour: 'numeric', hour12: true },
    '24h': { hour: '2-digit', minute: '2-digit', hour12: false }
  }

  const options = formats[format] || formats.short
  return new Intl.DateTimeFormat(locale, options).format(d)
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date, baseDate = new Date(), locale = 'en-US') => {
  const d = new Date(date)
  const base = new Date(baseDate)
  
  if (isNaN(d.getTime())) return 'Invalid date'

  const diff = d.getTime() - base.getTime()
  const absDiff = Math.abs(diff)
  const isPast = diff < 0

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (absDiff < MINUTE) {
    const seconds = Math.round(absDiff / SECOND)
    return rtf.format(isPast ? -seconds : seconds, 'second')
  }
  
  if (absDiff < HOUR) {
    const minutes = Math.round(absDiff / MINUTE)
    return rtf.format(isPast ? -minutes : minutes, 'minute')
  }
  
  if (absDiff < DAY) {
    const hours = Math.round(absDiff / HOUR)
    return rtf.format(isPast ? -hours : hours, 'hour')
  }
  
  if (absDiff < WEEK) {
    const days = Math.round(absDiff / DAY)
    return rtf.format(isPast ? -days : days, 'day')
  }
  
  if (absDiff < MONTH) {
    const weeks = Math.round(absDiff / WEEK)
    return rtf.format(isPast ? -weeks : weeks, 'week')
  }
  
  if (absDiff < YEAR) {
    const months = Math.round(absDiff / MONTH)
    return rtf.format(isPast ? -months : months, 'month')
  }

  const years = Math.round(absDiff / YEAR)
  return rtf.format(isPast ? -years : years, 'year')
}

/**
 * Get short relative time (e.g., "2h", "3d", "1w")
 */
export const getShortRelativeTime = (date, baseDate = new Date()) => {
  const d = new Date(date)
  const base = new Date(baseDate)
  
  if (isNaN(d.getTime())) return '?'

  const diff = Math.abs(d.getTime() - base.getTime())

  if (diff < MINUTE) return `${Math.round(diff / SECOND)}s`
  if (diff < HOUR) return `${Math.round(diff / MINUTE)}m`
  if (diff < DAY) return `${Math.round(diff / HOUR)}h`
  if (diff < WEEK) return `${Math.round(diff / DAY)}d`
  if (diff < MONTH) return `${Math.round(diff / WEEK)}w`
  if (diff < YEAR) return `${Math.round(diff / MONTH)}mo`
  return `${Math.round(diff / YEAR)}y`
}

/**
 * Get countdown parts (days, hours, minutes, seconds)
 */
export const getCountdownParts = (targetDate, fromDate = new Date()) => {
  const target = new Date(targetDate)
  const from = new Date(fromDate)
  
  const diff = target.getTime() - from.getTime()
  
  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  const days = Math.floor(diff / DAY)
  const hours = Math.floor((diff % DAY) / HOUR)
  const minutes = Math.floor((diff % HOUR) / MINUTE)
  const seconds = Math.floor((diff % MINUTE) / SECOND)

  return { expired: false, days, hours, minutes, seconds, total: diff }
}

/**
 * Format countdown for display
 */
export const formatCountdown = (targetDate, options = {}) => {
  const { 
    showDays = true, 
    showSeconds = true,
    padNumbers = true,
    separator = ':'
  } = options

  const parts = getCountdownParts(targetDate)
  
  if (parts.expired) return '00:00:00'

  const pad = (n) => padNumbers ? String(n).padStart(2, '0') : n

  const segments = []
  
  if (showDays && parts.days > 0) {
    segments.push(parts.days + 'd')
  }
  
  segments.push(pad(parts.hours))
  segments.push(pad(parts.minutes))
  
  if (showSeconds) {
    segments.push(pad(parts.seconds))
  }

  return segments.join(separator)
}

/**
 * Get market deadline status
 */
export const getDeadlineStatus = (deadline) => {
  const parts = getCountdownParts(deadline)
  
  if (parts.expired) {
    return { status: 'expired', label: 'Ended', color: 'gray' }
  }
  
  if (parts.total < HOUR) {
    return { status: 'urgent', label: 'Ending Soon', color: 'red' }
  }
  
  if (parts.total < DAY) {
    return { status: 'warning', label: 'Less than 24h', color: 'orange' }
  }
  
  if (parts.total < WEEK) {
    return { status: 'active', label: `${parts.days} days left`, color: 'yellow' }
  }
  
  return { status: 'normal', label: formatDate(deadline, 'medium'), color: 'green' }
}

/**
 * Check if date is today
 */
export const isToday = (date) => {
  const d = new Date(date)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

/**
 * Check if date is yesterday
 */
export const isYesterday = (date) => {
  const d = new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return d.toDateString() === yesterday.toDateString()
}

/**
 * Check if date is this week
 */
export const isThisWeek = (date) => {
  const d = new Date(date)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  return d >= startOfWeek && d <= now
}

/**
 * Get smart date label (Today, Yesterday, or formatted)
 */
export const getSmartDateLabel = (date, locale = 'en-US') => {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  if (diff < WEEK) {
    return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(d)
  }
  
  if (d.getFullYear() === now.getFullYear()) {
    return formatDate(date, 'medium', locale).replace(`, ${now.getFullYear()}`, '')
  }
  
  return formatDate(date, 'medium', locale)
}

/**
 * Parse various date formats
 */
export const parseDate = (input) => {
  if (!input) return null
  if (input instanceof Date) return input
  
  // Unix timestamp (seconds)
  if (typeof input === 'number' && input < 10000000000) {
    return new Date(input * 1000)
  }
  
  // Unix timestamp (milliseconds)
  if (typeof input === 'number') {
    return new Date(input)
  }
  
  // ISO string or other formats
  const date = new Date(input)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Add time to date
 */
export const addTime = (date, amount, unit = 'days') => {
  const d = new Date(date)
  
  const units = {
    seconds: SECOND,
    minutes: MINUTE,
    hours: HOUR,
    days: DAY,
    weeks: WEEK,
    months: MONTH,
    years: YEAR
  }

  const ms = units[unit] || DAY
  return new Date(d.getTime() + amount * ms)
}

/**
 * Get difference between dates
 */
export const getDateDiff = (date1, date2, unit = 'days') => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diff = Math.abs(d2.getTime() - d1.getTime())

  const units = {
    seconds: SECOND,
    minutes: MINUTE,
    hours: HOUR,
    days: DAY,
    weeks: WEEK
  }

  return Math.floor(diff / (units[unit] || DAY))
}

/**
 * Format duration in milliseconds
 */
export const formatDuration = (ms, options = {}) => {
  const { short = false, units = ['d', 'h', 'm', 's'] } = options
  
  if (ms < 0) return '0s'

  const parts = []
  let remaining = ms

  if (units.includes('d') && remaining >= DAY) {
    const days = Math.floor(remaining / DAY)
    parts.push(short ? `${days}d` : `${days} day${days !== 1 ? 's' : ''}`)
    remaining %= DAY
  }

  if (units.includes('h') && remaining >= HOUR) {
    const hours = Math.floor(remaining / HOUR)
    parts.push(short ? `${hours}h` : `${hours} hour${hours !== 1 ? 's' : ''}`)
    remaining %= HOUR
  }

  if (units.includes('m') && remaining >= MINUTE) {
    const minutes = Math.floor(remaining / MINUTE)
    parts.push(short ? `${minutes}m` : `${minutes} min${minutes !== 1 ? 's' : ''}`)
    remaining %= MINUTE
  }

  if (units.includes('s') && (remaining > 0 || parts.length === 0)) {
    const seconds = Math.floor(remaining / SECOND)
    parts.push(short ? `${seconds}s` : `${seconds} sec${seconds !== 1 ? 's' : ''}`)
  }

  return parts.join(short ? ' ' : ', ')
}

/**
 * Get timezone info
 */
export const getTimezoneInfo = () => {
  const now = new Date()
  const offset = -now.getTimezoneOffset()
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  
  return {
    name: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset: offset,
    offsetString: `UTC${offset >= 0 ? '+' : '-'}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    abbreviation: now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop()
  }
}

/**
 * Hook: useCountdown
 */
export const useCountdown = (targetDate, options = {}) => {
  const { interval = 1000, onComplete } = options
  const [countdown, setCountdown] = useState(() => getCountdownParts(targetDate))

  useEffect(() => {
    const update = () => {
      const parts = getCountdownParts(targetDate)
      setCountdown(parts)
      
      if (parts.expired) {
        onComplete?.()
      }
    }

    update()
    const timer = setInterval(update, interval)

    return () => clearInterval(timer)
  }, [targetDate, interval, onComplete])

  const formatted = useMemo(() => ({
    full: formatCountdown(targetDate),
    short: formatCountdown(targetDate, { showDays: false, showSeconds: false }),
    compact: getShortRelativeTime(targetDate)
  }), [countdown])

  return { ...countdown, formatted }
}

/**
 * Hook: useRelativeTime
 */
export const useRelativeTime = (date, updateInterval = 60000) => {
  const [relative, setRelative] = useState(() => getRelativeTime(date))

  useEffect(() => {
    const update = () => setRelative(getRelativeTime(date))
    
    update()
    const timer = setInterval(update, updateInterval)

    return () => clearInterval(timer)
  }, [date, updateInterval])

  return relative
}

/**
 * Hook: useNow
 */
export const useNow = (updateInterval = 1000) => {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, updateInterval)

    return () => clearInterval(timer)
  }, [updateInterval])

  return now
}

/**
 * Hook: useClock
 */
export const useClock = (options = {}) => {
  const { format = '24h', showSeconds = true, updateInterval = 1000 } = options
  const now = useNow(updateInterval)

  const time = useMemo(() => {
    const opts = {
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds && { second: '2-digit' }),
      hour12: format === '12h'
    }
    return new Intl.DateTimeFormat('en-US', opts).format(now)
  }, [now, format, showSeconds])

  const date = useMemo(() => formatDate(now, 'full'), [now])

  return { time, date, now }
}

/**
 * Hook: useDeadlineStatus
 */
export const useDeadlineStatus = (deadline, updateInterval = 60000) => {
  const [status, setStatus] = useState(() => getDeadlineStatus(deadline))

  useEffect(() => {
    const update = () => setStatus(getDeadlineStatus(deadline))
    
    update()
    const timer = setInterval(update, updateInterval)

    return () => clearInterval(timer)
  }, [deadline, updateInterval])

  return status
}

/**
 * Hook: useMarketTimer
 */
export const useMarketTimer = (market) => {
  const countdown = useCountdown(market?.deadline || market?.endTime)
  const status = useDeadlineStatus(market?.deadline || market?.endTime)

  const canBet = !countdown.expired && market?.status === 'active'
  const isResolved = market?.status === 'resolved'

  return {
    ...countdown,
    ...status,
    canBet,
    isResolved,
    timeLeft: countdown.total,
    formattedTimeLeft: countdown.formatted.full
  }
}

/**
 * Get date ranges
 */
export const getDateRanges = () => {
  const now = new Date()
  
  return {
    today: {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    },
    yesterday: {
      start: addTime(now, -1, 'days'),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999)
    },
    thisWeek: {
      start: addTime(now, -now.getDay(), 'days'),
      end: now
    },
    lastWeek: {
      start: addTime(now, -now.getDay() - 7, 'days'),
      end: addTime(now, -now.getDay() - 1, 'days')
    },
    thisMonth: {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: now
    },
    lastMonth: {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0)
    },
    last7Days: {
      start: addTime(now, -7, 'days'),
      end: now
    },
    last30Days: {
      start: addTime(now, -30, 'days'),
      end: now
    },
    last90Days: {
      start: addTime(now, -90, 'days'),
      end: now
    },
    thisYear: {
      start: new Date(now.getFullYear(), 0, 1),
      end: now
    }
  }
}

/**
 * Group items by date
 */
export const groupByDate = (items, dateKey = 'createdAt') => {
  const groups = {}

  items.forEach(item => {
    const date = new Date(item[dateKey])
    const label = getSmartDateLabel(date)
    
    if (!groups[label]) {
      groups[label] = {
        label,
        date,
        items: []
      }
    }
    
    groups[label].items.push(item)
  })

  return Object.values(groups).sort((a, b) => b.date - a.date)
}

export default {
  // Constants
  SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, YEAR,
  // Formatters
  formatDate, formatTime, getRelativeTime, getShortRelativeTime,
  formatCountdown, formatDuration,
  // Countdown
  getCountdownParts, getDeadlineStatus,
  // Comparisons
  isToday, isYesterday, isThisWeek, getSmartDateLabel,
  // Utilities
  parseDate, addTime, getDateDiff, getTimezoneInfo,
  getDateRanges, groupByDate,
  // Hooks
  useCountdown, useRelativeTime, useNow, useClock,
  useDeadlineStatus, useMarketTimer
}
