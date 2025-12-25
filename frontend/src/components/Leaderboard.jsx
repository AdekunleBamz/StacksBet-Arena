import React from 'react'

const Leaderboard = () => {
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

  return (
    <section id="leaderboard" className="py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2"><span className="gradient-text">🏆 Leaderboard</span></h2>
        <p className="text-gray-400">Top traders ranked by profit and win rate</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-arena-purple/20">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Trader</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Win Rate</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Total Bets</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Volume</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arena-purple/10">
              {leaderboardData.map((trader) => (
                <tr key={trader.rank} className="hover:bg-arena-purple/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${getRankStyle(trader.rank)}`}>
                      {getRankEmoji(trader.rank)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-white">{trader.address}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-arena-purple/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-arena-green to-arena-cyan" style={{ width: `${trader.winRate}%` }} />
                      </div>
                      <span className="text-arena-green font-medium">{trader.winRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{trader.totalBets}</td>
                  <td className="px-6 py-4 text-gray-300">{trader.volume.toLocaleString()} STX</td>
                  <td className="px-6 py-4">
                    <span className="text-arena-green font-semibold">+{trader.profit.toLocaleString()} STX</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-6 rounded-2xl text-center">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="font-semibold mb-1">Accuracy Bonus</h3>
          <p className="text-sm text-gray-400">70%+ win rate earns bonus multiplier on rewards</p>
        </div>
        <div className="glass-card p-6 rounded-2xl text-center">
          <div className="text-3xl mb-2">📈</div>
          <h3 className="font-semibold mb-1">Volume Rewards</h3>
          <p className="text-sm text-gray-400">Top 10 by volume share monthly prize pool</p>
        </div>
        <div className="glass-card p-6 rounded-2xl text-center">
          <div className="text-3xl mb-2">🏅</div>
          <h3 className="font-semibold mb-1">Achievement NFTs</h3>
          <p className="text-sm text-gray-400">Unlock exclusive NFTs for trading milestones</p>
        </div>
      </div>
    </section>
  )
}

export default Leaderboard
