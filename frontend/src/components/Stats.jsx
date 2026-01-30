import React, { useEffect, useState, useRef } from 'react'
import { StacksMainnet } from '@stacks/network'

import { CONFIG } from '../lib/config'
import { fetchStacksTipHeight } from '../lib/hiro'
import { readOnly } from '../lib/contract'

// Custom hook for counting animation
const useCountUp = (end, duration = 2000, startOnView = true) => {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!startOnView) {
      setHasStarted(true)
    }
  }, [startOnView])

  // Intersection Observer for starting animation when visible
  useEffect(() => {
    if (!startOnView || !ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasStarted, startOnView])

  // Counting animation
  useEffect(() => {
    if (!hasStarted || typeof end !== 'number') return

    let startTime = null
    const startValue = 0

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(startValue + (end - startValue) * easeOutQuart)
      
      setCount(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, hasStarted])

  return { count, ref }
}

const StatCard = ({ label, value, color, icon, index, isLoading }) => {
  const numericValue = typeof value === 'number' ? value : null
  const { count, ref } = useCountUp(numericValue, 2000)
  
  const displayValue = numericValue !== null 
    ? (numericValue >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toLocaleString())
    : value

  const colorClasses = {
    'arena-purple': 'text-purple-500',
    'arena-pink': 'text-pink-500',
    'arena-cyan': 'text-cyan-500',
    'arena-green': 'text-green-500'
  }

  return (
    <div 
      ref={ref}
      className={`market-card glass-card p-6 rounded-2xl transform transition-all duration-500 hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-${color}/20`}
      style={{ animationDelay: `${index * 100}ms` }}
      role="article"
      aria-label={`${label}: ${displayValue}`}
    >
      <div 
        className="text-2xl mb-3 transform hover:scale-125 hover:rotate-12 transition-transform inline-block cursor-default"
        role="img"
        aria-hidden="true"
      >
        {icon}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className={`text-2xl lg:text-3xl font-bold tabular-nums ${colorClasses[color] || 'text-white'}`}>
          {isLoading ? (
            <span className="inline-block w-16 h-8 bg-gray-700/50 rounded animate-pulse" />
          ) : (
            displayValue
          )}
        </p>
        {label === 'Total Volume' && !isLoading && (
          <span className="text-sm text-gray-500 font-medium">STX</span>
        )}
      </div>
    </div>
  )
}

const Stats = () => {
  const [stats, setStats] = useState({ volumeStx: 0, markets: 0, bets: 0, users: '-' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const network = new StacksMainnet()

    async function load() {
      try {
        setIsLoading(true)
        setError(null)
        
        // ping chain once to ensure API is reachable
        await fetchStacksTipHeight(CONFIG.hiroApiUrl)

        const senderAddress = CONFIG.contractAddress

        const [totalVolume, totalMarkets, totalBets] = await Promise.all([
          readOnly({
            network,
            contractAddress: CONFIG.contractAddress,
            contractName: CONFIG.contractName,
            functionName: 'get-total-volume',
            functionArgs: [],
            senderAddress,
          }),
          readOnly({
            network,
            contractAddress: CONFIG.contractAddress,
            contractName: CONFIG.contractName,
            functionName: 'get-total-markets',
            functionArgs: [],
            senderAddress,
          }),
          readOnly({
            network,
            contractAddress: CONFIG.contractAddress,
            contractName: CONFIG.contractName,
            functionName: 'get-total-bets',
            functionArgs: [],
            senderAddress,
          }),
        ])

        if (cancelled) return

        const volumeMicro = Number(totalVolume.value)
        setStats({
          volumeStx: volumeMicro / 1_000_000,
          markets: Number(totalMarkets.value),
          bets: Number(totalBets.value),
          users: '-',
        })
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          console.error('Failed to load stats:', err)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const statItems = [
    { label: 'Total Volume', value: stats.volumeStx, color: 'arena-purple', icon: '💎' },
    { label: 'Markets', value: stats.markets, color: 'arena-pink', icon: '🎯' },
    { label: 'Total Bets', value: stats.bets, color: 'arena-cyan', icon: '📊' },
    { label: 'Users', value: stats.users, color: 'arena-green', icon: '👥' }
  ]

  return (
    <section className="py-12" aria-label="Platform statistics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="text-center mb-4 text-yellow-500 text-sm">
            <span aria-live="polite">Stats may be outdated. Showing cached values.</span>
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statItems.map((stat, index) => (
            <StatCard
              key={stat.label}
              {...stat}
              index={index}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats
