import React, { useState } from 'react'
import { 
  HiArrowUp, 
  HiArrowDown, 
  HiExternalLink, 
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiRefresh
} from 'react-icons/hi'

/**
 * Transaction History components for displaying blockchain transactions
 */

// Transaction status config
const STATUS_CONFIG = {
  pending: {
    icon: HiClock,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    label: 'Pending'
  },
  success: {
    icon: HiCheckCircle,
    color: 'text-arena-green',
    bgColor: 'bg-arena-green/10',
    label: 'Success'
  },
  failed: {
    icon: HiXCircle,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    label: 'Failed'
  }
}

// Transaction type config
const TYPE_CONFIG = {
  bet_yes: {
    icon: HiArrowUp,
    label: 'Bet Yes',
    color: 'text-arena-green',
    description: 'Bet on YES outcome'
  },
  bet_no: {
    icon: HiArrowDown,
    label: 'Bet No',
    color: 'text-arena-pink',
    description: 'Bet on NO outcome'
  },
  claim: {
    icon: HiArrowDown,
    label: 'Claim',
    color: 'text-arena-cyan',
    description: 'Claimed winnings'
  },
  create_market: {
    icon: HiArrowUp,
    label: 'Create Market',
    color: 'text-arena-purple',
    description: 'Created a market'
  },
  resolve: {
    icon: HiCheckCircle,
    label: 'Resolve',
    color: 'text-arena-cyan',
    description: 'Resolved a market'
  }
}

// Single Transaction Item
const TransactionItem = ({
  tx,
  explorerUrl = 'https://explorer.hiro.so/txid/',
  onRetry,
  className = ''
}) => {
  const status = STATUS_CONFIG[tx.status] || STATUS_CONFIG.pending
  const type = TYPE_CONFIG[tx.type] || TYPE_CONFIG.bet_yes
  const StatusIcon = status.icon
  const TypeIcon = type.icon

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  const truncateHash = (hash) => `${hash.slice(0, 8)}...${hash.slice(-8)}`

  return (
    <div className={`
      flex items-center gap-4 p-4 rounded-xl
      bg-arena-card border border-gray-700/50
      hover:border-gray-600 transition-colors
      ${className}
    `}>
      {/* Type Icon */}
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center
        ${status.bgColor}
      `}>
        <TypeIcon className={`w-5 h-5 ${type.color}`} />
      </div>

      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{type.label}</span>
          {tx.marketTitle && (
            <span className="text-gray-500 truncate text-sm">
              • {tx.marketTitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-0.5">
          <span>{formatTime(tx.timestamp)}</span>
          {tx.txHash && (
            <>
              <span>•</span>
              <a
                href={`${explorerUrl}${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-arena-cyan transition-colors flex items-center gap-1"
              >
                {truncateHash(tx.txHash)}
                <HiExternalLink className="w-3 h-3" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      {tx.amount !== undefined && (
        <div className="text-right">
          <span className={`font-semibold ${
            tx.type.includes('claim') ? 'text-arena-green' : 'text-white'
          }`}>
            {tx.type.includes('claim') ? '+' : '-'}{tx.amount} STX
          </span>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className={`
          flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium
          ${status.bgColor} ${status.color}
        `}>
          {tx.status === 'pending' ? (
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <StatusIcon className="w-3.5 h-3.5" />
          )}
          {status.label}
        </span>
        
        {tx.status === 'failed' && onRetry && (
          <button
            onClick={() => onRetry(tx)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white 
                     hover:bg-gray-700/50 transition-colors"
            aria-label="Retry transaction"
          >
            <HiRefresh className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// Transaction History List
const TransactionHistory = ({
  transactions = [],
  loading = false,
  emptyMessage = 'No transactions yet',
  explorerUrl,
  onRetry,
  onLoadMore,
  hasMore = false,
  className = ''
}) => {
  if (loading && transactions.length === 0) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <TransactionSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className={`
        flex flex-col items-center justify-center py-12 text-center
        ${className}
      `}>
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <HiClock className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400">{emptyMessage}</p>
        <p className="text-sm text-gray-500 mt-1">
          Your transactions will appear here
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {transactions.map((tx, index) => (
        <TransactionItem
          key={tx.id || tx.txHash || index}
          tx={tx}
          explorerUrl={explorerUrl}
          onRetry={onRetry}
        />
      ))}
      
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="w-full py-3 rounded-xl text-center text-gray-400
                   hover:bg-gray-800/50 hover:text-white transition-colors
                   disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  )
}

// Transaction skeleton for loading state
const TransactionSkeleton = () => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-arena-card border border-gray-700/50 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-gray-700" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-700 rounded w-32" />
      <div className="h-3 bg-gray-700 rounded w-48" />
    </div>
    <div className="h-4 bg-gray-700 rounded w-20" />
  </div>
)

// Transaction Summary Card
export const TransactionSummary = ({
  totalBets,
  totalWins,
  netProfit,
  winRate,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      <div className="bg-arena-card border border-gray-700/50 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-1">Total Bets</p>
        <p className="text-2xl font-bold text-white">{totalBets}</p>
      </div>
      <div className="bg-arena-card border border-gray-700/50 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-1">Wins</p>
        <p className="text-2xl font-bold text-arena-green">{totalWins}</p>
      </div>
      <div className="bg-arena-card border border-gray-700/50 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-1">Win Rate</p>
        <p className="text-2xl font-bold text-white">{winRate}%</p>
      </div>
      <div className="bg-arena-card border border-gray-700/50 rounded-xl p-4">
        <p className="text-sm text-gray-400 mb-1">Net Profit</p>
        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-arena-green' : 'text-red-400'}`}>
          {netProfit >= 0 ? '+' : ''}{netProfit} STX
        </p>
      </div>
    </div>
  )
}

// Transaction Filter Tabs
export const TransactionFilters = ({
  activeFilter,
  onFilterChange,
  counts = {},
  className = ''
}) => {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'bets', label: 'Bets' },
    { id: 'claims', label: 'Claims' },
    { id: 'pending', label: 'Pending' }
  ]

  return (
    <div className={`flex gap-2 overflow-x-auto ${className}`}>
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`
            px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
            transition-all duration-200
            ${activeFilter === filter.id
              ? 'bg-arena-purple text-white'
              : 'bg-arena-card border border-gray-700 text-gray-400 hover:text-white'}
          `}
        >
          {filter.label}
          {counts[filter.id] !== undefined && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/10 text-xs">
              {counts[filter.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// Pending Transactions Indicator
export const PendingTransactions = ({
  transactions = [],
  onViewAll,
  className = ''
}) => {
  const pendingCount = transactions.filter(tx => tx.status === 'pending').length

  if (pendingCount === 0) return null

  return (
    <div className={`
      flex items-center justify-between p-3 rounded-xl
      bg-yellow-500/10 border border-yellow-500/30
      ${className}
    `}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
          <span className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <div>
          <p className="text-sm font-medium text-yellow-400">
            {pendingCount} pending transaction{pendingCount > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-yellow-400/70">
            Waiting for confirmation
          </p>
        </div>
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          View all
        </button>
      )}
    </div>
  )
}

// Recent Activity (compact)
export const RecentActivity = ({
  transactions = [],
  maxItems = 5,
  onViewAll,
  className = ''
}) => {
  const recentTxs = transactions.slice(0, maxItems)

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Recent Activity</h3>
        {onViewAll && transactions.length > maxItems && (
          <button
            onClick={onViewAll}
            className="text-sm text-arena-purple hover:text-arena-cyan transition-colors"
          >
            View all
          </button>
        )}
      </div>
      
      {recentTxs.length === 0 ? (
        <p className="text-sm text-gray-500">No recent activity</p>
      ) : (
        <div className="space-y-2">
          {recentTxs.map((tx, index) => {
            const type = TYPE_CONFIG[tx.type] || TYPE_CONFIG.bet_yes
            const TypeIcon = type.icon

            return (
              <div 
                key={tx.id || index}
                className="flex items-center gap-3 py-2"
              >
                <TypeIcon className={`w-4 h-4 ${type.color}`} />
                <span className="flex-1 text-sm text-gray-300 truncate">
                  {type.description}
                </span>
                {tx.amount && (
                  <span className="text-sm font-medium text-white">
                    {tx.amount} STX
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// useTransactionHistory hook
export const useTransactionHistory = (address) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const addTransaction = (tx) => {
    setTransactions(prev => [tx, ...prev])
  }

  const updateTransaction = (txHash, updates) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.txHash === txHash ? { ...tx, ...updates } : tx
      )
    )
  }

  const removeTransaction = (txHash) => {
    setTransactions(prev => prev.filter(tx => tx.txHash !== txHash))
  }

  const filterByType = (type) => {
    if (type === 'all') return transactions
    if (type === 'bets') return transactions.filter(tx => tx.type.includes('bet'))
    if (type === 'claims') return transactions.filter(tx => tx.type === 'claim')
    if (type === 'pending') return transactions.filter(tx => tx.status === 'pending')
    return transactions
  }

  const pendingCount = transactions.filter(tx => tx.status === 'pending').length

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    removeTransaction,
    filterByType,
    pendingCount
  }
}

export default TransactionHistory
