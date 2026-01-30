import React, { useMemo } from 'react'

/**
 * Progress indicator components for market odds visualization
 * Shows Yes/No distribution with animated bars
 */

// Main odds bar component
const OddsBar = ({
  yesPercent = 50,
  noPercent = 50,
  yesAmount = 0,
  noAmount = 0,
  currency = 'STX',
  showLabels = true,
  showAmounts = true,
  animate = true,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = ''
}) => {
  // Ensure percentages are valid
  const safeYes = useMemo(() => Math.max(0, Math.min(100, yesPercent)), [yesPercent])
  const safeNo = useMemo(() => Math.max(0, Math.min(100, noPercent)), [noPercent])

  const sizes = {
    sm: { height: 'h-2', text: 'text-xs', gap: 'gap-1' },
    md: { height: 'h-3', text: 'text-sm', gap: 'gap-2' },
    lg: { height: 'h-4', text: 'text-base', gap: 'gap-3' }
  }

  const { height, text, gap } = sizes[size]

  return (
    <div className={className}>
      {/* Labels */}
      {showLabels && (
        <div className={`flex justify-between ${text} mb-2`}>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-arena-green" aria-hidden="true" />
            <span className="text-arena-green font-medium">Yes</span>
            <span className="text-white font-bold">{safeYes.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{safeNo.toFixed(1)}%</span>
            <span className="text-arena-pink font-medium">No</span>
            <span className="w-3 h-3 rounded-full bg-arena-pink" aria-hidden="true" />
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div 
        className={`flex ${height} rounded-full overflow-hidden bg-gray-800`}
        role="progressbar"
        aria-valuenow={safeYes}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Yes: ${safeYes}%, No: ${safeNo}%`}
      >
        <div
          className={`bg-gradient-to-r from-arena-green to-emerald-400 ${animate ? 'transition-all duration-500' : ''}`}
          style={{ width: `${safeYes}%` }}
        />
        <div
          className={`bg-gradient-to-r from-rose-400 to-arena-pink ${animate ? 'transition-all duration-500' : ''}`}
          style={{ width: `${safeNo}%` }}
        />
      </div>

      {/* Amounts */}
      {showAmounts && (
        <div className={`flex justify-between ${text} text-gray-400 mt-2`}>
          <span>{yesAmount.toLocaleString()} {currency}</span>
          <span>{noAmount.toLocaleString()} {currency}</span>
        </div>
      )}
    </div>
  )
}

// Circular progress for single value
export const CircularProgress = ({
  value = 0,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = 'arena-purple',
  label,
  showValue = true,
  className = ''
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const colorMap = {
    'arena-purple': '#8B5CF6',
    'arena-pink': '#EC4899',
    'arena-green': '#10B981',
    'arena-cyan': '#06B6D4'
  }

  return (
    <div className={`relative inline-flex ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color] || color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span className="text-lg font-bold text-white">{percentage.toFixed(0)}%</span>
        )}
        {label && (
          <span className="text-xs text-gray-400">{label}</span>
        )}
      </div>
    </div>
  )
}

// Segmented progress for multiple values
export const SegmentedProgress = ({
  segments = [],
  total,
  height = 'h-6',
  showLabels = true,
  className = ''
}) => {
  const calculatedTotal = total || segments.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className={className}>
      {/* Bar */}
      <div className={`flex ${height} rounded-full overflow-hidden bg-gray-800`}>
        {segments.map((segment, index) => {
          const percentage = calculatedTotal > 0 ? (segment.value / calculatedTotal) * 100 : 0
          return (
            <div
              key={index}
              className="transition-all duration-500"
              style={{ 
                width: `${percentage}%`,
                backgroundColor: segment.color
              }}
              title={`${segment.label}: ${percentage.toFixed(1)}%`}
            />
          )
        })}
      </div>

      {/* Legend */}
      {showLabels && (
        <div className="flex flex-wrap gap-4 mt-3">
          {segments.map((segment, index) => {
            const percentage = calculatedTotal > 0 ? (segment.value / calculatedTotal) * 100 : 0
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-gray-400">{segment.label}</span>
                <span className="text-white font-medium">{percentage.toFixed(1)}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Step progress indicator
export const StepProgress = ({
  steps = [],
  currentStep = 0,
  className = ''
}) => (
  <div className={`flex items-center ${className}`}>
    {steps.map((step, index) => {
      const isCompleted = index < currentStep
      const isCurrent = index === currentStep
      const isLast = index === steps.length - 1

      return (
        <React.Fragment key={index}>
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                isCompleted
                  ? 'bg-arena-green text-white'
                  : isCurrent
                  ? 'bg-arena-purple text-white ring-2 ring-arena-purple/50'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            {step.label && (
              <span className={`mt-2 text-xs ${isCurrent ? 'text-white' : 'text-gray-500'}`}>
                {step.label}
              </span>
            )}
          </div>

          {/* Connector line */}
          {!isLast && (
            <div 
              className={`flex-1 h-0.5 mx-2 transition-colors ${
                isCompleted ? 'bg-arena-green' : 'bg-gray-700'
              }`}
            />
          )}
        </React.Fragment>
      )
    })}
  </div>
)

// Loading progress bar
export const LoadingBar = ({
  isLoading = true,
  className = ''
}) => (
  <div className={`h-1 w-full bg-gray-800 overflow-hidden ${className}`}>
    {isLoading && (
      <div className="h-full w-1/3 bg-gradient-to-r from-arena-purple to-arena-pink animate-loading-bar" />
    )}
  </div>
)

export default OddsBar
