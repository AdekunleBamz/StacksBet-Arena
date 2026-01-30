import React, { useRef, useEffect, useState } from 'react'

/**
 * Lightweight Chart components using Canvas API
 * No external dependencies required
 */

// Simple Line Chart
const LineChart = ({
  data = [],
  width = 400,
  height = 200,
  color = '#8B5CF6', // arena-purple
  fillColor = 'rgba(139, 92, 246, 0.1)',
  showGrid = true,
  showDots = true,
  showTooltip = true,
  animate = true,
  className = ''
}) => {
  const canvasRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [animationProgress, setAnimationProgress] = useState(animate ? 0 : 1)

  useEffect(() => {
    if (animate) {
      let start = null
      const duration = 1000
      
      const animateChart = (timestamp) => {
        if (!start) start = timestamp
        const progress = Math.min((timestamp - start) / duration, 1)
        setAnimationProgress(progress)
        
        if (progress < 1) {
          requestAnimationFrame(animateChart)
        }
      }
      
      requestAnimationFrame(animateChart)
    }
  }, [animate, data])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return
    
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    const padding = { top: 20, right: 20, bottom: 30, left: 50 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    
    const values = data.map(d => d.value)
    const minVal = Math.min(...values)
    const maxVal = Math.max(...values)
    const range = maxVal - minVal || 1
    
    const xScale = (i) => padding.left + (i / (data.length - 1)) * chartWidth
    const yScale = (v) => padding.top + chartHeight - ((v - minVal) / range) * chartHeight
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)'
      ctx.lineWidth = 1
      
      // Horizontal lines
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (i / 4) * chartHeight
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(width - padding.right, y)
        ctx.stroke()
      }
    }
    
    // Draw filled area
    ctx.beginPath()
    ctx.moveTo(xScale(0), chartHeight + padding.top)
    
    for (let i = 0; i < data.length * animationProgress; i++) {
      ctx.lineTo(xScale(i), yScale(values[i]))
    }
    
    const lastIndex = Math.floor((data.length - 1) * animationProgress)
    ctx.lineTo(xScale(lastIndex), chartHeight + padding.top)
    ctx.closePath()
    ctx.fillStyle = fillColor
    ctx.fill()
    
    // Draw line
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    
    for (let i = 0; i < data.length * animationProgress; i++) {
      if (i === 0) {
        ctx.moveTo(xScale(i), yScale(values[i]))
      } else {
        ctx.lineTo(xScale(i), yScale(values[i]))
      }
    }
    ctx.stroke()
    
    // Draw dots
    if (showDots && animationProgress === 1) {
      data.forEach((d, i) => {
        ctx.beginPath()
        ctx.arc(xScale(i), yScale(d.value), 4, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = '#0F1419'
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }
    
    // Draw Y-axis labels
    ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'right'
    
    for (let i = 0; i <= 4; i++) {
      const value = minVal + (range / 4) * (4 - i)
      const y = padding.top + (i / 4) * chartHeight
      ctx.fillText(value.toFixed(1), padding.left - 8, y + 3)
    }
    
  }, [data, width, height, color, fillColor, showGrid, showDots, animationProgress])

  const handleMouseMove = (e) => {
    if (!showTooltip || data.length === 0) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    
    const padding = 50
    const chartWidth = width - padding - 20
    const index = Math.round((x - padding) / chartWidth * (data.length - 1))
    
    if (index >= 0 && index < data.length) {
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        data: data[index]
      })
    }
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width, height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      />
      
      {tooltip && (
        <div 
          className="absolute z-10 px-2 py-1 text-xs bg-arena-card border border-gray-700 
                   rounded-lg shadow-lg pointer-events-none"
          style={{ 
            left: tooltip.x + 10, 
            top: tooltip.y - 30,
            transform: 'translateX(-50%)'
          }}
        >
          <p className="text-white font-medium">{tooltip.data.value}</p>
          {tooltip.data.label && (
            <p className="text-gray-400">{tooltip.data.label}</p>
          )}
        </div>
      )}
    </div>
  )
}

// Bar Chart
export const BarChart = ({
  data = [],
  width = 400,
  height = 200,
  barColor = '#8B5CF6',
  showLabels = true,
  showValues = true,
  animate = true,
  className = ''
}) => {
  const canvasRef = useRef(null)
  const [animationProgress, setAnimationProgress] = useState(animate ? 0 : 1)

  useEffect(() => {
    if (animate) {
      let start = null
      const duration = 800
      
      const animateChart = (timestamp) => {
        if (!start) start = timestamp
        const progress = Math.min((timestamp - start) / duration, 1)
        setAnimationProgress(progress)
        
        if (progress < 1) {
          requestAnimationFrame(animateChart)
        }
      }
      
      requestAnimationFrame(animateChart)
    }
  }, [animate, data])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return
    
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    
    ctx.clearRect(0, 0, width, height)
    
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    
    const maxVal = Math.max(...data.map(d => d.value))
    const barWidth = chartWidth / data.length * 0.7
    const gap = chartWidth / data.length * 0.3
    
    data.forEach((d, i) => {
      const barHeight = (d.value / maxVal) * chartHeight * animationProgress
      const x = padding.left + i * (barWidth + gap) + gap / 2
      const y = padding.top + chartHeight - barHeight
      
      // Draw bar with gradient
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
      gradient.addColorStop(0, d.color || barColor)
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)')
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0])
      ctx.fill()
      
      // Draw label
      if (showLabels && animationProgress === 1) {
        ctx.fillStyle = 'rgba(156, 163, 175, 0.8)'
        ctx.font = '10px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(d.label, x + barWidth / 2, height - 10)
      }
      
      // Draw value
      if (showValues && animationProgress === 1) {
        ctx.fillStyle = 'white'
        ctx.font = '11px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(d.value.toString(), x + barWidth / 2, y - 5)
      }
    })
  }, [data, width, height, barColor, showLabels, showValues, animationProgress])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width, height }}
      className={className}
    />
  )
}

// Donut Chart
export const DonutChart = ({
  data = [],
  size = 200,
  thickness = 30,
  centerLabel,
  centerValue,
  showLegend = true,
  animate = true,
  className = ''
}) => {
  const canvasRef = useRef(null)
  const [animationProgress, setAnimationProgress] = useState(animate ? 0 : 1)

  useEffect(() => {
    if (animate) {
      let start = null
      const duration = 1000
      
      const animateChart = (timestamp) => {
        if (!start) start = timestamp
        const progress = Math.min((timestamp - start) / duration, 1)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setAnimationProgress(eased)
        
        if (progress < 1) {
          requestAnimationFrame(animateChart)
        }
      }
      
      requestAnimationFrame(animateChart)
    }
  }, [animate, data])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return
    
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)
    
    ctx.clearRect(0, 0, size, size)
    
    const centerX = size / 2
    const centerY = size / 2
    const radius = (size - thickness) / 2
    
    const total = data.reduce((sum, d) => sum + d.value, 0)
    let currentAngle = -Math.PI / 2
    
    data.forEach((d) => {
      const sliceAngle = (d.value / total) * Math.PI * 2 * animationProgress
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      ctx.strokeStyle = d.color
      ctx.lineWidth = thickness
      ctx.lineCap = 'butt'
      ctx.stroke()
      
      currentAngle += sliceAngle
    })
  }, [data, size, thickness, animationProgress])

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          style={{ width: size, height: size }}
        />
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && (
              <span className="text-2xl font-bold text-white">{centerValue}</span>
            )}
            {centerLabel && (
              <span className="text-sm text-gray-400">{centerLabel}</span>
            )}
          </div>
        )}
      </div>
      
      {showLegend && (
        <div className="space-y-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: d.color }}
              />
              <span className="text-sm text-gray-400">{d.label}</span>
              <span className="text-sm font-medium text-white ml-auto">
                {d.value}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Sparkline (mini line chart)
export const Sparkline = ({
  data = [],
  width = 100,
  height = 30,
  color = '#22C55E',
  showChange = true,
  className = ''
}) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return
    
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    
    ctx.clearRect(0, 0, width, height)
    
    const minVal = Math.min(...data)
    const maxVal = Math.max(...data)
    const range = maxVal - minVal || 1
    
    const xScale = (i) => (i / (data.length - 1)) * width
    const yScale = (v) => height - ((v - minVal) / range) * height
    
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.lineJoin = 'round'
    
    data.forEach((v, i) => {
      if (i === 0) {
        ctx.moveTo(xScale(i), yScale(v))
      } else {
        ctx.lineTo(xScale(i), yScale(v))
      }
    })
    ctx.stroke()
  }, [data, width, height, color])

  const change = data.length >= 2 
    ? ((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(1)
    : 0

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width, height }}
      />
      {showChange && (
        <span className={`text-sm font-medium ${
          change >= 0 ? 'text-arena-green' : 'text-red-400'
        }`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
  )
}

// Market Odds Chart
export const OddsChart = ({
  yesPercentage,
  noPercentage,
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-arena-green font-medium">{yesPercentage}% Yes</span>
        <span className="text-arena-pink font-medium">{noPercentage}% No</span>
      </div>
      <div className={`${sizes[size]} bg-gray-700 rounded-full overflow-hidden flex`}>
        <div 
          className="bg-gradient-to-r from-arena-green to-arena-green/80 transition-all duration-500"
          style={{ width: `${yesPercentage}%` }}
        />
        <div 
          className="bg-gradient-to-r from-arena-pink/80 to-arena-pink transition-all duration-500"
          style={{ width: `${noPercentage}%` }}
        />
      </div>
    </div>
  )
}

// Price History Chart for markets
export const PriceHistoryChart = ({
  data = [],
  timeRange = '7d',
  onTimeRangeChange,
  className = ''
}) => {
  const timeRanges = ['1d', '7d', '30d', 'all']

  const latestPrice = data.length > 0 ? data[data.length - 1].value : 0
  const firstPrice = data.length > 0 ? data[0].value : 0
  const priceChange = firstPrice !== 0 
    ? ((latestPrice - firstPrice) / firstPrice * 100).toFixed(1) 
    : 0

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-2xl font-bold text-white">{latestPrice}%</span>
          <span className={`ml-2 text-sm ${priceChange >= 0 ? 'text-arena-green' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange}%
          </span>
        </div>
        
        {onTimeRangeChange && (
          <div className="flex gap-1">
            {timeRanges.map(range => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-arena-purple text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <LineChart
        data={data}
        width={500}
        height={200}
        color={priceChange >= 0 ? '#22C55E' : '#EC4899'}
        fillColor={priceChange >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(236, 72, 153, 0.1)'}
      />
    </div>
  )
}

export default LineChart
