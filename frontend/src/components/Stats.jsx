import React, { useEffect, useState } from 'react'
import { StacksMainnet } from '@stacks/network'

import { CONFIG } from '../lib/config'
import { fetchStacksTipHeight } from '../lib/hiro'
import { readOnly } from '../lib/contract'

const Stats = () => {
  const [stats, setStats] = useState({ volumeStx: 0, markets: 0, bets: 0, users: '-' })

  useEffect(() => {
    let cancelled = false
    const network = new StacksMainnet()

    async function load() {
      try {
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
      } catch {
        // Keep defaults on failure.
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const formatNumber = (num) => (typeof num === 'number' && num >= 1000 ? `${(num / 1000).toFixed(1)}K` : `${num}`)
  const formatStx = (stx) => (typeof stx === 'number' ? stx.toLocaleString(undefined, { maximumFractionDigits: 2 }) : `${stx}`)

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            { label: 'Total Volume', value: `${formatStx(stats.volumeStx)} STX`, color: 'arena-purple', icon: '💎' },
            { label: 'Markets', value: formatNumber(stats.markets), color: 'arena-pink', icon: '🎯' },
            { label: 'Total Bets', value: formatNumber(stats.bets), color: 'arena-cyan', icon: '📊' },
            { label: 'Users', value: formatNumber(stats.users), color: 'arena-green', icon: '👥' }
          ].map((stat, i) => (
            <div key={i} className="market-card glass-card p-6 rounded-2xl">
              <div className="text-2xl mb-3">{stat.icon}</div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className={`text-2xl lg:text-3xl font-bold text-${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats
