import React, { useState, useMemo, useCallback } from 'react'

/**
 * Bet Amount Slider component with quick select buttons
 * Used in market betting interface for easy amount selection
 */

const BetAmountSlider = ({
  value,
  onChange,
  min = 1,
  max = 1000,
  step = 1,
  balance = 0,
  currency = 'STX',
  disabled = false,
  showQuickSelect = true,
  showBalancePercentage = true,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false)

  // Quick select percentages
  const quickSelectOptions = useMemo(() => [
    { label: '25%', value: Math.floor(balance * 0.25) },
    { label: '50%', value: Math.floor(balance * 0.5) },
    { label: '75%', value: Math.floor(balance * 0.75) },
    { label: 'Max', value: Math.min(balance, max) }
  ], [balance, max])

  // Calculate percentage of balance
  const balancePercentage = useMemo(() => {
    if (!balance || balance === 0) return 0
    return Math.min(100, (value / balance) * 100)
  }, [value, balance])

  // Handle slider change
  const handleSliderChange = useCallback((e) => {
    const newValue = parseFloat(e.target.value)
    onChange(Math.min(newValue, max, balance))
  }, [onChange, max, balance])

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const inputValue = e.target.value
    if (inputValue === '') {
      onChange(min)
      return
    }
    const newValue = parseFloat(inputValue)
    if (!isNaN(newValue)) {
      onChange(Math.max(min, Math.min(newValue, max, balance)))
    }
  }, [onChange, min, max, balance])

  // Handle quick select
  const handleQuickSelect = useCallback((amount) => {
    const clampedValue = Math.max(min, Math.min(amount, max, balance))
    onChange(clampedValue)
  }, [onChange, min, max, balance])

  // Calculate slider fill percentage
  const fillPercentage = useMemo(() => {
    const effectiveMax = Math.min(max, balance)
    if (effectiveMax <= min) return 0
    return ((value - min) / (effectiveMax - min)) * 100
  }, [value, min, max, balance])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with input */}
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm text-gray-400">Bet Amount</label>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="number"
              value={value}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              min={min}
              max={Math.min(max, balance)}
              step={step}
              disabled={disabled}
              className={`w-28 px-3 py-2 pr-12 text-right rounded-lg bg-arena-darker border transition-colors font-mono tabular-nums ${
                isFocused 
                  ? 'border-arena-purple' 
                  : 'border-gray-700 hover:border-gray-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Bet amount"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          value={value}
          onChange={handleSliderChange}
          min={min}
          max={Math.min(max, balance)}
          step={step}
          disabled={disabled || balance === 0}
          className="w-full h-2 appearance-none bg-transparent cursor-pointer disabled:cursor-not-allowed relative z-10"
          style={{
            '--fill-percentage': `${fillPercentage}%`
          }}
          aria-label="Bet amount slider"
        />
        {/* Custom track */}
        <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gray-700 pointer-events-none">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-arena-purple to-arena-pink transition-all duration-150"
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min} {currency}</span>
        <span>{Math.min(max, balance).toLocaleString()} {currency}</span>
      </div>

      {/* Quick select buttons */}
      {showQuickSelect && (
        <div className="flex gap-2">
          {quickSelectOptions.map(({ label, value: optionValue }) => (
            <button
              key={label}
              onClick={() => handleQuickSelect(optionValue)}
              disabled={disabled || optionValue < min || balance === 0}
              className={`flex-1 py-2 px-3 text-sm rounded-lg transition-all ${
                value === optionValue
                  ? 'bg-arena-purple text-white'
                  : 'glass-card hover:bg-arena-purple/20 text-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Balance indicator */}
      {showBalancePercentage && balance > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Using <span className="text-white font-medium">{balancePercentage.toFixed(1)}%</span> of balance
          </span>
          <span className="text-gray-500">
            Balance: <span className="text-arena-green">{balance.toLocaleString()} {currency}</span>
          </span>
        </div>
      )}

      {/* Warning for high bet */}
      {balancePercentage > 80 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <span className="text-yellow-500">⚠️</span>
          <span className="text-sm text-yellow-400">
            You're betting more than 80% of your balance
          </span>
        </div>
      )}

      {/* Insufficient balance warning */}
      {value > balance && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <span className="text-red-500">❌</span>
          <span className="text-sm text-red-400">
            Insufficient balance
          </span>
        </div>
      )}
    </div>
  )
}

// Compact version for inline use
export const BetAmountInput = ({
  value,
  onChange,
  min = 1,
  max = 1000,
  balance = 0,
  currency = 'STX',
  disabled = false,
  className = ''
}) => {
  const [localValue, setLocalValue] = useState(value.toString())

  const handleChange = (e) => {
    setLocalValue(e.target.value)
    const numValue = parseFloat(e.target.value)
    if (!isNaN(numValue)) {
      onChange(Math.max(min, Math.min(numValue, max, balance)))
    }
  }

  const handleBlur = () => {
    const numValue = parseFloat(localValue)
    if (isNaN(numValue) || numValue < min) {
      setLocalValue(min.toString())
      onChange(min)
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={disabled || value <= min}
        className="w-8 h-8 rounded-lg glass-card hover:bg-arena-purple/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease amount"
      >
        −
      </button>
      <div className="relative">
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className="w-20 px-2 py-1 text-center rounded-lg bg-arena-darker border border-gray-700 font-mono disabled:opacity-50"
          aria-label="Bet amount"
        />
      </div>
      <button
        onClick={() => onChange(Math.min(max, balance, value + 1))}
        disabled={disabled || value >= Math.min(max, balance)}
        className="w-8 h-8 rounded-lg glass-card hover:bg-arena-purple/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase amount"
      >
        +
      </button>
      <span className="text-sm text-gray-500">{currency}</span>
    </div>
  )
}

export default BetAmountSlider
