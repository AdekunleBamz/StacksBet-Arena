import React, { useState, useMemo } from 'react'

const Leaderboard = () => {
  const [sortBy, setSortBy] = useState('profit')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedTrader, setSelectedTrader] = useState(null)

  const leaderboardData = [
    { rank: 1, address: 'SP2X7...8ABC', winRate: 78, totalBets: 156, volume: 12500, profit: 3250 },
    { rank: 2, address: 'SP3Y9...4DEF', winRate: 72, totalBets: 203, volume: 18200, profit: 2890 },
    { rank: 3, address: 'SP1Z3...7GHI', winRate: 69, totalBets: 98, volume: 8900, profit: 2150 },
    { rank: 4, address: 'SP4W2...1JKL', winRate: 65, totalBets: 145, volume: 11200, profit: 1820 },
    { rank: 5, address: 'SP5V8...9MNO', winRate: 63, totalBets: 87, volume: 6800, profit: 1540 },
    { rank: 6, address: 'SP6U1...2PQR', winRate: 61, totalBets: 112, volume: 9100, profit: 1280 },
    { rank: 7, address: 'SP7T4...5STU', winRate: 58, totalBets: 76, volume: 5400, profit: 980 },
    { rank: 8, address: 'SP8S7...8VWX', winRate: 56, totalBets: 134, volume: 10800, profit: 750 },
    { rank: 9, address: 'SP9R0...1YZA', winRate: 54, totalBets: 65, volume: 4200, profit: 620 },
    { rank: 10, address: 'SPA1B...4CDE', winRate: 52, totalBets: 89, volume: 7100, profit: 480 }
  ]

  // Sortable data with memoization
  const sortedData = useMemo(() => {
    const sorted = [...leaderboardData].sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
    })
    // Recalculate ranks based on current sort
    return sorted.map((item, idx) => ({ ...item, displayRank: idx + 1 }))
  }, [sortBy, sortOrder])

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return 'rank-gold'
    if (rank === 2) return 'rank-silver'
    if (rank === 3) return 'rank-bronze'
    return 'bg-arena-purple/20'
  }

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <span className="ml-1 text-gray-600">↕</span>
    return <span className="ml-1 text-arena-cyan">{sortOrder === 'desc' ? '↓' : '↑'}</span>
  }

  const columns = [
    { key: 'displayRank', label: 'Rank', sortable: false },
    { key: 'address', label: 'Trader', sortable: false },
    { key: 'winRate', label: 'Win Rate', sortable: true },
    { key: 'totalBets', label: 'Total Bets', sortable: true },
    { key: 'volume', label: 'Volume', sortable: true },
    { key: 'profit', label: 'Profit', sortable: true }
  ]

  const bonusCards = [
    { emoji: '🎯', title: 'Accuracy Bonus', description: '70%+ win rate earns bonus multiplier on rewards' },
    { emoji: '📈', title: 'Volume Rewards', description: 'Top 10 by volume share monthly prize pool' },
    { emoji: '🏅', title: 'Achievement NFTs', description: 'Unlock exclusive NFTs for trading milestones' }
  ]

  return (
    <section id="leaderboard" className="py-8" aria-label="Trader leaderboard">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">
          <span className="gradient-text">🏆 Leaderboard</span>
        </h2>
        <p className="text-gray-400">Top traders ranked by profit and win rate</p>
        <p className="text-sm text-gray-500 mt-2">
          Click column headers to sort • Currently sorted by: 
          <span className="text-arena-cyan ml-1 font-medium">
            {columns.find(c => c.key === sortBy)?.label || 'Profit'} ({sortOrder === 'desc' ? 'High to Low' : 'Low to High'})
          </span>
        </p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="grid" aria-label="Leaderboard table">
            <thead>
              <tr className="border-b border-arena-purple/20">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-6 py-4 text-left text-sm font-medium text-gray-400 ${
                      col.sortable ? 'cursor-pointer hover:text-white hover:bg-arena-purple/10 transition-colors select-none' : ''
                    }`}
                    onClick={() => col.sortable && handleSort(col.key)}
                    onKeyDown={(e) => col.sortable && e.key === 'Enter' && handleSort(col.key)}
                    tabIndex={col.sortable ? 0 : -1}
                    role={col.sortable ? 'columnheader button' : 'columnheader'}
                    aria-sort={sortBy === col.key ? (sortOrder === 'desc' ? 'descending' : 'ascending') : 'none'}
                  >
                    <span className="flex items-center">
                      {col.label}
                      {col.sortable && <SortIcon column={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-arena-purple/10">
              {sortedData.map((trader, index) => (
                <tr
                  key={trader.address}
                  className={`hover:bg-arena-purple/5 transition-all duration-200 cursor-pointer ${
                    selectedTrader === trader.address ? 'bg-arena-purple/10 ring-1 ring-arena-purple/30' : ''
                  }`}
                  onClick={() => setSelectedTrader(selectedTrader === trader.address ? null : trader.address)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedTrader(selectedTrader === trader.address ? null : trader.address)}
                  tabIndex={0}
                  role="row"
                  aria-selected={selectedTrader === trader.address}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <span 
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-transform hover:scale-110 ${getRankStyle(trader.displayRank)}`}
                      title={`Rank ${trader.displayRank}`}
                    >
                      {getRankEmoji(trader.displayRank)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-white hover:text-arena-cyan transition-colors">
                      {trader.address}
                    </span>
                    {trader.displayRank <= 3 && (
                      <span className="ml-2 text-xs bg-arena-purple/30 px-2 py-0.5 rounded-full">
                        Top 3
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-16 h-2 bg-arena-purple/20 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={trader.winRate}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Win rate: ${trader.winRate}%`}
                      >
                        <div 
                          className="h-full bg-gradient-to-r from-arena-green to-arena-cyan transition-all duration-500"
                          style={{ width: `${trader.winRate}%` }}
                        />
                      </div>
                      <span className={`font-medium ${trader.winRate >= 70 ? 'text-arena-green' : trader.winRate >= 60 ? 'text-arena-cyan' : 'text-gray-400'}`}>
                        {trader.winRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 tabular-nums">
                    {trader.totalBets.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-300 tabular-nums">
                    {trader.volume.toLocaleString()} STX
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-arena-green font-semibold tabular-nums">
                      +{trader.profit.toLocaleString()} STX
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trader Details Panel */}
      {selectedTrader && (
        <div 
          className="mt-4 glass-card p-6 rounded-2xl animate-fade-in"
          role="region"
          aria-label={`Details for trader ${selectedTrader}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Trader Details: <span className="font-mono text-arena-cyan">{selectedTrader}</span>
            </h3>
            <button
              onClick={() => setSelectedTrader(null)}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Close details panel"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            View full trading history, recent bets, and performance analytics coming soon.
          </p>
        </div>
      )}

      {/* Bonus Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {bonusCards.map((card, index) => (
          <div 
            key={card.title}
            className="glass-card p-6 rounded-2xl text-center transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-lg"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-3xl mb-2 transform hover:scale-125 hover:rotate-12 transition-transform inline-block">
              {card.emoji}
            </div>
            <h3 className="font-semibold mb-1">{card.title}</h3>
            <p className="text-sm text-gray-400">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Leaderboard
