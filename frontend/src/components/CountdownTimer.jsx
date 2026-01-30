import React, { useState, useEffect, useMemo } from 'react'

/**
 * Countdown timer component for market end times
 * Converts block height to time and displays countdown
 */

// Stacks block time is approximately 10 minutes (can vary)
const STACKS_BLOCK_TIME_SECONDS = 600 // 10 minutes average

// Calculate time remaining from block height
const calculateTimeRemaining = (targetBlock, currentBlock) => {
  if (!targetBlock || !currentBlock || targetBlock <= currentBlock) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  }

  const blocksRemaining = targetBlock - currentBlock
  const totalSeconds = blocksRemaining * STACKS_BLOCK_TIME_SECONDS

  const days = Math.floor(totalSeconds / (60 * 60 * 24))
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = Math.floor(totalSeconds % 60)

  return {
    total: totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    blocksRemaining,
    isExpired: false
  }
}

// Format number with leading zero
const padZero = (num) => String(num).padStart(2, '0')

// Individual time unit box
const TimeUnit = ({ value, label, isUrgent }) => (
  <div className="flex flex-col items-center">
    <div 
      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-bold text-xl sm:text-2xl tabular-nums transition-all ${
        isUrgent 
          ? 'bg-red-500/20 text-red-400 animate-pulse' 
          : 'glass-card text-white'
      }`}
    >
      {padZero(value)}
    </div>
    <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{label}</span>
  </div>
)

// Separator between time units
const Separator = () => (
  <div className="flex flex-col justify-center h-14 sm:h-16">
    <span className="text-2xl text-gray-600 font-bold">:</span>
  </div>
)

// Main countdown component
const CountdownTimer = ({
  targetBlock,
  currentBlock,
  onExpire,
  showBlocks = false,
  compact = false,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(() => 
    calculateTimeRemaining(targetBlock, currentBlock)
  )

  // Recalculate every second for smoother countdown
  useEffect(() => {
    if (timeLeft.isExpired) {
      onExpire?.()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.total <= 1) {
          onExpire?.()
          return { ...prev, total: 0, isExpired: true }
        }
        
        // Decrement by 1 second
        const newTotal = prev.total - 1
        const days = Math.floor(newTotal / (60 * 60 * 24))
        const hours = Math.floor((newTotal % (60 * 60 * 24)) / (60 * 60))
        const minutes = Math.floor((newTotal % (60 * 60)) / 60)
        const seconds = Math.floor(newTotal % 60)

        return {
          ...prev,
          total: newTotal,
          days,
          hours,
          minutes,
          seconds
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft.isExpired, onExpire])

  // Update when block height changes
  useEffect(() => {
    setTimeLeft(calculateTimeRemaining(targetBlock, currentBlock))
  }, [targetBlock, currentBlock])

  const isUrgent = timeLeft.total > 0 && timeLeft.total < 3600 // Less than 1 hour
  const isWarning = timeLeft.total > 0 && timeLeft.total < 86400 // Less than 1 day

  if (timeLeft.isExpired) {
    return (
      <div className={`text-center ${className}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-700/50 text-gray-400">
          <span className="text-lg">⏰</span>
          <span className="font-medium">Market Ended</span>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <span className={`font-mono tabular-nums ${isUrgent ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-white'}`}>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {padZero(timeLeft.hours)}:{padZero(timeLeft.minutes)}:{padZero(timeLeft.seconds)}
        </span>
        {showBlocks && (
          <span className="text-xs text-gray-500">
            ({timeLeft.blocksRemaining?.toLocaleString()} blocks)
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {timeLeft.days > 0 && (
          <>
            <TimeUnit value={timeLeft.days} label="Days" isUrgent={isUrgent} />
            <Separator />
          </>
        )}
        <TimeUnit value={timeLeft.hours} label="Hours" isUrgent={isUrgent} />
        <Separator />
        <TimeUnit value={timeLeft.minutes} label="Min" isUrgent={isUrgent} />
        <Separator />
        <TimeUnit value={timeLeft.seconds} label="Sec" isUrgent={isUrgent} />
      </div>
      
      {showBlocks && timeLeft.blocksRemaining && (
        <p className="text-center text-xs text-gray-500 mt-2">
          ~{timeLeft.blocksRemaining.toLocaleString()} blocks remaining
        </p>
      )}

      {isUrgent && (
        <p className="text-center text-sm text-red-400 mt-2 animate-pulse">
          ⚠️ Ending soon!
        </p>
      )}
    </div>
  )
}

// Progress bar variant
export const CountdownProgress = ({
  targetBlock,
  currentBlock,
  startBlock,
  className = ''
}) => {
  const progress = useMemo(() => {
    if (!targetBlock || !currentBlock || !startBlock) return 0
    if (currentBlock >= targetBlock) return 100
    
    const total = targetBlock - startBlock
    const elapsed = currentBlock - startBlock
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }, [targetBlock, currentBlock, startBlock])

  const timeLeft = calculateTimeRemaining(targetBlock, currentBlock)
  const isUrgent = timeLeft.total > 0 && timeLeft.total < 3600

  return (
    <div className={className}>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Started</span>
        <span>{timeLeft.isExpired ? 'Ended' : 'Ends in'}</span>
      </div>
      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            isUrgent 
              ? 'bg-gradient-to-r from-yellow-500 to-red-500' 
              : 'bg-gradient-to-r from-arena-purple to-arena-pink'
          }`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="text-gray-500">Block {startBlock?.toLocaleString()}</span>
        <span className={isUrgent ? 'text-red-400' : 'text-gray-400'}>
          {timeLeft.isExpired 
            ? 'Expired' 
            : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`
          }
        </span>
      </div>
    </div>
  )
}

// Hook for using countdown logic elsewhere
export const useCountdown = (targetBlock, currentBlock) => {
  const [timeLeft, setTimeLeft] = useState(() => 
    calculateTimeRemaining(targetBlock, currentBlock)
  )

  useEffect(() => {
    if (timeLeft.isExpired) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.total <= 1) {
          return { ...prev, total: 0, isExpired: true }
        }
        const newTotal = prev.total - 1
        return {
          ...prev,
          total: newTotal,
          days: Math.floor(newTotal / 86400),
          hours: Math.floor((newTotal % 86400) / 3600),
          minutes: Math.floor((newTotal % 3600) / 60),
          seconds: newTotal % 60
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft.isExpired])

  useEffect(() => {
    setTimeLeft(calculateTimeRemaining(targetBlock, currentBlock))
  }, [targetBlock, currentBlock])

  return timeLeft
}

export default CountdownTimer
